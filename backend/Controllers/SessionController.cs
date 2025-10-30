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
    public async Task<ActionResult<List<SessionDto>>> GetAllSessionsForDoctor()
    {
        try
        {
            // Try "id" claim first (which contains the actual user ID), then fall back to "sub"
            var doctorId = User.FindFirst("id")?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(doctorId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }

            Console.WriteLine($"Fetching sessions for doctor ID: {doctorId}");
            var sessions = await _sessionServices.GetAllSessionsForDoctor(doctorId);
            return Ok(sessions);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetAllSessionsForDoctor: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("editsession/{sessionId}")]
    public async Task<IActionResult> EditSession(int sessionId, [FromBody] SessionDto sessionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updatedSession = await _sessionServices.EditSession(sessionId, sessionDto);
            return Ok(new { message = "Session updated successfully", updatedSession });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    //cancel session
    [HttpPatch("cancelsession/{sessionId}")]
    public async Task<IActionResult> CancelSession(int sessionId)
    {
        try
        {
            var doctorId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(doctorId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            var canceledSession = await _sessionServices.CancelSession(sessionId, doctorId);
            return Ok(new { message = "Session canceled successfully", canceledSession });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    [HttpPatch("setsessionongoing/{sessionId}")]
    public async Task<IActionResult> SetSessionOngoing(int sessionId)
    {
        try
        {
            var doctorId = User.FindFirst("id")?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(doctorId))
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            var session = await _sessionServices.SetSessionOngoing(sessionId, doctorId);
            return Ok(new { message = "Session is now ongoing", session });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("getcurrentOngoingSession/{doctorId}")]
    [Authorize(Roles = "Doctor,Patient")]
    public async Task<IActionResult> GetCurrentOngoingSession(string doctorId)
    {
        try
        {
            var session = await _sessionServices.GetCurrentOngoingSession(doctorId);
            return Ok(session);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    //mark booking as completed
    [HttpPatch("markbookingcompleted/{bookingId}")]
    public async Task<IActionResult> MarkBookingAsCompleted(int bookingId)
    {
        try
        {
            var doctorId = User.FindFirst("id")?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(doctorId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var booking = await _sessionServices.MarkBookingAsCompleted(bookingId, doctorId);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Map to DTO to avoid EF navigation circular references during JSON serialization
            var bookingDto = new BookingDto
            {
                Id = booking.Id,
                SessionId = booking.SessionId,
                PatientId = booking.PatientId,
                PatientName = booking.Patient != null ? booking.Patient.FirstName + " " + booking.Patient.LastName : null,
                Patient = booking.Patient != null ? new PatientDto
                {
                    Id = booking.Patient.Id,
                    FirstName = booking.Patient.FirstName,
                    LastName = booking.Patient.LastName,
                    Email = booking.Patient.Email,
                    PhoneNumber = booking.Patient.PhoneNumber,
                    ContactNumbers = booking.Patient.ContactNumbers
                } : null,
                Session = null, // avoid embedding session (could cause cycles)
                BookedDateandTime = booking.BookedDateandTime,
                positionInQueue = booking.positionInQueue,
                Completed = booking.Completed,
                OnGoing = booking.OnGoing
            };

            return Ok(new { message = "Booking marked as completed", booking = bookingDto });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        
    }



}
