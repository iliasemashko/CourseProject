namespace SantehOrders.API.Models {
public class Order {
public int OrderId { get; set; }
public int UserId { get; set; }
public User? User { get; set; }
public int StatusId { get; set; }
public OrderStatus? Status { get; set; }
public decimal TotalAmount { get; set; }
public DateTime CreatedAt { get; set; }
public DateTime UpdatedAt { get; set; }
public List<OrderItem>? Items { get; set; }
}
}