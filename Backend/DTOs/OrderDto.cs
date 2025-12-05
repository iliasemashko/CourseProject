public class OrderDto
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }  // ИМЯ ЗАКАЗЧИКА
    public int StatusId { get; set; }       // ID СТАТУСА
    public string? Status { get; set; }     // НАЗВАНИЕ СТАТУСА
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public int? AssignedToUserId { get; set; }  // ID ИСПОЛНИТЕЛЯ
    public string? AssignedToName { get; set; }  // ИМЯ ИСПОЛНИТЕЛЯ
    public List<OrderItemDto> Items { get; set; } = new();
}
