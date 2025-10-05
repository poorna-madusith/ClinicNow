using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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
        var Doc = await _userManager.FindByIdAsync(sessionDto.Doctor.Id);
        if (Doc == null || Doc.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
        }

        var session = new Session
        {
            Id = Guid.NewGuid().ToString(),
            Doctor = Doc,
            Date = sessionDto.Date,
            StartTime = sessionDto.StartTime,
            EndTime = sessionDto.EndTime,
            SessionFee = sessionDto.SessionFee,
            Description = sessionDto.Description,
            Scheduled = sessionDto.Scheduled,
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
}