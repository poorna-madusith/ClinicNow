using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;


//normal signup
public class AuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
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
            Address = userRegisterDto.Address
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

    public async Task<string> Login(UserLoginDto loginDto)
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

        return GenerateJwtToken(user);
    }

    //google login
    public async Task<string> GoogleSignupSignin(GoogleLoginDto googleLoginDto)
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
        return GenerateJwtToken(user);// return generated token
    }


    //generate jwt token 
    private string GenerateJwtToken(ApplicationUser user)
    {
        var keyString = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);


        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? throw new InvalidOperationException("User email is null")),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };


        var durationString = _config["Jwt:DurationInMinutes"] ?? throw new InvalidOperationException("JWT Duration is not configured");
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(durationString)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


}