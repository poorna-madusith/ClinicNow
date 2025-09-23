
namespace ClinicNow.DTOs;

using System.ComponentModel.DataAnnotations;

public class UserLoginDto
{
    [Required(ErrorMessage = "Email is required")]
    
    [EmailAddress(ErrorMessage = "Invalid Email Address")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = null!;
}