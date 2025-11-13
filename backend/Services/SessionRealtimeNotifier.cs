using System.Linq;
using backend.Data;
using backend.DTOs;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SessionRealtimeNotifier
{
    private readonly ApplicationDBContext _context;
    private readonly IHubContext<SessionHub> _hubContext;

    public SessionRealtimeNotifier(ApplicationDBContext context, IHubContext<SessionHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }


    public async Task BroadcastSession(int sessionId)
    {
        var session = await _context.Sessions
            .Where(s => s.Id == sessionId)
            .Include(s => s.Doctor)
            .Include(s => s.Bookings)
            .ThenInclude(b => b.Patient)
            .Select(s => new SessionDto
            {
                Id = s.Id,
                DoctorId = s.DoctorId,
                DoctorName = s.Doctor.FirstName + " " + s.Doctor.LastName,
                Doctor = new DoctorDto
                {
                    Id = s.Doctor.Id,
                    FirstName = s.Doctor.FirstName,
                    LastName = s.Doctor.LastName,
                    Email = s.Doctor.Email,
                    ContactNumbers = s.Doctor.ContactNumbers
                },
                Date = s.Date,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Capacity = s.Capacity,
                SessionFee = s.SessionFee,
                Description = s.Description,
                Canceled = s.Canceled,
                Completed = s.Completed,
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


        if (session != null)
        {
            await _hubContext.Clients.Group(SessionHub.GroupName(sessionId))
                .SendAsync("SessionUpdated", session);
        }
    }

}