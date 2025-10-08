using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services;

[ApiController]
[Route("api/session")]
[Authorize(Roles = "Admin,Doctor")]
public class SessionController : ControllerBase
{
    private readonly SessionServices _sessionServices;
    public SessionController(SessionServices sessionServices)
    {
        _sessionServices = sessionServices;
    }

    [HttpPost("addsession")]
    public async Task<IActionResult> AddSession([FromBody] SessionDto sessionDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var session = await _sessionServices.AddSession(sessionDto);
            return Ok(new { Message = "Session added successfully", Session = session });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    //get all sessions for a logged in doctor
    [HttpGet("getallsessions")]
    public async Task<IActionResult> GetAllSessionsForDoctor()
    {
        try
        {
            var doctorId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(doctorId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            var sessions = await _sessionServices.GetAllSessionsForDoctor(doctorId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

}
