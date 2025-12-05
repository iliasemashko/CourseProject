using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SantehOrders.API.Models;
using SantehOrders.API.Data;

namespace SantehOrders.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly SantehContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProductsController(SantehContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        /// <summary>
        /// Получить все продукты
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        /// <summary>
        /// Создать новый продукт
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(
            [FromForm] string name,
            [FromForm] decimal price,
            [FromForm] string? description,
            [FromForm] string? category,
            [FromForm] int? stock,
            [FromForm] IFormFile? image)
        {
            var product = new Product
            {
                Name = name,
                Price = price,
                Description = description ?? "",
                Category = category ?? "",
                Stock = stock ?? 0,
                CreatedAt = DateTime.UtcNow
            };

            if (image != null)
            {
                // Сохранить изображение в файловую систему
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "products");
                Directory.CreateDirectory(uploadsFolder);
                
                var fileName = $"{Guid.NewGuid()}_{image.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                }
                
                product.ImageName = fileName;
                product.ImageType = image.ContentType;
                // Image поле оставляем пустым (используем файловую систему)
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = product.ProductId }, product);
        }

        /// <summary>
        /// Получить продукт по ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var p = await _context.Products.FindAsync(id);
            if (p == null) return NotFound();
            return Ok(p);
        }

        /// <summary>
        /// Обновить продукт
        /// </summary>
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

        /// <summary>
        /// Удалить продукт
        /// </summary>
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

        /// <summary>
        /// Получить изображение продукта
        /// </summary>
        [HttpGet("{id}/image")]
        public IActionResult GetImage(int id)
        {
            var p = _context.Products.Find(id);

            if (p == null || string.IsNullOrEmpty(p.ImageName))
                return NotFound();

            var imagePath = Path.Combine(_environment.WebRootPath, "images", "products", p.ImageName);
            if (!System.IO.File.Exists(imagePath))
                return NotFound();

            var fileStream = System.IO.File.OpenRead(imagePath);
            return File(fileStream, p.ImageType ?? "image/jpeg", p.ImageName);
        }
    }
}