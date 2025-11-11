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
}
