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
        public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDto dto)
        {
            if (dto.Image == null || dto.Image.Length == 0)
                return BadRequest("Изображение не указано");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                Category = dto.Category,
                Stock = dto.Stock,
                ImageName = uniqueFileName,
                ImageType = dto.Image.ContentType,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var imageUrl = $"/images/products/{uniqueFileName}";

            return Ok(new { product, ImageUrl = imageUrl });
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

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductUpdateDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            if (!string.IsNullOrEmpty(dto.Name))
                product.Name = dto.Name;
            if (dto.Price.HasValue)
                product.Price = dto.Price.Value;
            if (dto.Description != null)
                product.Description = dto.Description;
            if (dto.Category != null)
                product.Category = dto.Category;
            if (dto.Stock.HasValue)
                product.Stock = dto.Stock.Value;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(stream);
                }

                if (!string.IsNullOrEmpty(product.ImageName))
                {
                    var oldFilePath = Path.Combine(uploadsFolder, product.ImageName);
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                product.ImageName = uniqueFileName;
                product.ImageType = dto.Image.ContentType;
            }

            await _context.SaveChangesAsync();
            var imageUrl = !string.IsNullOrEmpty(product.ImageName) ? $"/images/products/{product.ImageName}" : null;

            return Ok(new { product, ImageUrl = imageUrl });
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