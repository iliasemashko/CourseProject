using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SantehOrders.API.Data;
using SantehOrders.API.Models;
using SantehOrders.API.DTOs;

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
            // Простая версия: возвращаем все строки из таблицы Orders без фильтрации и проекций
            // Это полезно для проверки данных в Swagger/DB — возвращаем сущности Order напрямую.
            var orders = await _context.Orders.ToListAsync();
            return Ok(orders);
        }

        // DEBUG: return raw orders from DB (no filtering) to help verify data in development
        [HttpGet("dbg/all")]
        public async Task<IActionResult> DebugAll()
        {
            var list = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .Include(o => o.Status)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == id);

            return Ok(order);
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(CreateOrderDto dto)
        {
            var order = new Order
            {
                UserId = dto.UserId,
                StatusId = 1, // Создан
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = dto.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            };

            order.TotalAmount = order.Items.Sum(i => i.Price * i.Quantity);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var orderDto = new OrderDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                Status = "Создан",
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                TotalAmount = order.TotalAmount,
                Items = order.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = null, // Можно подгрузить, если нужно
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            };

            return CreatedAtAction(nameof(GetAll), new { id = order.OrderId }, orderDto);
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
