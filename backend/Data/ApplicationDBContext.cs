using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace backend.Data;


public class ApplicationDBContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens { get; set; }

    public DbSet<Session> Sessions { get; set; }

    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Session>()
            .HasOne(s => s.Doctor)
            .WithMany()
            .HasForeignKey("DoctorId")
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Session>()
            .HasMany(s => s.Bookings)
            .WithOne(b => b.Session)
            .HasForeignKey(b => b.SessionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Booking>()
            .HasOne(b => b.Session)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.SessionId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Entity<Booking>()
            .HasOne(b => b.Patient)
            .WithMany()
            .HasForeignKey(b => b.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
    }

 }