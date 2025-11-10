using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;



public class AdminDocServices
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDBContext _context;

    public AdminDocServices(UserManager<ApplicationUser> userManager, ApplicationDBContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    public async Task<IActionResult> CreateDoctor(DoctorRegisterDto doctorRegisterDto)
    {
        var existingDoc = await _userManager.FindByEmailAsync(doctorRegisterDto.Email);
        if (existingDoc != null)
        {
            throw new Exception("Doctor with this email already exists");
        }

        var doctor = new ApplicationUser
        {
            FirstName = doctorRegisterDto.FirstName,
            LastName = doctorRegisterDto.LastName,
            Email = doctorRegisterDto.Email,
            UserName = doctorRegisterDto.Email,
            Role = RoleEnum.Doctor,
            Age = doctorRegisterDto.Age,
            Gender = doctorRegisterDto.Gender,
            Specialization = doctorRegisterDto.Specialization,
            DocDescription = doctorRegisterDto.DocDescription,
            ProfileImageUrl = doctorRegisterDto.ProfileImageUrl,
            ContactEmail = doctorRegisterDto.ContactEmail,
            ContactNumbers = doctorRegisterDto.ContactNumbers,
            Address = doctorRegisterDto.Address
        };

        var result = await _userManager.CreateAsync(doctor, doctorRegisterDto.Password);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        await _userManager.AddToRoleAsync(doctor, doctor.Role.ToString());
        return new OkObjectResult("Doctor created successfully");

    }


    //get ALl doctors
    public async Task<List<ApplicationUser>> GetAllDoctors()
    {
        var doctors = await _userManager.GetUsersInRoleAsync(RoleEnum.Doctor.ToString());
        return doctors.ToList();
    }

    //edit doctor
    public async Task<IActionResult> EditDoctor(string doctorId, DoctorRegisterDto doctorRegisterDto)
    {
        var doc = await _userManager.FindByIdAsync(doctorId);
        if (doc == null || doc.Role != RoleEnum.Doctor)
        {
            throw new Exception("Doctor not found");
        }

        doc.FirstName = doctorRegisterDto.FirstName;
        doc.LastName = doctorRegisterDto.LastName;
        doc.Email = doctorRegisterDto.Email;
        doc.UserName = doctorRegisterDto.Email;
        if (!string.IsNullOrEmpty(doctorRegisterDto.Password))
        {
            doc.PasswordHash = _userManager.PasswordHasher.HashPassword(doc, doctorRegisterDto.Password);
        }
        doc.Age = doctorRegisterDto.Age;
        doc.Gender = doctorRegisterDto.Gender;
        doc.Specialization = doctorRegisterDto.Specialization;
        doc.DocDescription = doctorRegisterDto.DocDescription;
        doc.ProfileImageUrl = doctorRegisterDto.ProfileImageUrl;
        doc.ContactEmail = doctorRegisterDto.ContactEmail;
        doc.ContactNumbers = doctorRegisterDto.ContactNumbers;
        doc.Address = doctorRegisterDto.Address;

        var result = await _userManager.UpdateAsync(doc);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        return new OkObjectResult("Doctor updated successfully");
    }

    //dete a doctor
    public async Task<IActionResult> DeleteDoctor(string doctorId)
    {
        var doc = await _userManager.FindByIdAsync(doctorId.ToString());
        if (doc == null || doc.Role != RoleEnum.Doctor)
        {
            throw new Exception("Doctor not found");
        }

        var result = await _userManager.DeleteAsync(doc);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        return new OkObjectResult("Doctor deleted successfully");
    }


    //get all patients
    public async Task<List<ApplicationUser>> GetAllPatients()
    {
        var patients = await _userManager.GetUsersInRoleAsync(RoleEnum.Patient.ToString());
        return patients.ToList();
    }


    //delete a patient
    public async Task<IActionResult> DeletePatient(string patientId)
    {
        var patient = await _userManager.FindByIdAsync(patientId);
        if (patient == null || patient.Role != RoleEnum.Patient)
        {
            throw new Exception("Patient not found");
        }

        var result = await _userManager.DeleteAsync(patient);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        return new OkObjectResult("Patient deleted successfully");
    }

    //get all sessions for a doctor
    public async Task<List<SessionDto>> GetSessionsForDoctor(string doctorId)
    {
        var doctor = await _userManager.FindByIdAsync(doctorId);
        if (doctor == null || doctor.Role != RoleEnum.Doctor)
        {
            throw new Exception("Invalid doctor ID");
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
                SessionFee = s.SessionFee,
                Description = s.Description,
                Capacity = s.Capacity,
                Canceled = s.Canceled,
                Completed = s.Completed,
                Ongoing = s.Ongoing,
                Bookings = s.Bookings.Select(b => new BookingDto
                {
                    Id = b.Id,
                    SessionId = b.SessionId,
                    PatientId = b.PatientId,
                    PatientName = b.Patient.FirstName + " " + b.Patient.LastName,
                    Patient = new PatientDto
                    {
                        Id = b.Patient.Id,
                        FirstName = b.Patient.FirstName,
                        LastName = b.Patient.LastName,
                        Email = b.Patient.Email,
                        PhoneNumber = b.Patient.PhoneNumber,
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

    //get all bookings for a patient
    public async Task<List<BookingDto>> GetBookingsForPatient(string patientId)
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
            .Include(b => b.Patient)
            .OrderByDescending(b => b.Session.Date)
            .ThenByDescending(b => b.Session.StartTime)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                SessionId = b.SessionId,
                PatientId = b.PatientId,
                PatientName = b.Patient.FirstName + " " + b.Patient.LastName,
                Patient = new PatientDto
                {
                    Id = b.Patient.Id,
                    FirstName = b.Patient.FirstName,
                    LastName = b.Patient.LastName,
                    Email = b.Patient.Email,
                    PhoneNumber = b.Patient.PhoneNumber,
                    ContactNumbers = b.Patient.ContactNumbers
                },
                Session = new SessionDto
                {
                    Id = b.Session.Id,
                    DoctorId = b.Session.DoctorId,
                    DoctorName = b.Session.Doctor.FirstName + " " + b.Session.Doctor.LastName,
                    Doctor = new DoctorDto
                    {
                        Id = b.Session.Doctor.Id,
                        FirstName = b.Session.Doctor.FirstName,
                        LastName = b.Session.Doctor.LastName,
                        Email = b.Session.Doctor.Email,
                        ContactNumbers = b.Session.Doctor.ContactNumbers
                    },
                    Date = b.Session.Date,
                    StartTime = b.Session.StartTime,
                    EndTime = b.Session.EndTime,
                    SessionFee = b.Session.SessionFee,
                    Description = b.Session.Description,
                    Capacity = b.Session.Capacity,
                    Canceled = b.Session.Canceled,
                    Completed = b.Session.Completed,
                    Ongoing = b.Session.Ongoing
                },
                BookedDateandTime = b.BookedDateandTime,
                positionInQueue = b.positionInQueue,
                Completed = b.Completed,
                OnGoing = b.OnGoing
            })
            .ToListAsync();

        return bookings;
    }
    
}