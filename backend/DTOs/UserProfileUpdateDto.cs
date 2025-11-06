using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class UserProfileUpdateDto
{
    [Required(ErrorMessage = "First Name is required")]

    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Last Name is required")]
    public string LastName { get; set; } = null!;


    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid Email Address")]
    public string Email { get; set; } = null!;


    [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")]
    public int? Age { get; set; }

    [EnumDataType(typeof(GenderEnum), ErrorMessage = "Invalid Gender")]
    public GenderEnum? Gender { get; set; }

    public string? Town { get; set; }

    public string? Address { get; set; }

    public string[]? ContactNumbers { get; set; }
    
}