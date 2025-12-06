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
    [Route("api/orders/{orderId}/comments")]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly SantehContext _context;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(SantehContext context, ILogger<CommentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/orders/5/comments
        [HttpGet]
        public async Task<IActionResult> GetComments(int orderId)
        {
            try
            {
                // Проверяем существование заказа
                var orderExists = await _context.Orders.AnyAsync(o => o.OrderId == orderId);
                if (!orderExists)
                {
                    return NotFound(new { message = "Заказ не найден" });
                }

                // Получаем комментарии
                var comments = await _context.Comments
                    .Where(c => c.OrderId == orderId)
                    .OrderBy(c => c.CreatedAt)
                    .ToListAsync();

                // Загружаем информацию о пользователях
                var commentDtos = new List<CommentDto>();
                foreach (var comment in comments)
                {
                    await _context.Entry(comment)
                        .Reference(c => c.User)
                        .LoadAsync();

                    commentDtos.Add(new CommentDto
                    {
                        CommentId = comment.CommentId,
                        OrderId = comment.OrderId,
                        UserId = comment.UserId,
                        UserName = comment.User?.FullName ?? $"User #{comment.UserId}",
                        Text = comment.Text,
                        CreatedAt = comment.CreatedAt
                    });
                }

                _logger.LogInformation($"Loaded {commentDtos.Count} comments for order {orderId}");
                return Ok(commentDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error loading comments for order {orderId}");
                return StatusCode(500, new { message = "Ошибка при загрузке комментариев" });
            }
        }

        // POST: api/orders/5/comments
        [HttpPost]
        public async Task<IActionResult> AddComment(int orderId, [FromBody] CreateCommentDto dto)
        {
            try
            {
                // Проверяем существование заказа
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                {
                    return NotFound(new { message = "Заказ не найден" });
                }

                // Получаем ID текущего пользователя из JWT токена
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Не удалось определить пользователя" });
                }

                // Проверяем права доступа
                // Клиент может комментировать только свои заказы
                var userRoleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
                if (userRoleClaim?.Value == "Client" && order.UserId != userId)
                {
                    return Forbid();
                }

                // Создаём комментарий
                var comment = new Comment
                {
                    OrderId = orderId,
                    UserId = userId,
                    Text = dto.Text.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                // Загружаем информацию о пользователе
                await _context.Entry(comment)
                    .Reference(c => c.User)
                    .LoadAsync();

                var commentDto = new CommentDto
                {
                    CommentId = comment.CommentId,
                    OrderId = comment.OrderId,
                    UserId = comment.UserId,
                    UserName = comment.User?.FullName ?? $"User #{comment.UserId}",
                    Text = comment.Text,
                    CreatedAt = comment.CreatedAt
                };

                _logger.LogInformation($"Comment {comment.CommentId} added to order {orderId} by user {userId}");
                return CreatedAtAction(nameof(GetComments), new { orderId }, commentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding comment to order {orderId}");
                return StatusCode(500, new { message = "Ошибка при добавлении комментария" });
            }
        }

        // DELETE: api/orders/5/comments/10
        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(int orderId, int commentId)
        {
            try
            {
                var comment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.CommentId == commentId && c.OrderId == orderId);

                if (comment == null)
                {
                    return NotFound(new { message = "Комментарий не найден" });
                }

                // Получаем ID текущего пользователя
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Не удалось определить пользователя" });
                }

                // Проверяем права: удалить может только автор или админ
                var userRoleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
                bool isAdmin = userRoleClaim?.Value == "Admin";
                bool isAuthor = comment.UserId == userId;

                if (!isAdmin && !isAuthor)
                {
                    return Forbid();
                }

                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Comment {commentId} deleted from order {orderId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting comment {commentId} from order {orderId}");
                return StatusCode(500, new { message = "Ошибка при удалении комментария" });
            }
        }

        // PUT: api/orders/5/comments/10
        [HttpPut("{commentId}")]
        public async Task<IActionResult> UpdateComment(int orderId, int commentId, [FromBody] CreateCommentDto dto)
        {
            try
            {
                var comment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.CommentId == commentId && c.OrderId == orderId);

                if (comment == null)
                {
                    return NotFound(new { message = "Комментарий не найден" });
                }

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Не удалось определить пользователя" });
                }


                // Проверяем права: редактировать может только автор
                if (comment.UserId != userId)
                {
                    return Forbid();
                }

                comment.Text = dto.Text.Trim();
                await _context.SaveChangesAsync();

                // Загружаем информацию о пользователе
                await _context.Entry(comment)
                    .Reference(c => c.User)
                    .LoadAsync();

                var commentDto = new CommentDto
                {
                    CommentId = comment.CommentId,
                    OrderId = comment.OrderId,
                    UserId = comment.UserId,
                    UserName = comment.User?.FullName ?? $"User #{comment.UserId}",
                    Text = comment.Text,
                    CreatedAt = comment.CreatedAt
                };

                _logger.LogInformation($"Comment {commentId} updated in order {orderId}");
                return Ok(commentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating comment {commentId} in order {orderId}");
                return StatusCode(500, new { message = "Ошибка при обновлении комментария" });
            }
        }
    }
}

// DTOs для комментариев
namespace SantehOrders.API.DTOs
{
    public class CommentDto
    {
        public int CommentId { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        public string Text { get; set; } = string.Empty;
    }
}