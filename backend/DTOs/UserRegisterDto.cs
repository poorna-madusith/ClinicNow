using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class UserRegisterDto
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

    [Required(ErrorMessage = "Age is required")]
    [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")]
    public int Age { get; set; }

    [Required(ErrorMessage = "Gender is required")]
    [EnumDataType(typeof(GenderEnum), ErrorMessage = "Invalid Gender")]
    public GenderEnum Gender { get; set; }
    
    [Required(ErrorMessage = "Town is required")]
    public string Town { get; set; } = null!;

    [Required(ErrorMessage = "Address is required")]
    public string? Address { get; set; }
    
}