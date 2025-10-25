using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;


[ApiController]
[Route("api/userSession")]
[Authorize(Roles = "Patient")]
public class UserSessionController : ControllerBase
{

    private readonly UserSessionServices _userSessionServices;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserSessionController(UserSessionServices userSessionServices, UserManager<ApplicationUser> userManager)
    {
        _userSessionServices = userSessionServices;
        _userManager = userManager;
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


    //get all sessions for a logged in doctor
    [HttpGet("getallsessions/{id}")]
    public async Task<IActionResult> GetAllSessionsForDoctor(string id)
    {
        try
        {
            var doctor = await _userManager.FindByIdAsync(id);
            if (doctor == null || doctor.Role != RoleEnum.Doctor)
            {
                return Unauthorized(new { Message = "User is not a doctor." });
            }

            var sessions = await _userSessionServices.GetAllSessionsForDoctor(doctor.Id);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }






}