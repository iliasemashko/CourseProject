        using Microsoft.AspNetCore.Mvc;
        using Microsoft.EntityFrameworkCore;
        using Microsoft.IdentityModel.Tokens;
        using System.IdentityModel.Tokens.Jwt;
        using System.Security.Claims;
        using System.Text;
        using BCrypt.Net;
        using SantehOrders.API.Data;
        using SantehOrders.API.DTOs;
        using SantehOrders.API.Models;

    namespace SantehOrders.API.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        public class AuthController : ControllerBase
        {
            private readonly SantehContext _context;
            private readonly IConfiguration _config;

            public AuthController(SantehContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            [HttpPost("register")]
            public async Task<IActionResult> Register([FromBody] RegisterDtos dto)
            {
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                    return BadRequest("Email уже используется");

                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    RoleId = dto.RoleId,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var token = GenerateToken(user);
                var result = new AuthResult(token, user.UserId, user.FullName, user.RoleId, user.Email);
                return Ok(result);
            }

            [HttpPost("login")]
            public async Task<IActionResult> Login([FromBody] LoginDto dto)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (user == null) return Unauthorized("Неверные данные");
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return Unauthorized("Неверные данные");

                var token = GenerateToken(user);
                var result = new AuthResult(token, user.UserId, user.FullName, user.RoleId, user.Email);
                return Ok(result);
            }

            private string GenerateToken(User user)
            {
                var jwt = _config.GetSection("Jwt");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
    new Claim(ClaimTypes.Name, user.FullName),
    new Claim(ClaimTypes.Role, user.RoleId.ToString()), 
    new Claim("roleId", user.RoleId.ToString()),
    new Claim(JwtRegisteredClaimNames.Email, user.Email)
};

            var token = new JwtSecurityToken(
                    issuer: jwt["Issuer"],
                    audience: jwt["Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(jwt.GetValue<int>("ExpiryMinutes")),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
        }
    }