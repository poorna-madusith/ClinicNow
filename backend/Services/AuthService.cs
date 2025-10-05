using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;


//normal signup
public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDBContext _context;
    private readonly IConfiguration _config;

    public AuthService(UserManager<ApplicationUser> userManager, ApplicationDBContext context, IConfiguration config)
    {
        _userManager = userManager;
        _context = context;
        _config = config;
    }


    public async Task AddAdmin()
    { 
        var admin = new ApplicationUser
        {
            FirstName = "ClinicNow",
            LastName = "Admin",
            Email = "admin@gmail.com", // Changed to lowercase
            UserName = "admin@gmail.com", // Changed to lowercase
            Role = RoleEnum.Admin,
            Age = null,
            Gender = null,
            Town = null,
            Address = null
        };

        var existingAdmin = await _userManager.FindByEmailAsync(admin.Email);
        if (existingAdmin != null)
        {
            throw new Exception("Admin user already exists");
        }

        // Create admin user with a default password
        var result = await _userManager.CreateAsync(admin, "Admin123@"); // You should use a more secure password
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"User creation failed: {errors}");
        }

        // Add admin to the Admin role
        var roleResult = await _userManager.AddToRoleAsync(admin, admin.Role.ToString());
        if (!roleResult.Succeeded)
        {
            var roleErrors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            throw new Exception($"Role assignment failed: {roleErrors}");
        }
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

    //refresh token
    public async Task<string?> RefreshAccessToken(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(
            t => t.Token == refreshToken && !t.IsRevoked
        );

        if (storedToken == null || storedToken.Expires < DateTime.UtcNow)
        {
            return null;
        }

        // Revoke the used refresh token
        storedToken.IsRevoked = true;
        await _context.SaveChangesAsync();

        var user = await _userManager.FindByIdAsync(storedToken.UserId);
        if (user == null) return null;

        // Optionally, generate a new refresh token here and return it if you want rotation
        return GenerateJwtToken(user);
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


}