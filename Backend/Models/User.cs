using System.ComponentModel.DataAnnotations.Schema;


namespace SantehOrders.API.Models {
public class User {
public int UserId { get; set; }
public int RoleId { get; set; }
public Role? Role { get; set; }
public string FullName { get; set; } = null!;
public string Email { get; set; } = null!;
public string PasswordHash { get; set; } = null!;
public string? Phone { get; set; }
public DateTime CreatedAt { get; set; }
}
}