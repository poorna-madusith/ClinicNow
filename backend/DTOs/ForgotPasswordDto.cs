using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
