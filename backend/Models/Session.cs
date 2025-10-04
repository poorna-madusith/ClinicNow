using System.ComponentModel.DataAnnotations;

namespace backend.Models;


public class Session
{   
    [Required(ErrorMessage = "Session ID is required")]
    public string Id { get; set; } = null!;

    [Required(ErrorMessage = "Doctor is required")]
    public ApplicationUser Doctor { get; set; } = null!;

    [Required(ErrorMessage = "Capacity is required")]
    public int Capacity { get; set; } = 0;

    [Required(ErrorMessage = "Start Time is required")]
    public double StartTime { get; set; } = 0.0;

    [Required(ErrorMessage = "End Time is required")]
    public double EndTime { get; set; } = 0.0;

    [Required(ErrorMessage = "Date is required")]
    public DateTime Date { get; set; } = DateTime.MinValue;

    [Required(ErrorMessage = "Session Fee is required")]
    public double SessionFee { get; set; } = 0.0;

    public ICollection<ApplicationUser> Patients { get; set; } = new List<ApplicationUser>();
}