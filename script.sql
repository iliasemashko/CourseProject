-- Создание базы данных
CREATE DATABASE IF NOT EXISTS SantehOrders;
USE SantehOrders;

-- Таблица ролей пользователей
CREATE TABLE Roles (
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE
);

-- Таблица пользователей
CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    RoleId INT NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- Таблица товаров с изображениями
CREATE TABLE Products (
    ProductId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    Category VARCHAR(50),
    Stock INT DEFAULT 0,
    Image LONGBLOB,           -- поле для хранения изображения
    ImageName VARCHAR(255),    -- имя файла изображения
    ImageType VARCHAR(50),     -- тип изображения (например, image/png)
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статусов заказов
CREATE TABLE OrderStatus (
    StatusId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE
);

-- Таблица заказов
CREATE TABLE Orders (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    StatusId INT NOT NULL,
    TotalAmount DECIMAL(10,2) DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (StatusId) REFERENCES OrderStatus(StatusId)
);

-- Таблица позиций заказа
CREATE TABLE OrderItems (
    OrderItemId INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- Таблица комментариев к заказам
CREATE TABLE Comments (
    CommentId INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    UserId INT NOT NULL,
    Text TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Таблица ролей пользователей
CREATE TABLE Roles (
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE
);

-- Таблица пользователей
CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    RoleId INT NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- Таблица товаров с изображениями
CREATE TABLE Products (
    ProductId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    Category VARCHAR(50),
    Stock INT DEFAULT 0,
    Image LONGBLOB,           -- поле для хранения изображения
    ImageName VARCHAR(255),    -- имя файла изображения
    ImageType VARCHAR(50),     -- тип изображения (например, image/png)
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статусов заказов
CREATE TABLE OrderStatus (
    StatusId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE
);

-- Таблица заказов
CREATE TABLE Orders (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    StatusId INT NOT NULL,
    TotalAmount DECIMAL(10,2) DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (StatusId) REFERENCES OrderStatus(StatusId)
);

-- Таблица позиций заказа
CREATE TABLE OrderItems (
    OrderItemId INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- Таблица комментариев к заказам
CREATE TABLE Comments (
    CommentId INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    UserId INT NOT NULL,
    Text TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Начальные данные для ролей
INSERT INTO Roles (Name) VALUES ('Клиент'), ('Сотрудник'), ('Администратор');

-- Начальные данные для статусов заказов
INSERT INTO OrderStatus (Name) VALUES ('Создан'), ('В обработке'), ('Выполнен'), ('Отменён');