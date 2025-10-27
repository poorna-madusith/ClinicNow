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
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Patient)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
        return sessions;
    }

    // //book a session
    public async Task<int> BookASession(int sessionId, string PatientId)
    {
        var session = await _context.Sessions.Include(s => s.Bookings).FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null)
        {
            throw new Exception("Session not found");
        }

        var Patient = await _userManager.FindByIdAsync(PatientId);
        if (Patient == null || Patient.Role != RoleEnum.Patient)
        {
            throw new Exception("Invalid patient ID");
        }

        if (session.Bookings.Any(b => b.PatientId == PatientId))
        {
            throw new Exception("Patient already booked this session");
        }

        if (session.Bookings.Count >= session.Capacity)
        {
            throw new InvalidOperationException("Session is fully booked");
        }
        var booking = new Booking
        {
            SessionId = sessionId,
            PatientId = PatientId,
            positionInQueue = session.Bookings.Count + 1,
            BookedDateandTime = DateTime.Now
        };

        session.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return booking.positionInQueue;
    }
    
}