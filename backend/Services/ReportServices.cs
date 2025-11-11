using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ReportServices
{
    private readonly ApplicationDBContext _context;

    public ReportServices(ApplicationDBContext context)
    {
        _context = context;
    }

    public async Task<GenderStatsDto> GetGenderStatistics()
    {
        // Get all patients (users with Patient role)
        var patients = await _context.Users
            .Where(u => u.Role == RoleEnum.Patient)
            .ToListAsync();

        var maleCount = patients.Count(p => p.Gender == GenderEnum.Male);
        var femaleCount = patients.Count(p => p.Gender == GenderEnum.Female);
        var otherCount = patients.Count(p => p.Gender == GenderEnum.Other || p.Gender == null);

        return new GenderStatsDto
        {
            MaleCount = maleCount,
            FemaleCount = femaleCount,
            OtherCount = otherCount,
            TotalPatients = patients.Count
        };
    }

    public async Task<TownStatsDto> GetTownStatistics()
    {
        // Get all patients (users with Patient role)
        var patients = await _context.Users
            .Where(u => u.Role == RoleEnum.Patient)
            .ToListAsync();

        // Group by town and count
        var townGroups = patients
            .GroupBy(p => string.IsNullOrWhiteSpace(p.Town) ? "Not Specified" : p.Town)
            .Select(g => new TownStatItem
            {
                Town = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(t => t.Count)
            .ToList();

        return new TownStatsDto
        {
            TownStats = townGroups,
            TotalPatients = patients.Count
        };
    }

    public async Task<WeeklyBookingStatsDto> GetWeeklyBookingStatistics()
    {
        // Get all bookings with their related feedback
        var bookings = await _context.Bookings
            .Include(b => b.Session)
            .ToListAsync();

        var feedbacks = await _context.Feedbacks.ToListAsync();

        // Group bookings by day of week
        var dailyStats = new List<DayBookingStatItem>();
        var daysOfWeek = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };

        foreach (var dayName in daysOfWeek)
        {
            var dayBookings = bookings.Where(b => b.BookedDateandTime.DayOfWeek.ToString() == dayName).ToList();
            var bookingCount = dayBookings.Count;

            // Calculate average rating for bookings on this day
            double averageRating = 0;
            if (bookingCount > 0)
            {
                var patientIds = dayBookings.Select(b => b.PatientId).Distinct().ToList();
                var dayFeedbacks = feedbacks.Where(f => patientIds.Contains(f.patientId)).ToList();
                
                if (dayFeedbacks.Any())
                {
                    averageRating = dayFeedbacks.Average(f => f.OverallRating);
                }
            }

            dailyStats.Add(new DayBookingStatItem
            {
                DayOfWeek = dayName,
                BookingCount = bookingCount,
                AverageRating = Math.Round(averageRating, 2)
            });
        }

        var totalBookings = bookings.Count;
        var overallAverage = feedbacks.Any() ? Math.Round(feedbacks.Average(f => f.OverallRating), 2) : 0;

        return new WeeklyBookingStatsDto
        {
            DailyStats = dailyStats,
            TotalBookings = totalBookings,
            OverallAverageRating = overallAverage
        };
    }

    public async Task<DoctorGenderStatsDto> GetDoctorGenderStatistics()
    {
        // Get all doctors (users with Doctor role)
        var doctors = await _context.Users
            .Where(u => u.Role == RoleEnum.Doctor)
            .ToListAsync();

        var maleCount = doctors.Count(d => d.Gender == GenderEnum.Male);
        var femaleCount = doctors.Count(d => d.Gender == GenderEnum.Female);
        var otherCount = doctors.Count(d => d.Gender == GenderEnum.Other || d.Gender == null);

        return new DoctorGenderStatsDto
        {
            MaleCount = maleCount,
            FemaleCount = femaleCount,
            OtherCount = otherCount,
            TotalDoctors = doctors.Count
        };
    }

    public async Task<DoctorSpecializationStatsDto> GetDoctorSpecializationStatistics()
    {
        // Get all doctors (users with Doctor role)
        var doctors = await _context.Users
            .Where(u => u.Role == RoleEnum.Doctor)
            .ToListAsync();

        // Group by specialization and count
        var specializationGroups = doctors
            .GroupBy(d => string.IsNullOrWhiteSpace(d.Specialization) ? "Not Specified" : d.Specialization)
            .Select(g => new SpecializationStatItem
            {
                Specialization = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(s => s.Count)
            .ToList();

        return new DoctorSpecializationStatsDto
        {
            SpecializationStats = specializationGroups,
            TotalDoctors = doctors.Count
        };
    }
}
