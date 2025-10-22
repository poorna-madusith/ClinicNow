using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserSessionServices
{
    private readonly UserManager<ApplicationUser> _userManager;

    private readonly ApplicationDBContext _context;

    public UserSessionServices(ApplicationDBContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }


    public async Task<List<Session>> GetAllSessionsForADoctor(string doctorId)
    {
        var doctor = await _userManager.FindByIdAsync(doctorId);

        if (doctor == null || doctor.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
        }

        var sessions = await _context.Sessions.
            Where(s => s.DoctorId == doctorId).
            Include(s => s.Bookings).
                ThenInclude(b => b.Patient).
            OrderBy(s => s.Date).
            ThenBy(s => s.StartTime).
            ToListAsync();

        return sessions;
    }


    //get ALl doctors
    public async Task<List<ApplicationUser>> GetAllDoctors()
    {
        var doctors = await _userManager.GetUsersInRoleAsync(RoleEnum.Doctor.ToString());
        return doctors.ToList();
    }

}