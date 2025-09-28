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

    [HttpPost("userregister")]
    public async Task<IActionResult> UserRegister(UserRegisterDto userRegisterDto)
    {
        try
        {
            var token = await _authService.UserRegister(userRegisterDto);
            return Ok(new { Token = token });

        }
        catch (Exception ex)
        { 
            return BadRequest(new { Message = ex.Message });
        }
    }
}