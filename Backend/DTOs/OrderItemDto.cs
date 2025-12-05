public class OrderItemDto
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }  // НАЗВАНИЕ ТОВАРА
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}