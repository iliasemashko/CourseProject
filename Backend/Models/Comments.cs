namespace SantehOrders.API.Models {
public class Comment {
public int CommentId { get; set; }
public int OrderId { get; set; }
public Order? Order { get; set; }
public int UserId { get; set; }
public User? User { get; set; }
public string Text { get; set; } = null!;
public DateTime CreatedAt { get; set; }
}
}