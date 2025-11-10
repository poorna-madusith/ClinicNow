using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserSessionServices
{
    private readonly UserManager<ApplicationUser> _userManager;

    private readonly ApplicationDBContext _context;
    private readonly SessionRealtimeNotifier _notifier;

    public UserSessionServices(ApplicationDBContext context, UserManager<ApplicationUser> userManager, SessionRealtimeNotifier notifier)
    {
        _context = context;
        _userManager = userManager;
        _notifier = notifier;
    }


    public async Task<List<SessionDto>> GetAllSessionsForADoctor(string doctorId)
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
            ThenBy(s => s.StartTime)
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
                Completed = s.Completed,
                Ongoing = s.Ongoing,
                Description = s.Description,
                Canceled = s.Canceled,
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


    //get ALl doctors
    public async Task<List<UserDetailsDto>> GetAllDoctors()
    {
        var doctors = await _userManager.GetUsersInRoleAsync(RoleEnum.Doctor.ToString());
        
        var doctorDtos = new List<UserDetailsDto>();
        
        foreach (var doctor in doctors)
        {
            // Calculate average rating from feedbacks
            var feedbacks = await _context.Feedbacks
                .Where(f => f.doctorId == doctor.Id)
                .ToListAsync();
            
            double? averageRating = null;
            if (feedbacks.Any())
            {
                averageRating = Math.Round(feedbacks.Average(f => f.OverallRating), 1);
            }
            
            doctorDtos.Add(new UserDetailsDto
            {
                Id = doctor.Id,
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Email = doctor.Email,
                Role = doctor.Role,
                Age = doctor.Age,
                Gender = doctor.Gender,
                Town = doctor.Town,
                Address = doctor.Address,
                ContactNumbers = doctor.ContactNumbers,
                Specialization = doctor.Specialization,
                DocDescription = doctor.DocDescription,
                ProfileImageUrl = doctor.ProfileImageUrl,
                ContactEmail = doctor.ContactEmail,
                AverageRating = averageRating
            });
        }
        
        return doctorDtos;
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
    public async Task<(int positionInQueue, int bookingId)> BookASession(int sessionId, string PatientId)
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
            BookedDateandTime = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        await _notifier.BroadcastSession(sessionId);

        return (booking.positionInQueue, booking.Id);
    }


    //get all bookings for a logged in patient
    public async Task<List<BookingDto>> GetAllBookingsForPatient(string patientId)
    {
        var patient = await _userManager.FindByIdAsync(patientId);
        if (patient == null || patient.Role != RoleEnum.Patient)
        {
            throw new Exception("Invalid patient ID");
        }

        var bookings = await _context.Bookings
            .Where(b => b.PatientId == patientId)
            .Include(b => b.Session)
                .ThenInclude(s => s.Doctor)
                .OrderBy(b => b.Session.Date)
                .ThenBy(b => b.Session.StartTime)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                SessionId = b.SessionId,
                PatientId = b.PatientId,
                PatientName = patient.FirstName + " " + patient.LastName,
                BookedDateandTime = b.BookedDateandTime,
                positionInQueue = b.positionInQueue,
                Completed = b.Completed,
                OnGoing = b.OnGoing,
                Session = new SessionDto
                {
                    Id = b.Session.Id,
                    DoctorId = b.Session.DoctorId,
                    DoctorName = b.Session.Doctor.FirstName + " " + b.Session.Doctor.LastName,
                    Date = b.Session.Date,
                    StartTime = b.Session.StartTime,
                    EndTime = b.Session.EndTime,
                    Capacity = b.Session.Capacity,
                    SessionFee = b.Session.SessionFee,
                    Description = b.Session.Description,
                    Canceled = b.Session.Canceled,
                    Ongoing = b.Session.Ongoing
                }
            })
            .ToListAsync();

        return bookings;
    }

    //get a session by if
    public async Task<SessionDto> getSessionById(int sessionId)
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
                Completed = s.Completed,
                Ongoing = s.Ongoing,
                Description = s.Description,
                Canceled = s.Canceled,
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

        if (session == null)
        {
            throw new Exception("Session not found");
        }

        return session;
    }


    //cancel a booking before 24 hours
    public async Task<IActionResult> CancelBooking(int bookingId, string patientId)
    {
        var booking = await _context.Bookings.Include(b => b.Session).FirstOrDefaultAsync(b => b.Id == bookingId && b.PatientId == patientId);
        if (booking == null)
        {
            throw new Exception("Booking not found");
        }

        if (booking.Session.Ongoing || booking.Session.Completed)
        {
            throw new Exception("Cannot cancel booking for an ongoing or completed session");
        }

        DateTime bookedTime = booking.BookedDateandTime;
        DateTime now = DateTime.UtcNow;

        TimeSpan timeSinceBooking = now - bookedTime;

        if (timeSinceBooking.TotalHours > 24)
        {
            throw new Exception("Cannot cancel booking after 24 hours of booking");
        }

        int removedPosition = booking.positionInQueue;

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        // Update queue positions for remaining bookings
        var bookingsToUpdate = await _context.Bookings.Where(b => b.SessionId == booking.SessionId && b.positionInQueue > removedPosition).ToListAsync();
        foreach (var b in bookingsToUpdate)
        {
            b.positionInQueue--;
        }
        await _context.SaveChangesAsync();

        await _notifier.BroadcastSession(booking.SessionId);

        return new OkResult();
    }


    //add a feedback to the doctor
    public async Task<IActionResult> AddFeedbackToDoc(string doctorId, string patientId,FeedbackDto feedbackDto)
    {
        var doctor = await _userManager.FindByIdAsync(doctorId);
        if (doctor == null || doctor.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
        }

        var patient = await _userManager.FindByIdAsync(patientId);
        if (patient == null || patient.Role != RoleEnum.Patient)
        {
            throw new Exception("Invalid patient ID");
        }

        var feedback = new Feedback
        {
            doctorId = doctorId,
            patientId = patientId,
            CommunicationRating = feedbackDto.CommunicationRating,
            ProfessionalismRating = feedbackDto.ProfessionalismRating,
            PunctualityRating = feedbackDto.PunctualityRating,
            TreatmentRating = feedbackDto.TreatmentRating,
            OverallRating = feedbackDto.OverallRating,
            CreatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();
        

        return new OkResult();

    }
    
    
}