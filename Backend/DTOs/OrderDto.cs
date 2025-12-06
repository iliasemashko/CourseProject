using SantehOrders.API.Models;
using System;
using System.Collections.Generic;

namespace SantehOrders.API.DTOs
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public int StatusId { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public int? AssignedToUserId { get; set; }
        public string? AssignedToName { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
