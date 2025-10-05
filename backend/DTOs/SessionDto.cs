using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;


public class SessionDto
{

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

    [Required(ErrorMessage = "Description is required")]
    public string? Description { get; set; }
    [Required(ErrorMessage = "Scheduled status is required")]
    public bool Scheduled { get; set; } = true;
}