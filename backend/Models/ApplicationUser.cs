using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace backend.Models;

//enum for genders
public enum GenderEnum
{
    Male,
    Female,
    Other
}


public enum RoleEnum
{
    Admin,
    Doctor,
    Patient
}

public class ApplicationUser : IdentityUser
{


    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public RoleEnum Role { get; set; }

    public int? Age { get; set; }

    public GenderEnum? Gender { get; set; }

    public string? Town { get; set; } = null!;

    public string? Address { get; set; }


    //Doctor specific fields
    public string? Specialization { get; set; }
    public string? DocDescription { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string[]? ContactNumbers { get; set; }


}