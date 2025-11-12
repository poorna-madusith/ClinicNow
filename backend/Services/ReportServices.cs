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

    public async Task<DoctorFeedbackStatsDto> GetDoctorFeedbackStatistics()
    {
        // Get all feedbacks with doctor information
        var feedbacks = await _context.Feedbacks
            .Include(f => f.Doctor)
            .ToListAsync();

        if (!feedbacks.Any())
        {
            return new DoctorFeedbackStatsDto
            {
                TopRatedDoctors = new List<DoctorRatingItem>(),
                TotalFeedbacks = 0
            };
        }

        // Group by doctor and calculate average ratings
        var doctorRatings = feedbacks
            .GroupBy(f => f.doctorId)
            .Select(g => new DoctorRatingItem
            {
                DoctorId = g.Key,
                DoctorName = $"{g.First().Doctor.FirstName} {g.First().Doctor.LastName}",
                Specialization = g.First().Doctor.Specialization ?? "Not Specified",
                AverageRating = Math.Round(g.Average(f => f.OverallRating), 2),
                TotalFeedbacks = g.Count()
            })
            .OrderByDescending(d => d.AverageRating)
            .ThenByDescending(d => d.TotalFeedbacks)
            .Take(10) // Top 10 doctors
            .ToList();

        return new DoctorFeedbackStatsDto
        {
            TopRatedDoctors = doctorRatings,
            TotalFeedbacks = feedbacks.Count
        };
    }

    public async Task<RatingCategoryStatsDto> GetRatingCategoryStatistics()
    {
        var feedbacks = await _context.Feedbacks.ToListAsync();

        if (!feedbacks.Any())
        {
            return new RatingCategoryStatsDto
            {
                AverageCommunicationRating = 0,
                AverageProfessionalismRating = 0,
                AveragePunctualityRating = 0,
                AverageTreatmentRating = 0,
                AverageOverallRating = 0,
                TotalFeedbacks = 0
            };
        }

        return new RatingCategoryStatsDto
        {
            AverageCommunicationRating = Math.Round(feedbacks.Average(f => f.CommunicationRating), 2),
            AverageProfessionalismRating = Math.Round(feedbacks.Average(f => f.ProfessionalismRating), 2),
            AveragePunctualityRating = Math.Round(feedbacks.Average(f => f.PunctualityRating), 2),
            AverageTreatmentRating = Math.Round(feedbacks.Average(f => f.TreatmentRating), 2),
            AverageOverallRating = Math.Round(feedbacks.Average(f => f.OverallRating), 2),
            TotalFeedbacks = feedbacks.Count
        };
    }

    public async Task<DoctorBookingRatingStatsDto> GetDoctorBookingRatingStatistics()
    {
        // Get all bookings with session and doctor information
        var bookings = await _context.Bookings
            .Include(b => b.Session)
            .ThenInclude(s => s.Doctor)
            .ToListAsync();

        // Get all feedbacks
        var feedbacks = await _context.Feedbacks.ToListAsync();

        if (!bookings.Any())
        {
            return new DoctorBookingRatingStatsDto
            {
                DoctorStats = new List<DoctorBookingRatingItem>(),
                TotalBookings = 0
            };
        }

        // Group bookings by doctor (through session)
        var doctorStats = bookings
            .Where(b => b.Session != null && b.Session.Doctor != null)
            .GroupBy(b => b.Session.DoctorId)
            .Select(g => {
                var doctorFeedbacks = feedbacks.Where(f => f.doctorId == g.Key).ToList();
                var averageRating = doctorFeedbacks.Any() 
                    ? Math.Round(doctorFeedbacks.Average(f => f.OverallRating), 2) 
                    : 0;

                var firstBooking = g.First();
                return new DoctorBookingRatingItem
                {
                    DoctorId = g.Key,
                    DoctorName = $"{firstBooking.Session.Doctor.FirstName} {firstBooking.Session.Doctor.LastName}",
                    Specialization = firstBooking.Session.Doctor.Specialization ?? "Not Specified",
                    TotalBookings = g.Count(),
                    AverageRating = averageRating
                };
            })
            .OrderByDescending(d => d.TotalBookings)
            .ToList();

        return new DoctorBookingRatingStatsDto
        {
            DoctorStats = doctorStats,
            TotalBookings = bookings.Count
        };
    }
}
