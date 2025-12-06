-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: santehorders
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
INSERT INTO `__efmigrationshistory` VALUES ('20251205172601_RemoveUserNameFields','9.0.0'),('20251206131909_FixOrderItemRelation','9.0.0'),('20251206134744_FixOrderItemRelationClean','9.0.0'),('20251206140014_CleanOrderItemRelation','9.0.0');
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `CommentId` int NOT NULL AUTO_INCREMENT,
  `OrderId` int NOT NULL,
  `UserId` int NOT NULL,
  `Text` text NOT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CommentId`),
  KEY `OrderId` (`OrderId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`OrderId`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,7,14,'Заказ принят в обработку','2025-12-06 13:13:10'),(2,7,13,'Проверяю детали заказа','2025-12-06 13:13:10'),(3,8,14,'Создан новый заказ','2025-12-06 13:13:10'),(4,8,13,'Подтверждаю получение информации','2025-12-06 13:13:10'),(5,7,14,'r','2025-12-06 14:39:55'),(6,7,14,'хай','2025-12-06 14:39:59'),(7,3,12,'dfsf','2025-12-06 14:54:48'),(8,32,14,'круто','2025-12-06 15:18:55');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitems` (
  `OrderItemId` int NOT NULL AUTO_INCREMENT,
  `OrderId` int NOT NULL,
  `ProductId` int NOT NULL,
  `Quantity` int NOT NULL DEFAULT '1',
  `Price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`OrderItemId`),
  KEY `ProductId` (`ProductId`),
  KEY `IX_OrderItems_OrderId` (`OrderId`),
  CONSTRAINT `FK_OrderItems_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`OrderId`) ON DELETE CASCADE,
  CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`ProductId`) REFERENCES `products` (`ProductId`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitems`
--

