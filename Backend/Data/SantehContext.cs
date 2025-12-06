using Microsoft.EntityFrameworkCore;
using SantehOrders.API.Models;


namespace SantehOrders.API.Data
{
    public class SantehContext : DbContext
    {
        public SantehContext(DbContextOptions<SantehContext> options) : base(options) { }


        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<OrderStatus> OrderStatuses => Set<OrderStatus>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Comment> Comments => Set<Comment>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Role>().HasKey(r => r.RoleId);
            modelBuilder.Entity<Role>().HasIndex(r => r.Name).IsUnique();

            modelBuilder.Entity<OrderStatus>().HasKey(s => s.StatusId);
            modelBuilder.Entity<OrderStatus>().HasIndex(s => s.Name).IsUnique();

            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, Name = "Клиент" },
                new Role { RoleId = 2, Name = "Сотрудник" },
                new Role { RoleId = 3, Name = "Администратор" }
            );

            modelBuilder.Entity<OrderStatus>().HasData(
                new OrderStatus { StatusId = 1, Name = "Создан" },
                new OrderStatus { StatusId = 2, Name = "В обработке" },
                new OrderStatus { StatusId = 3, Name = "Выполнен" },
                new OrderStatus { StatusId = 4, Name = "Отменён" }
            );

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.OrderId);

                entity.HasOne(o => o.User)
                      .WithMany()
                      .HasForeignKey(o => o.UserId)
                      .IsRequired(false);

                entity.HasOne(o => o.Status)
                      .WithMany()
                      .HasForeignKey(o => o.StatusId)
                      .IsRequired(false);

                entity.HasOne(o => o.AssignedEmployee)
                      .WithMany()
                      .HasForeignKey(o => o.AssignedEmployeeId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(o => o.Items)
                      .WithOne(i => i.Order)
                      .HasForeignKey(i => i.OrderId)
                      .IsRequired(true);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(i => i.OrderItemId);

                entity.HasOne(i => i.Product)
                      .WithMany()
                      .HasForeignKey(i => i.ProductId)
                      .IsRequired(true);
            });
        }
    }
}