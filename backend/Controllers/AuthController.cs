using System.Net;
using backend.DTOs;
using backend.Services;
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
                Secure = false, // Set to false for development over HTTP  
                SameSite = SameSiteMode.None // None allows cross-site cookies for localhost
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

        var token = await _authService.RefreshAccessToken(refreshToken);
        if (token == null)
        {
            return Unauthorized("Invalid refresh token");
        }

        return Ok(new { AccessToken = token });
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
                Secure = false, // Set to false for development over HTTP  
                SameSite = SameSiteMode.None // None allows cross-site cookies for localhost
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
            var accessToken = await _authService.RefreshAccessToken(refreshToken);
            if (accessToken == null)
            {
                Response.Cookies.Delete("refreshToken");
                return Unauthorized(new { success = false, message = "Invalid refresh token" });
            }

            return Ok(new { success = true, token = accessToken });
        }
        catch (Exception ex)
        {
            Response.Cookies.Delete("refreshToken");
            return Unauthorized(new { success = false, message = ex.Message });
        }
    }
}