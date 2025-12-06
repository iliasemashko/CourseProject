using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedEmployeeToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedEmployeeId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_AssignedEmployeeId",
                table: "Orders",
                column: "AssignedEmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_AssignedEmployeeId",
                table: "Orders",
                column: "AssignedEmployeeId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_AssignedEmployeeId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_AssignedEmployeeId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AssignedEmployeeId",
                table: "Orders");
        }
    }
}
