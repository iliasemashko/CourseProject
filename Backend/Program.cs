using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using SantehOrders.API.Data;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SantehOrders API", Version = "v1" });

    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            jwtScheme,
            new string[] { }
        }
    });
});

// MySQL DbContext
builder.Services.AddDbContext<SantehContext>(options =>
{
    var conn = configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(conn, ServerVersion.AutoDetect(conn));
});

// JWT Authentication
var jwtSection = configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.FromMinutes(5) // Допуск 5 минут для разницы в часах
        };
    });


builder.Services.AddAuthorization();

// ============ CORS - КРИТИЧЕСКИ ВАЖНО! ============
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow common dev front-end ports and both http/https variants for local testing
        policy.WithOrigins(
                "http://localhost:3000", "https://localhost:3000",
                "http://localhost:3001", "https://localhost:3001",
                "http://localhost:5173", "https://localhost:5173"
            )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });

    // Development override: allow all origins (to avoid local dev CORS issues)
    options.AddPolicy("DevAllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SantehOrders API v1");
        c.RoutePrefix = string.Empty; // Swagger доступен по /
        c.DefaultModelsExpandDepth(0); // Скрыть Models раздел
    });
}

// ============ UseCors ДОЛЖЕН БЫТЬ ПЕРЕД Authentication/Authorization! ============
// Use restrictive policy in production, but enable a liberal policy in Development to avoid CORS issues during local testing
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevAllowAll");
}
else
{
    app.UseCors("AllowFrontend");
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();