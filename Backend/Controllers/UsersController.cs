using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SantehOrders.API.Data;
using SantehOrders.API.DTOs.CreateUserDto;  

namespace SantehOrders.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly SantehContext _context;

        public UsersController(SantehContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserDto dto)
        {
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = dto.RoleId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, new
            {
                user.UserId,
                user.FullName,
                user.Email,
                user.RoleId,
                user.CreatedAt
            });
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Password))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            if (dto.RoleId.HasValue)
                user.RoleId = dto.RoleId.Value;

            if (dto.CreatedAt.HasValue)
                user.CreatedAt = dto.CreatedAt.Value;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.UserId,
                user.FullName,
                user.Email,
                user.RoleId,
                user.CreatedAt
            });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}
