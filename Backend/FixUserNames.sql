-- Скрипт для корректировки данных пользователей
-- Исправляем данные, предполагая что FullName = "Имя Отчество" (нужна только Фамилия)

UPDATE Users 
SET 
    Surname = 'Неизвестный',
    Name = TRIM(SUBSTRING_INDEX(FullName, ' ', 1)),
    Patronymic = IF(
        CHAR_LENGTH(FullName) - CHAR_LENGTH(REPLACE(FullName, ' ', '')) >= 1,
        TRIM(SUBSTRING_INDEX(FullName, ' ', -1)),
        NULL
    )
WHERE (Surname = '' OR Surname IS NULL OR Surname = 'Иван' OR Surname = 'Мария');

-- Проверяем результат
SELECT UserId, Surname, Name, Patronymic, FullName FROM Users;
