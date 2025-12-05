SET NAMES utf8mb4;

UPDATE Users SET Surname = 'Неизвестный', Name = 'Иван', Patronymic = 'Иванович' WHERE UserId = 1;
UPDATE Users SET Surname = 'Неизвестный', Name = 'Иван', Patronymic = 'Иванович' WHERE UserId = 2;
UPDATE Users SET Surname = 'Неизвестный', Name = 'Иван', Patronymic = 'Петров' WHERE UserId = 3;
UPDATE Users SET Surname = 'Неизвестный', Name = 'Мария', Patronymic = 'Смирнова' WHERE UserId = 4;

SELECT UserId, Surname, Name, Patronymic, FullName FROM Users;
