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

    [HttpGet("weekly-booking-statistics")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetWeeklyBookingStatistics()
    {
        try
        {
            var stats = await _reportServices.GetWeeklyBookingStatistics();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("doctor-gender-statistics")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDoctorGenderStatistics()
    {
        try
        {
            var stats = await _reportServices.GetDoctorGenderStatistics();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("doctor-specialization-statistics")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDoctorSpecializationStatistics()
    {
        try
        {
            var stats = await _reportServices.GetDoctorSpecializationStatistics();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
