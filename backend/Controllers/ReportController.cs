using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly ReportServices _reportServices;

    public ReportController(ReportServices reportServices)
    {
        _reportServices = reportServices;
    }

    [HttpGet("gender-statistics")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetGenderStatistics()
    {
        try
        {
            var stats = await _reportServices.GetGenderStatistics();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("town-statistics")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTownStatistics()
    {
        try
        {
            var stats = await _reportServices.GetTownStatistics();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
