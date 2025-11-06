using backend.Models;

namespace backend.DTOs;

public class UserDetailsDto
{
    public string Id { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Email { get; set; }
    public RoleEnum Role { get; set; }
    public int? Age { get; set; }
    public GenderEnum? Gender { get; set; }
    public string? Town { get; set; }
    public string? Address { get; set; }
    public string[]? ContactNumbers { get; set; }

    // Doctor specific fields
    public string? Specialization { get; set; }
    public string? DocDescription { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ContactEmail { get; set; }
}