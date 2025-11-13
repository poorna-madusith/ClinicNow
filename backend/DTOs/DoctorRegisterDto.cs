using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class DoctorRegisterDto
{
    [Required(ErrorMessage = "First Name is required")]

    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Last Name is required")]
    public string LastName { get; set; } = null!;


    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid Email Address")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = null!;

    [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")]
    public int? Age { get; set; }

    [EnumDataType(typeof(GenderEnum), ErrorMessage = "Invalid Gender")]
    public GenderEnum? Gender { get; set; }

    [Required(ErrorMessage = "Specialization is required")]
    public string? Specialization { get; set; }

    [Required(ErrorMessage = "Doctor Description is required")]
    public string? DocDescription { get; set; }

    [Required(ErrorMessage = "Profile Image URL is required")]
    public string? ProfileImageUrl { get; set; }
    [Required(ErrorMessage = "Contact Email is required")]
    [EmailAddress(ErrorMessage = "Invalid Contact Email Address")]
    public string? ContactEmail { get; set; }

    [Required(ErrorMessage = "At least one Contact Number is required")]
    [MinLength(1, ErrorMessage = "At least one Contact Number is required")]
    public string[]? ContactNumbers { get; set; }

    [Required(ErrorMessage = "Address is required")]
    public string? Address { get; set; }

}