using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;


//normal signup
public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDBContext _context;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthService(UserManager<ApplicationUser> userManager, ApplicationDBContext context, IConfiguration config, IEmailService emailService)
    {
        _userManager = userManager;
        _context = context;
        _config = config;
        _emailService = emailService;
    }

    public async Task<string> UserRegister(UserRegisterDto userRegisterDto)
    {
        var user = new ApplicationUser
        {
            FirstName = userRegisterDto.FirstName,
            LastName = userRegisterDto.LastName,
            Email = userRegisterDto.Email,
            Role = RoleEnum.Patient,
            Age = userRegisterDto.Age,
            Gender = userRegisterDto.Gender,
            Town = userRegisterDto.Town,
            Address = userRegisterDto.Address,
            ContactNumbers = userRegisterDto.ContactNumbers
        };
        user.UserName = userRegisterDto.Email;

        var existingUser = await _userManager.FindByEmailAsync(user.Email);
        if (existingUser != null)
        {
            throw new Exception("User already exists");
        }
        var result = await _userManager.CreateAsync(user, userRegisterDto.Password);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(user, user.Role.ToString());//set the user role
        return GenerateJwtToken(user);// return generated token
    }


    //normal email password login

    public async Task<(string accessToken, string RefreshToken, string role)> Login(UserLoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            throw new Exception("User not found");
        }
        var isValidPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!isValidPassword)
        {
            throw new Exception("Invalid password");
        }

        var accessToken = GenerateJwtToken(user);

        // Revoke all previous refresh tokens for this user
        var oldTokens = _context.RefreshTokens.Where(t => t.UserId == user.Id && !t.IsRevoked && t.Expires > DateTime.UtcNow);
        foreach (var oldToken in oldTokens)
        {
            oldToken.IsRevoked = true;
        }

        var refreshToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Expires = DateTime.UtcNow.AddDays(7), // Refresh token valid for 7 days
            IsRevoked = false
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return (accessToken, refreshToken.Token, user.Role.ToString());

    }

    //refresh token with rotation
    public async Task<(string accessToken, string refreshToken)?> RefreshAccessToken(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(
            t => t.Token == refreshToken && !t.IsRevoked
        );

        if (storedToken == null || storedToken.Expires < DateTime.UtcNow)
        {
            return null;
        }

        var user = await _userManager.FindByIdAsync(storedToken.UserId);
        if (user == null) return null;

        // Revoke the used refresh token
        storedToken.IsRevoked = true;

        // Issue a new refresh token (rotation)
        var newRefreshToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = storedToken.UserId,
            Expires = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        var newAccessToken = GenerateJwtToken(user);
        return (newAccessToken, newRefreshToken.Token);
    }

    //google login
    public async Task<(string accessToken, string refreshToken, string role)> GoogleSignupSignin(GoogleLoginDto googleLoginDto)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(googleLoginDto.IdToken);
        var user = await _userManager.FindByEmailAsync(payload.Email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                FirstName = payload.GivenName ?? "ClinicUser",
                LastName = payload.FamilyName ?? "ClinicUser",
                Email = payload.Email,
                UserName = payload.Email, // Set UserName for Identity
                Role = RoleEnum.Patient,
                Age = null,
                Gender = null,
                Town = null,
                Address = null
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, user.Role.ToString());//set the user role
        }

        var accessToken = GenerateJwtToken(user);

        // Revoke all previous refresh tokens for this user
        var oldTokens = _context.RefreshTokens.Where(t => t.UserId == user.Id && !t.IsRevoked && t.Expires > DateTime.UtcNow);
        foreach (var oldToken in oldTokens)
        {
            oldToken.IsRevoked = true;
        }

        var refreshToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            Expires = DateTime.UtcNow.AddDays(7), // Refresh token valid for 7 days
            IsRevoked = false
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return (accessToken, refreshToken.Token, user.Role.ToString());
    }


    //generate jwt token 
    private string GenerateJwtToken(ApplicationUser user)
    {
        var keyString = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? throw new InvalidOperationException("User email is null")),
            new Claim("id", user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Id),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var durationString = _config["Jwt:DurationInMinutes"];
        if (string.IsNullOrWhiteSpace(durationString) || !double.TryParse(durationString, out var durationMinutes))
        {
            throw new InvalidOperationException("JWT Duration is not configured or invalid");
        }
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(durationMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


    //update profile
    public async Task UserProfileUpdate(string userId, UserProfileUpdateDto userupdateDto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        user.FirstName = userupdateDto.FirstName;
        user.LastName = userupdateDto.LastName;
        user.Age = userupdateDto.Age;
        user.Gender = userupdateDto.Gender;
        user.Town = userupdateDto.Town;
        user.Address = userupdateDto.Address;
        user.ContactNumbers = userupdateDto.ContactNumbers;
        user.Email = userupdateDto.Email;
        user.UserName = userupdateDto.Email;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new Exception("Failed to update user profile: " + string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }


    //update doctorProfile
    public async Task DoctorprofileUpdate(string doctorId, DoctorUpdateDto registerDto)
    {
        var doctor = await _userManager.FindByIdAsync(doctorId);
        if (doctor == null)
        {
            throw new Exception("Doctor not found");
        }

        doctor.FirstName = registerDto.FirstName;
        doctor.LastName = registerDto.LastName;
        doctor.Age = registerDto.Age;
        doctor.Gender = registerDto.Gender;
        doctor.Address = registerDto.Address;
        doctor.Specialization = registerDto.Specialization;
        doctor.DocDescription = registerDto.DocDescription;
        doctor.ProfileImageUrl = registerDto.ProfileImageUrl;
        doctor.ContactEmail = registerDto.ContactEmail;
        doctor.ContactNumbers = registerDto.ContactNumbers;
        doctor.Email = registerDto.Email;
        doctor.UserName = registerDto.Email;

        var result = await _userManager.UpdateAsync(doctor);
        if (!result.Succeeded)
        {
            throw new Exception("Failed to update doctor profile: " + string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }


    //get logged in user details
    public async Task<UserDetailsDto> GetLoggedInUserDetails(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        return new UserDetailsDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            Age = user.Age,
            Gender = user.Gender,
            Town = user.Town,
            Address = user.Address,
            ContactNumbers = user.ContactNumbers,
            Specialization = user.Specialization,
            DocDescription = user.DocDescription,
            ProfileImageUrl = user.ProfileImageUrl,
            ContactEmail = user.ContactEmail
        };
    }

    // Forgot Password - Generate reset token and send email
    public async Task<bool> ForgotPassword(string email, string resetUrl)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // Don't reveal that the user does not exist
            return true;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetLink = $"{resetUrl}?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

        await _emailService.SendPasswordResetEmailAsync(email, resetLink);
        return true;
    }

    // Reset Password - Validate token and update password
    public async Task<bool> ResetPassword(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            throw new Exception("Invalid password reset request");
        }

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Password reset failed: {errors}");
        }

        return true;
    }


}