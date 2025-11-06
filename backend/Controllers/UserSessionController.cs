using System.Reflection.Metadata;
using backend.DTOs;
using backend.Models;
using backend.Services;
using iText.Kernel.Pdf;
using iText.Layout.Element;
using iText.Layout.Properties;
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
    public async Task<ActionResult<List<SessionDto>>> GetAllSessionsForADoctor(string doctorId)
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


    //get all sessions for a  doctor
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


    //book a session
    [HttpPost("booksession/{id}")]
    public async Task<IActionResult> BookASession(int id)
    {
        try
        {
            var patientId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(patientId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            var (positionInQueue, bookingId) = await _userSessionServices.BookASession(id, patientId);
            return Ok(new { PositionInQueue = positionInQueue, BookingId = bookingId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    //get all booking for a patient
    [HttpGet("getallbookingsforpatient")]
    public async Task<IActionResult> GetAllBookingsForPatient()
    {
        try
        {
            var patientId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(patientId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            var booking = await _userSessionServices.GetAllBookingsForPatient(patientId);
            return Ok(booking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }

    }

    //get a session by id
    [HttpGet("getseesionbyid/{id}")]
    public async Task<IActionResult> GetSessionById(int id)
    {
        try
        {
            var session = await _userSessionServices.getSessionById(id);
            return Ok(session);
        }
        catch (Exception ex)
        {
            if (ex.Message == "Session not found")
            {
                return NotFound("Session not found");
            }
            return StatusCode(500, ex.Message);
        }
    }

    //cancel a booking
    [HttpDelete("cancelbooking/{bookingId}")]
    public async Task<IActionResult> cancelBooking(int bookingId) {
        try {
            var patientId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            await _userSessionServices.CancelBooking(bookingId, patientId);
            return Ok(new { Message = "Booking cancelled successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    
}