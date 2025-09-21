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

    [Required(ErrorMessage = "First Name is required")]

    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Last Name is required")]
    public string LastName { get; set; } = null!;

    [Required(ErrorMessage = "Role is required")]
    [EnumDataType(typeof(RoleEnum), ErrorMessage = "Invalid Role")]
    public RoleEnum Role { get; set; }

    [Required(ErrorMessage = "Age is required")]
    [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")]
    public int Age { get; set; }

    [Required(ErrorMessage = "Gender is required")]
    [EnumDataType(typeof(GenderEnum), ErrorMessage = "Invalid Gender")]
    public GenderEnum Gender { get; set; }


    //Doctor specific fields
    public string? Specialization { get; set; }
    public string? DocDescription { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ContactEmail { get; set; }
    public int[]? ContactNumbers { get; set; }


}