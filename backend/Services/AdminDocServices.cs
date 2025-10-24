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
    public async Task<IActionResult> EditDoctor(int doctorId, DoctorRegisterDto doctorRegisterDto)
    {
        var doc = await _userManager.FindByIdAsync(doctorId.ToString());
        if (doc == null || doc.Role != RoleEnum.Doctor)
        {
            throw new Exception("Doctor not found");
        }

        doc.FirstName = doctorRegisterDto.FirstName;
        doc.LastName = doctorRegisterDto.LastName;
        doc.Email = doctorRegisterDto.Email;
        doc.UserName = doctorRegisterDto.Email;
        doc.PasswordHash = _userManager.PasswordHasher.HashPassword(doc, doctorRegisterDto.Password);
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
    
}