public class CreateOrderDto
{
    public int UserId { get; set; }
    public List<OrderItemDto> Items { get; set; }
}