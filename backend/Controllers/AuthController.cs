using System.Net;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }


    [HttpPost("addadmin")]
    public async Task<IActionResult> AddAdmin()
    {
        try
        {
            await _authService.AddAdmin();
            return Ok(new { Message = "Admin user added successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    //user registration only for patients
    [HttpPost("userregister")]
    public async Task<IActionResult> UserRegister([FromBody] UserRegisterDto userRegisterDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var token = await _authService.UserRegister(userRegisterDto);
            return Ok(new { Token = token });

        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    //login: returns access token, sets refresh token in cookie
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (access, refresh, role) = await _authService.Login(loginDto);

            Response.Cookies.Append("refreshToken", refresh, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Secure = false, // Dev over HTTP
                SameSite = SameSiteMode.Lax // Lax plays nicer on localhost without HTTPS
            });

            return Ok(new { AccessToken = access, Role = role });// return access token and role
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    //refrsh token
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null)
        {
            return Unauthorized("No refresh token provided");
        }

        var rotated = await _authService.RefreshAccessToken(refreshToken);
        if (rotated == null)
        {
            return Unauthorized("Invalid refresh token");
        }

        Response.Cookies.Append("refreshToken", rotated.Value.refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Secure = false,
            SameSite = SameSiteMode.Lax
        });

        return Ok(new { AccessToken = rotated.Value.accessToken });
    }


    //google login singup oAuth
    [HttpPost("googlelogin")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto googleLoginDto)
    {
        try
        {
            var (access, refresh, role) = await _authService.GoogleSignupSignin(googleLoginDto);

            Response.Cookies.Append("refreshToken", refresh, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Secure = false, // Dev over HTTP
                SameSite = SameSiteMode.Lax
            });

            return Ok(new { AccessToken = access, Role = role });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }



    //logout
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("refreshToken");
        return Ok(new { Message = "Logged out successfully" });
    }


    [HttpGet("verify")]
    public async Task<IActionResult> VerifyToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null)
        {
            return Unauthorized("No refresh token provided");
        }

        try
        {
            var rotated = await _authService.RefreshAccessToken(refreshToken);
            if (rotated == null)
            {
                Response.Cookies.Delete("refreshToken");
                return Unauthorized(new { success = false, message = "Invalid refresh token" });
            }

            Response.Cookies.Append("refreshToken", rotated.Value.refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Secure = false,
                SameSite = SameSiteMode.Lax
            });

            return Ok(new { success = true, token = rotated.Value.accessToken });
        }
        catch (Exception ex)
        {
            Response.Cookies.Delete("refreshToken");
            return Unauthorized(new { success = false, message = ex.Message });
        }
    }


    //user profile update
    [HttpPut("userprofileupdate/{userId}")]
    public async Task<IActionResult> UserProfileUpdate(string userId, [FromBody] UserProfileUpdateDto userupdateDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _authService.UserProfileUpdate(userId, userupdateDto);
            return Ok(new { Message = "User profile updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    //doctor profile update
    [HttpPut("doctorprofileupdate/{doctorId}")]
    [Authorize (Roles = "Doctor, Admin")]
    public async Task<IActionResult> DoctorProfileUpdate(string doctorId, [FromBody] DoctorUpdateDto doctorUpdateDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _authService.DoctorprofileUpdate(doctorId, doctorUpdateDto);
            return Ok(new { Message = "Doctor profile updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}