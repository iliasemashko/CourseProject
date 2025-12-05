using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SantehOrders.API.Models;
using SantehOrders.API.Data;
using Microsoft.EntityFrameworkCore;

namespace SantehOrders.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly SantehContext _context;

        public ProductsController(SantehContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(
            [FromForm] string name,
            [FromForm] decimal price,
            [FromForm] IFormFile? image)
        {
            var product = new Product
            {
                Name = name,
                Price = price,
                CreatedAt = DateTime.UtcNow
            };

            if (image != null)
            {
                using var ms = new MemoryStream();
                await image.CopyToAsync(ms);

                product.Image = ms.ToArray();
                product.ImageName = image.FileName;
                product.ImageType = image.ContentType;
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = product.ProductId }, product);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var p = await _context.Products.FindAsync(id);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] Product changed)
        {
            var p = await _context.Products.FindAsync(id);
            if (p == null) return NotFound();

            p.Name = changed.Name;
            p.Description = changed.Description;
            p.Price = changed.Price;
            p.Category = changed.Category;
            p.Stock = changed.Stock;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var p = await _context.Products.FindAsync(id);
            if (p == null) return NotFound();

            _context.Products.Remove(p);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/image")]
        public async Task<IActionResult> GetImage(int id)
        {
            var p = await _context.Products.FindAsync(id);

            if (p == null || p.Image == null)
                return NotFound();

            return File(
                p.Image,
                p.ImageType ?? "application/octet-stream",
                p.ImageName
            );
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

    }
}
