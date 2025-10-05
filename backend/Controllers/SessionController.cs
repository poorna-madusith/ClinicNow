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

}
