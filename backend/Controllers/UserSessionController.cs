using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;


[ApiController]
[Route("api/userSession")]
[Authorize(Roles = "Patient")]
public class UserSessionController : ControllerBase
{

    private readonly UserSessionServices _userSessionServices;

    public UserSessionController(UserSessionServices userSessionServices)
    {
        _userSessionServices = userSessionServices;
    }

    [HttpGet("getsessionsfordoctor/{doctorId}")]
    public async Task<IActionResult> GetAllSessionsForADoctor(string doctorId)
    {
        try
        {
            var sessions = await _userSessionServices.GetAllSessionsForADoctor(doctorId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    //get all doctors
    [HttpGet("getalldoctors")]
    public async Task<IActionResult> GetAllDoctors()
    {
        try
        {
            var doctors = await _userSessionServices.GetAllDoctors();
            return Ok(doctors);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }






}