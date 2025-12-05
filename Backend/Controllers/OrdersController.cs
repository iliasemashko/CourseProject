using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SantehOrders.API.Data;
using SantehOrders.API.Models;


namespace SantehOrders.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly SantehContext _context;


        public OrdersController(SantehContext context) { _context = context; }


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
            .Include(o => o.Items!)
            .ThenInclude(i => i.Product)
            .Include(o => o.Status)
            .ToListAsync();
            return Ok(orders);
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(Order order)
        {
            // Simple example: caller provides items with Price and ProductId
            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;
            // compute total
            order.TotalAmount = order.Items?.Sum(i => i.Price * i.Quantity) ?? 0;
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = order.OrderId }, order);
        }


        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] int statusId)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            order.StatusId = statusId;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}