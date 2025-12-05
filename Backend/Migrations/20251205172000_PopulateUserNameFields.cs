using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class PopulateUserNameFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Заполняем Surname и Name из FullName
            // Предполагаем что FullName содержит "Имя Отчество" или просто "Имя"
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET 
                    Surname = 'Неизвестный',
                    Name = TRIM(SUBSTRING_INDEX(FullName, ' ', 1)),
                    Patronymic = IF(
                        CHAR_LENGTH(FullName) - CHAR_LENGTH(REPLACE(FullName, ' ', '')) >= 1,
                        TRIM(SUBSTRING_INDEX(FullName, ' ', -1)),
                        NULL
                    )
                WHERE Name IS NULL OR Name = '';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // При откате просто очищаем новые поля
            migrationBuilder.Sql("UPDATE Users SET Surname = NULL, Name = NULL, Patronymic = NULL;");
        }
    }
}
