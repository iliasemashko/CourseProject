-- Добавляем новые колонки для разделения ФИО
ALTER TABLE Users ADD COLUMN Surname VARCHAR(100) DEFAULT '';
ALTER TABLE Users ADD COLUMN Name VARCHAR(100) DEFAULT '';
ALTER TABLE Users ADD COLUMN Patronymic VARCHAR(100) NULL;

-- Заполняем данные из FullName
-- Предполагается, что FullName в формате: "Фамилия Имя Отчество" или "Фамилия Имя"
UPDATE Users 
SET 
    Surname = TRIM(SUBSTRING_INDEX(FullName, ' ', 1)),
    Name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(FullName, ' ', 2), ' ', -1)),
    Patronymic = IF(
        CHAR_LENGTH(FullName) - CHAR_LENGTH(REPLACE(FullName, ' ', '')) >= 2,
        TRIM(SUBSTRING_INDEX(FullName, ' ', -1)),
        NULL
    )
WHERE Surname = '' OR Surname IS NULL;

-- Проверяем результат
SELECT UserId, Surname, Name, Patronymic, FullName FROM Users LIMIT 5;
