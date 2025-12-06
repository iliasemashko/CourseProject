-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema santehorders
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema santehorders
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `santehorders` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `santehorders` ;

-- -----------------------------------------------------
-- Table `santehorders`.`__efmigrationshistory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`__efmigrationshistory` (
  `MigrationId` VARCHAR(150) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  `ProductVersion` VARCHAR(32) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  PRIMARY KEY (`MigrationId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`roles` (
  `RoleId` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`RoleId`),
  UNIQUE INDEX `Name` (`Name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`users` (
  `UserId` INT NOT NULL AUTO_INCREMENT,
  `RoleId` INT NOT NULL,
  `FullName` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `PasswordHash` VARCHAR(255) NOT NULL,
  `Phone` VARCHAR(20) NULL DEFAULT NULL,
  `CreatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`),
  UNIQUE INDEX `Email` (`Email` ASC) VISIBLE,
  INDEX `RoleId` (`RoleId` ASC) VISIBLE,
  CONSTRAINT `users_ibfk_1`
    FOREIGN KEY (`RoleId`)
    REFERENCES `santehorders`.`roles` (`RoleId`))
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`orders` (
  `OrderId` INT NOT NULL AUTO_INCREMENT,
  `UserId` INT NOT NULL,
  `StatusId` INT NOT NULL,
  `TotalAmount` DECIMAL(10,2) NULL DEFAULT '0.00',
  `CreatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `AssignedEmployeeId` INT NULL DEFAULT NULL,
  PRIMARY KEY (`OrderId`),
  INDEX `UserId` (`UserId` ASC) VISIBLE,
  INDEX `StatusId` (`StatusId` ASC) VISIBLE,
  INDEX `IX_Orders_AssignedEmployeeId` (`AssignedEmployeeId` ASC) VISIBLE,
  CONSTRAINT `FK_Orders_Users_AssignedEmployeeId`
    FOREIGN KEY (`AssignedEmployeeId`)
    REFERENCES `santehorders`.`users` (`UserId`)
    ON DELETE RESTRICT,
  CONSTRAINT `orders_ibfk_1`
    FOREIGN KEY (`UserId`)
    REFERENCES `santehorders`.`users` (`UserId`))
ENGINE = InnoDB
AUTO_INCREMENT = 37
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`comments` (
  `CommentId` INT NOT NULL AUTO_INCREMENT,
  `OrderId` INT NOT NULL,
  `UserId` INT NOT NULL,
  `Text` TEXT NOT NULL,
  `CreatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CommentId`),
  INDEX `OrderId` (`OrderId` ASC) VISIBLE,
  INDEX `UserId` (`UserId` ASC) VISIBLE,
  CONSTRAINT `comments_ibfk_1`
    FOREIGN KEY (`OrderId`)
    REFERENCES `santehorders`.`orders` (`OrderId`)
    ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2`
    FOREIGN KEY (`UserId`)
    REFERENCES `santehorders`.`users` (`UserId`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`products` (
  `ProductId` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(100) NOT NULL,
  `Description` TEXT NULL DEFAULT NULL,
  `Price` DECIMAL(10,2) NOT NULL,
  `Category` VARCHAR(50) NULL DEFAULT NULL,
  `Stock` INT NULL DEFAULT '0',
  `Image` LONGBLOB NULL DEFAULT NULL,
  `ImageName` VARCHAR(255) NULL DEFAULT NULL,
  `ImageType` VARCHAR(50) NULL DEFAULT NULL,
  `CreatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductId`))
ENGINE = InnoDB
AUTO_INCREMENT = 27
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`orderitems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`orderitems` (
  `OrderItemId` INT NOT NULL AUTO_INCREMENT,
  `OrderId` INT NOT NULL,
  `ProductId` INT NOT NULL,
  `Quantity` INT NOT NULL DEFAULT '1',
  `Price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`OrderItemId`),
  INDEX `ProductId` (`ProductId` ASC) VISIBLE,
  INDEX `IX_OrderItems_OrderId` (`OrderId` ASC) VISIBLE,
  CONSTRAINT `FK_OrderItems_Orders_OrderId`
    FOREIGN KEY (`OrderId`)
    REFERENCES `santehorders`.`orders` (`OrderId`)
    ON DELETE CASCADE,
  CONSTRAINT `orderitems_ibfk_2`
    FOREIGN KEY (`ProductId`)
    REFERENCES `santehorders`.`products` (`ProductId`))
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`orderstatus`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`orderstatus` (
  `StatusId` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`StatusId`),
  UNIQUE INDEX `Name` (`Name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `santehorders`.`orderstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `santehorders`.`orderstatuses` (
  `Name` VARCHAR(56) NOT NULL,
  `StatusId` INT NOT NULL,
  PRIMARY KEY (`StatusId`),
  UNIQUE INDEX `Name_UNIQUE` (`Name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
