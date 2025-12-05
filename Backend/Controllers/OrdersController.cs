using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == "roleId")?.Value;
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

            if (roleClaim == null || userIdClaim == null) return Unauthorized();

            int roleId = int.Parse(roleClaim);
            int userId = int.Parse(userIdClaim);

            IQueryable<Order> query = _context.Orders
                .Include(o => o.Items!)
                .ThenInclude(i => i.Product)
                .Include(o => o.Status);

            if (roleId == 1)
            {
                query = query.Where(o => o.UserId == userId);
            }
            else if (roleId == 2)
            {
                query = query.Where(o => o.StatusId == 1 || o.UserId == userId);
            }
            else if (roleId == 3)
            {
                // роль 3 видит все заказы, фильтр не нужен
            }
            else
            {
                return Forbid();
            }

            var orders = await query.ToListAsync();

            var ordersDto = orders.Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                UserId = o.UserId,
                Status = o.Status?.Name,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                TotalAmount = o.TotalAmount,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name,
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            }).ToList();

            return Ok(ordersDto);
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
