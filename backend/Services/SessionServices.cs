using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SessionServices
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDBContext _context;

    public SessionServices(ApplicationDBContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<IActionResult> AddSession(SessionDto sessionDto)
    {
        // Validate doctor
        var Doc = await _userManager.FindByIdAsync(sessionDto.DoctorId);
        if (Doc == null || Doc.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
        }

        // Validate time range
        if (sessionDto.EndTime <= sessionDto.StartTime)
        {
            throw new Exception("End time must be after start time");
        }

        

        var session = new Session
        {
            DoctorId = sessionDto.DoctorId,
            Doctor = Doc,
            Date = sessionDto.Date.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(sessionDto.Date, DateTimeKind.Utc) 
                : sessionDto.Date.ToUniversalTime(),
            StartTime = sessionDto.StartTime,
            EndTime = sessionDto.EndTime,
            SessionFee = sessionDto.SessionFee,
            Description = sessionDto.Description,
            Capacity = sessionDto.Capacity,
        };

        await _context.Sessions.AddAsync(session);
        var result = await _context.SaveChangesAsync();

        if (result > 0)
        {
            return new OkObjectResult(session);
        }
        else
        {
            throw new Exception("Failed to add session");
        }
    }


    //get all sessions for a doctor
    public async Task<List<SessionDto>> GetAllSessionsForDoctor(string doctorId)
    {
        Console.WriteLine($"SessionServices: Looking for doctor with ID: {doctorId}");
        
        var doctorexsisting = await _userManager.FindByIdAsync(doctorId);
        
        if (doctorexsisting == null)
        {
            Console.WriteLine($"SessionServices: Doctor not found with ID: {doctorId}");
            throw new Exception($"Doctor not found with ID: {doctorId}");
        }
        
        Console.WriteLine($"SessionServices: Found user - Email: {doctorexsisting.Email}, Role: {doctorexsisting.Role}");
        
        if (doctorexsisting.Role != RoleEnum.Doctor)
        {
            throw new Exception($"User is not a doctor. Current role: {doctorexsisting.Role}");
        }

        var sessions = await _context.Sessions
            .Where(s => s.DoctorId == doctorId)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Patient)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .Select(s => new SessionDto
            {
                Id = s.Id,
                DoctorId = s.DoctorId,
                DoctorName = s.Doctor.FirstName + " " + s.Doctor.LastName,
                Date = s.Date,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Capacity = s.Capacity,
                SessionFee = s.SessionFee,
                Description = s.Description,
                Canceled = s.Canceled,
                Ongoing = s.Ongoing,
                Bookings = s.Bookings.Select(b => new BookingDto
                {
                    Id = b.Id,
                    PatientId = b.PatientId,
                    PatientName = b.Patient.FirstName + " " + b.Patient.LastName,
                    Patient = new PatientDto
                    {
                        Id = b.Patient.Id,
                        FirstName = b.Patient.FirstName,
                        LastName = b.Patient.LastName,
                        Email = b.Patient.Email,
                        ContactNumbers = b.Patient.ContactNumbers
                    },
                    BookedDateandTime = b.BookedDateandTime,
                    positionInQueue = b.positionInQueue,
                    Completed = b.Completed,
                    OnGoing = b.OnGoing
                }).ToList()
            })
            .ToListAsync();
        return sessions;
    }


    //update session
    public async Task<IActionResult> EditSession(int sessionId, SessionDto sessionDto)
    {
        var existingSession = await _context.Sessions.FindAsync(sessionId);
        if (existingSession == null)
        {
            throw new Exception("Session not found");
        }

        var doctor = await _userManager.FindByIdAsync(sessionDto.DoctorId);
        if (doctor == null || doctor.Role != RoleEnum.Doctor || doctor.Role == RoleEnum.Patient)
        {
            throw new Exception("Invalid doctor ID");
        }
        if (sessionDto.EndTime <= sessionDto.StartTime)
        {
            throw new Exception("End time must be after start time");
        }
        existingSession.DoctorId = sessionDto.DoctorId;
        existingSession.Doctor = doctor;
        existingSession.Date = sessionDto.Date.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(sessionDto.Date, DateTimeKind.Utc)
            : sessionDto.Date.ToUniversalTime();
        existingSession.StartTime = sessionDto.StartTime;
        existingSession.EndTime = sessionDto.EndTime;
        existingSession.SessionFee = sessionDto.SessionFee;
        existingSession.Description = sessionDto.Description;
        existingSession.Capacity = sessionDto.Capacity;

        _context.Sessions.Update(existingSession);
        var result = await _context.SaveChangesAsync();

        if (result > 0)
        {
            return new OkObjectResult(existingSession);
        }
        else
        {
            throw new Exception("Failed to update session");
        }
    }


    //cancel a session
    public async Task<Session> CancelSession(int sessionId, string userId)
    {
        var existingSession = await _context.Sessions.FindAsync(sessionId);
        if (existingSession == null)
        {
            throw new Exception("Session not found");
        }

        var doctor = await _userManager.FindByIdAsync(userId);
        if (doctor == null || doctor.Role != RoleEnum.Doctor || doctor.Role == RoleEnum.Patient)
        {
            throw new Exception("Only doctors can cancel sessions");
        }

        if (existingSession.Canceled)
        {
            throw new Exception("Session is already canceled");
        }

        existingSession.Canceled = true;
        _context.Sessions.Update(existingSession);
        var result = await _context.SaveChangesAsync();

        if (result > 0)
        {
            return existingSession;
        }
        else
        {
            throw new Exception("Failed to cancel session");
        }
    }



    //set session ongoing
    public async Task<Session> SetSessionOngoing(int sessionId, string userId)
    {
        var existingSession = await _context.Sessions.FindAsync(sessionId);
        if (existingSession == null)
        {
            throw new Exception("Session not found");
        }

        if (existingSession.DoctorId != userId)
        {
            throw new Exception("You are not authorized to start this session");
        }

        if (existingSession.Canceled)
        {
            throw new Exception("Cannot start a canceled session");
        }

        var otherOngoingSession = await _context.Sessions.FirstOrDefaultAsync(s => s.DoctorId == userId && s.Ongoing && s.Id != sessionId);
        if (otherOngoingSession != null)
        {
            throw new Exception("Another session is already ongoing. Please stop the current session before starting a new one.");
        }

        existingSession.Ongoing = true;

        _context.Sessions.Update(existingSession);

        var result = await _context.SaveChangesAsync();

        if (result > 0)
        {
            return existingSession;
        }
        else
        {
            throw new Exception("Failed to set session to ongoing");
        }
    }
    

    //get current ongoing session for a doc
    public async Task<SessionDto> GetCurrentOngoingSession(string doctorId)
    {
        var doc = await _userManager.FindByIdAsync(doctorId);
        if (doc == null || doc.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
        }

        var ongoingSession = await _context.Sessions
            .Where(s => s.DoctorId == doctorId && s.Ongoing)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Patient)
            .Select(s => new SessionDto
            {
                Id = s.Id,
                DoctorId = s.DoctorId,
                DoctorName = s.Doctor.FirstName + " " + s.Doctor.LastName,
                Date = s.Date,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Capacity = s.Capacity,
                SessionFee = s.SessionFee,
                Description = s.Description,
                Canceled = s.Canceled,
                Ongoing = s.Ongoing,
                Bookings = s.Bookings.Select(b => new BookingDto
                {
                    Id = b.Id,
                    PatientId = b.PatientId,
                    PatientName = b.Patient.FirstName + " " + b.Patient.LastName,
                    Patient = new PatientDto
                    {
                        Id = b.Patient.Id,
                        FirstName = b.Patient.FirstName,
                        LastName = b.Patient.LastName,
                        Email = b.Patient.Email,
                        ContactNumbers = b.Patient.ContactNumbers
                    },
                    BookedDateandTime = b.BookedDateandTime,
                    positionInQueue = b.positionInQueue,
                    Completed = b.Completed,
                    OnGoing = b.OnGoing
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (ongoingSession == null)
        {
            throw new Exception("No ongoing session found for this doctor");
        }

        return ongoingSession;
    }
}