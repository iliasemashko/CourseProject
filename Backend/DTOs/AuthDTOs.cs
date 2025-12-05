namespace SantehOrders.API.DTOs
{
    public record RegisterDto(string FullName, string Email, string Password, int RoleId = 1);
    public record LoginDto(string Email, string Password);
    public record AuthResult(string Token, int UserId, string FullName, int RoleId);
}
