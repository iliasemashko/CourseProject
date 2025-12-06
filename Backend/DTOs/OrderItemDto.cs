using SantehOrders.API.Models;
using System;

namespace SantehOrders.API.DTOs
{
    public class OrderItemDto
    {
        public int OrderItemId { get; set; }
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }  // добавлено
        public Product? Product { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