LOCK TABLES `orderitems` WRITE;
/*!40000 ALTER TABLE `orderitems` DISABLE KEYS */;
INSERT INTO `orderitems` VALUES (1,3,1,2,1499.99),(2,4,1,1,1499.99),(3,5,1,1,1499.99),(4,5,2,1,4999.50),(5,6,2,1,4999.50),(6,7,2,2,4999.50),(7,8,5,1,1999.99),(12,28,1,1,1499.99),(13,29,1,6,1499.99),(14,30,3,1,8999.00),(15,30,2,1,4999.50),(16,30,4,1,7999.75),(17,31,1,2,1499.99),(18,32,1,17,1499.99),(19,36,1,5,1499.99);
/*!40000 ALTER TABLE `orderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `OrderId` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `StatusId` int NOT NULL,
  `TotalAmount` decimal(10,2) DEFAULT '0.00',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `AssignedEmployeeId` int DEFAULT NULL,
  PRIMARY KEY (`OrderId`),
  KEY `UserId` (`UserId`),
  KEY `StatusId` (`StatusId`),
  KEY `IX_Orders_AssignedEmployeeId` (`AssignedEmployeeId`),
  CONSTRAINT `FK_Orders_Users_AssignedEmployeeId` FOREIGN KEY (`AssignedEmployeeId`) REFERENCES `users` (`UserId`) ON DELETE RESTRICT,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (3,3,4,2999.98,'2025-12-05 17:38:26','2025-12-06 20:33:59',13),(4,3,2,1499.99,'2025-12-05 17:42:22','2025-12-06 18:31:31',13),(5,8,2,6499.49,'2025-12-05 18:37:21','2025-12-06 18:32:34',13),(6,8,3,4999.50,'2025-12-05 18:45:59','2025-12-06 18:32:34',13),(7,14,1,9999.00,'2025-12-05 19:32:28','2025-12-06 18:32:34',13),(8,14,3,1999.99,'2025-12-05 20:33:21','2025-12-06 18:32:34',13),(28,14,1,1499.99,'2025-12-06 14:27:55','2025-12-06 18:32:34',13),(29,14,1,8999.94,'2025-12-06 14:45:34','2025-12-06 18:32:34',13),(30,14,1,21998.25,'2025-12-06 14:45:43','2025-12-06 18:32:34',13),(31,14,1,2999.98,'2025-12-06 14:51:48','2025-12-06 18:32:34',13),(32,14,1,25499.83,'2025-12-06 15:18:41','2025-12-06 18:32:34',13),(36,14,3,7499.95,'2025-12-06 16:13:31','2025-12-06 16:15:27',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderstatus`
--

DROP TABLE IF EXISTS `orderstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderstatus` (
  `StatusId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  PRIMARY KEY (`StatusId`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderstatus`
--

LOCK TABLES `orderstatus` WRITE;
/*!40000 ALTER TABLE `orderstatus` DISABLE KEYS */;
INSERT INTO `orderstatus` VALUES (2,'В обработке'),(3,'Выполнен'),(4,'Отменён'),(1,'Создан');
/*!40000 ALTER TABLE `orderstatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderstatuses`
--

DROP TABLE IF EXISTS `orderstatuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderstatuses` (
  `Name` varchar(56) NOT NULL,
  `StatusId` int NOT NULL,
  PRIMARY KEY (`StatusId`),
  UNIQUE KEY `Name_UNIQUE` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderstatuses`
--

LOCK TABLES `orderstatuses` WRITE;
/*!40000 ALTER TABLE `orderstatuses` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderstatuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `ProductId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` text,
  `Price` decimal(10,2) NOT NULL,
  `Category` varchar(50) DEFAULT NULL,
  `Stock` int DEFAULT '0',
  `Image` longblob,
  `ImageName` varchar(255) DEFAULT NULL,
  `ImageType` varchar(50) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductId`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Кухонный смеситель','Смесители для кухни Grohe',1499.00,'Смесители',5,NULL,'f64576cd-58a8-4b1b-829a-63a3085d9af8.jpg','image/jpeg','2025-12-05 17:50:28'),(2,'Унитаз подвесной','Подвесной унитаз с системой экономии воды',4999.50,'Унитазы',5,NULL,'product2.jpg','image/jpeg','2025-12-05 17:50:28'),(3,'Душевая кабина 90x90','Квадратная душевая кабина с дверцами из закаленного стекла',8999.00,'Душевые кабины',3,NULL,'product3.jpg','image/jpeg','2025-12-05 17:50:28'),(4,'Ванна акриловая 150x70','Прямоугольная акриловая ванна с усиленным дном',7999.75,'Ванны',4,NULL,'product4.jpg','image/jpeg','2025-12-05 17:50:28'),(5,'Раковина над стиральной машиной','Компактная раковина для установки над стиральной машиной',1999.99,'Раковины',8,NULL,'product5.jpg','image/jpeg','2025-12-05 17:50:28'),(26,'Сифон для ванны','Сифон для ванны',80.00,'Сифон',13,NULL,'a22b8de9-d340-478a-bcc8-7f2dd997b434.png','image/png','2025-12-06 21:12:23');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `RoleId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  PRIMARY KEY (`RoleId`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'Администратор'),(1,'Клиент'),(2,'Сотрудник');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `RoleId` int NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Email` (`Email`),
  KEY `RoleId` (`RoleId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`RoleId`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Иван Иванович','ivan@gmail.com','$2a$11$JJRtu/7HKJPUj7KHC6Np5.Aw8a3lufgUJs9jLOR58WYorGEbDzJJe',NULL,'2025-12-05 14:48:35'),(3,1,'Иван Петров','ivan.petrov@example.com','$2a$11$3nDa60h2h9NUgslq4hg0AuGEIfcRliTeGtQDwHM6fE2/HP5ucC.Wq',NULL,'2025-12-05 17:06:34'),(4,3,'Мария Смирнова','maria.smirnova@example.com','$2a$11$PjaEdRq8G6O8TDEhUo4PyOYCXxej.ykvROdFPscsbRJVngPDbNY1S',NULL,'2025-12-05 17:06:50'),(5,2,'Алексей Кузнецов','aleksey.kuznetsov@example.com','$2a$11$GnbJuHqYy7qwpojpgTdAUu.L3cnmz7r1hbVKvRvZyk1S2Kokvpucy',NULL,'2025-12-05 17:07:11'),(6,3,'Екатерина Морозова','ekaterina.morozova@example.com','$2a$11$qMHd8lAH6iP20FdMPduMYOheQBnsHLskkW1qok3jasrNsaBEPtYPG',NULL,'2025-12-05 18:06:25'),(8,1,'Дмитрий Орлов','dmitriy.orlov@example.com','$2a$11$LnIQcyQima4DadCUV72.UO2OA/LDoGqho4TVIHCO/9BWLjWG4ASeS',NULL,'2025-12-05 18:37:04'),(9,2,'Светлана Ковалева','svetlana.kovaleva@example.com','$2a$11$ktAIW2EHjQubtCXxLd30mO/HrgUbKPqAWJqsH.RxS8OAqI9EYbFWa',NULL,'2025-12-05 18:37:40'),(10,3,'Павел Сидоров','pavel.sidorov@example.com','$2a$11$dEUQ/z8YXmSb1kvseA4YYO.SmMrod25cRIQNGS3VB13iD08etfeie',NULL,'2025-12-05 18:38:09'),(11,1,'Александр Фролов','alex.frolov@example.com','$2a$11$1ekN0RuR0hU1edkANRlCgeXZHYfg3eYhtul8NfVe9Fm4ZkHwIRAu6',NULL,'2025-12-05 19:06:21'),(12,3,'Игорь Кузнецов','igor.kuznetsov@example.com','$2a$11$7/w8vfw5STbyFaaiIh2cYu1e.vyVr0tCr2CX9dRs6JUeBYIndZru.',NULL,'2025-12-06 20:58:39'),(13,2,'Ольга Лебедева','olga.lebedeva@example.com','$2a$11$SDLIGcQ4DwzZ2sI9GBZHKe3yb/Rgm3UHTBUxQIoxVTSnO0htMDxES',NULL,'2025-12-05 19:18:07'),(14,1,'Анатолий Носов','anatoly.nosov@example.com','$2a$11$IYhUkiE6mBJlTp0GHE2w6.S18KMdBZBC2pLX0vDcfLWJYAjH1GoHS',NULL,'2025-12-05 19:32:00'),(17,1,'Николай Ельцин','nikolaeltsin@gmail.com','$2a$11$5wQ7CUaRLCXlhBVXEY.cuOAep.lsbRiPbqbBCwTlwwch5Jesr39hm',NULL,'2025-12-06 20:15:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-07  1:35:26
