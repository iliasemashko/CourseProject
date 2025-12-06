using System.ComponentModel;

namespace SantehOrders.API.DTOs.CreateUserDto
{
    public class CreateUserDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        [DefaultValue(1)]
        public int RoleId { get; set; } = 1;
    }
}
