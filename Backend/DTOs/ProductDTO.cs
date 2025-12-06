public class ProductCreateDto
{
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public string Description { get; set; } = null!;
    public string Category { get; set; } = null!;
    public int Stock { get; set; }
    public IFormFile Image { get; set; } = null!;
}