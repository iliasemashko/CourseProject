namespace SantehOrders.API.DTOs
{
    public class RegisterDtos
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullName { get; set; } = null!;
    }
}
