-- Скрипт для связи картинок с товарами
-- Обновляем существующие товары, добавляя названия картинок

UPDATE `santehorders`.`products` 
SET `ImageName` = 'product1.jpg', `ImageType` = 'image/jpeg'
WHERE `ProductId` = 1;

UPDATE `santehorders`.`products` 
SET `ImageName` = 'product2.jpg', `ImageType` = 'image/jpeg'
WHERE `ProductId` = 2;

UPDATE `santehorders`.`products` 
SET `ImageName` = 'product3.jpg', `ImageType` = 'image/jpeg'
WHERE `ProductId` = 3;

UPDATE `santehorders`.`products` 
SET `ImageName` = 'product4.jpg', `ImageType` = 'image/jpeg'
WHERE `ProductId` = 4;

UPDATE `santehorders`.`products` 
SET `ImageName` = 'product5.jpg', `ImageType` = 'image/jpeg'
WHERE `ProductId` = 5;

UPDATE `santehorders`.`products` 
SET `ImageName` = 'product6.jpg', `ImageType` = 'image/jpeg'
WHERE `ProductId` = 6;
