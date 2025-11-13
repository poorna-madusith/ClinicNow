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

    public DbSet<Payment> Payments { get; set; }

    public DbSet<Feedback> Feedbacks { get; set; }

    public DbSet<Message> Messages { get; set; }

    public DbSet<Conversation> Conversations { get; set; }

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
        
        builder.Entity<Payment>()
            .HasOne(p => p.Booking)
            .WithMany()
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Payment>()
            .HasOne(p => p.Patient)
            .WithMany()
            .HasForeignKey(p => p.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Feedback>()
            .HasOne(f => f.Doctor)
            .WithMany()
            .HasForeignKey(f => f.doctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Feedback>()
            .HasOne(f => f.Patient)
            .WithMany()
            .HasForeignKey(f => f.patientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Conversation>()
            .HasOne(c => c.Patient)
            .WithMany()
            .HasForeignKey(c => c.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Conversation>()
            .HasOne(c => c.Doctor)
            .WithMany()
            .HasForeignKey(c => c.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Message>()
            .HasOne<Conversation>()
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId);
    }

}