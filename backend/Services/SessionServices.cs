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
    public async Task<List<Session>> GetAllSessionsForDoctor(string doctorId)
    {
        var doctorexsisting = await _userManager.FindByIdAsync(doctorId);
        if (doctorexsisting == null || doctorexsisting.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
        }

        var sessions = await _context.Sessions
            .Where(s => s.DoctorId == doctorId)
            .Include(s => s.Patients)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
        return sessions;
    }
}