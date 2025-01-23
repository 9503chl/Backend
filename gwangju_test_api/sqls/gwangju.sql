-- --------------------------------------------------------
-- 호스트:                          192.168.2.196
-- 서버 버전:                        11.6.2-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.9.0.6999
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- edudb 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `edudb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `edudb`;

-- 테이블 edudb.gwangju 구조 내보내기
CREATE TABLE IF NOT EXISTS `gwangju` (
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `student_id` varchar(50) NOT NULL,
  `initial_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `character_type` varchar(50) DEFAULT NULL,
  `facial_expression_1` mediumblob DEFAULT NULL,
  `facial_expression_2` mediumblob DEFAULT NULL,
  `facial_expression_3` mediumblob DEFAULT NULL,
  `facial_expression_4` mediumblob DEFAULT NULL,
  `material_texture_1` mediumblob DEFAULT NULL,
  `material_texture_2` mediumblob DEFAULT NULL,
  `material_texture_3` mediumblob DEFAULT NULL,
  `material_texture_4` mediumblob DEFAULT NULL,
  `material_texture_5` mediumblob DEFAULT NULL,
  `screenshot_image` mediumblob DEFAULT NULL,
  `friend_name` varchar(50) DEFAULT NULL,
  `villain_name` varchar(50) DEFAULT NULL,
  `bg_name` varchar(50) DEFAULT NULL,
  `scenario_text` varchar(50) DEFAULT NULL,
  `motion_data_1` mediumtext DEFAULT NULL,
  `motion_data_2` mediumtext DEFAULT NULL,
  `motion_data_3` mediumtext DEFAULT NULL,
  `motion_data_4` mediumtext DEFAULT NULL,
  `motion_data_5` mediumtext DEFAULT NULL,
  `video_file` longblob DEFAULT NULL,
  PRIMARY KEY (`user_id`,`student_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='광주 테스트용';

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
