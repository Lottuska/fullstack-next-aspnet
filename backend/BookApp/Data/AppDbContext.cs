using BookApp.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Data
{
    public class AppDbContext : IdentityDbContext
    {
        public DbSet<Book> Books { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        
        }
    }
}
