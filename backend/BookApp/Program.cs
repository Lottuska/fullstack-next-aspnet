using BookApp.Configurations;
using BookApp.Data;
using BookApp.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            string allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Value;
            string[] origins = string.IsNullOrWhiteSpace(allowedOrigins) ? new string[] { "*" } : allowedOrigins.Split(";");

            policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
    );
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("JwtConfig"));

var key = Encoding.ASCII.GetBytes(
    builder.Configuration.GetSection("JwtConfig:Secret").Value
);

var tokenValidation = new TokenValidationParameters()
{
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(key),
    ValidateIssuer = false,
    ValidateAudience = false,
    RequireExpirationTime = true,
    ValidateLifetime = true
};

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(jwt =>
    {
        jwt.SaveToken = true;
        jwt.TokenValidationParameters = tokenValidation;
    });

builder.Services.AddSingleton(tokenValidation);

builder.Services
    .AddDefaultIdentity<IdentityUser>(options =>
    {
        options.SignIn.RequireConfirmedEmail = false;
        // Default Password settings.
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase = true;
        options.Password.RequiredLength = 6;
        options.Password.RequiredUniqueChars = 1;
    })
    .AddEntityFrameworkStores<AppDbContext>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.UseTokenValidationMiddleware();

app.Run();
