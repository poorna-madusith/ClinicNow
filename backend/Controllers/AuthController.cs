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
                Secure = true,
                SameSite = SameSiteMode.Strict
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

        return Ok(new { AccessToken  = token });
    }


    //google login singup oAuth
    [HttpPost("googlelogin")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto googleLoginDto)
    {
        try
        {
            var (access, refresh,role) = await _authService.GoogleSignupSignin(googleLoginDto);

            Response.Cookies.Append("refreshToken", refresh, new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Secure = true,
                SameSite = SameSiteMode.Strict
            });

            return Ok(new { AccessToken = access, Role = role});
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}