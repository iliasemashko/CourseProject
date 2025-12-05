namespace SantehOrders.API.Models {
public class Product {
public int ProductId { get; set; }
public string Name { get; set; } = null!;
public string? Description { get; set; }
public decimal Price { get; set; }
public string? Category { get; set; }
public int Stock { get; set; }
public byte[]? Image { get; set; }
public string? ImageName { get; set; }
public string? ImageType { get; set; }
public DateTime CreatedAt { get; set; }
}
}