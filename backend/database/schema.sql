-- Madrasa Milad Management System - Full MySQL Schema

CREATE DATABASE IF NOT EXISTS `madrasa_milad_db`;
USE `madrasa_milad_db`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'judge', 'stage_coordinator', 'student', 'public') NOT NULL DEFAULT 'public',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Houses Table
CREATE TABLE IF NOT EXISTS `houses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(50) NOT NULL,
  `color_hex` VARCHAR(10) NOT NULL DEFAULT '#10B981',
  `motto` VARCHAR(255) DEFAULT NULL,
  `captain_name` VARCHAR(100) DEFAULT NULL,
  `total_points` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `min_age` INT DEFAULT 5,
  `max_age` INT DEFAULT 20,
  `description` TEXT DEFAULT NULL
);

-- Venues Table
CREATE TABLE IF NOT EXISTS `venues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `stage_number` INT NOT NULL,
  `capacity` INT DEFAULT 100,
  `location` VARCHAR(255) DEFAULT NULL
);

-- Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(20) NOT NULL UNIQUE,
  `admission_no` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `arabic_name` VARCHAR(100) DEFAULT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `gender` ENUM('male', 'female') NOT NULL DEFAULT 'male',
  `dob` DATE DEFAULT NULL,
  `age` INT DEFAULT 10,
  `class_name` VARCHAR(20) NOT NULL,
  `division` VARCHAR(10) NOT NULL,
  `house_id` INT DEFAULT NULL,
  `parent_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `qr_code` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE SET NULL
);

-- Judges Table
CREATE TABLE IF NOT EXISTS `judges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judge_code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `qualification` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `specialization` VARCHAR(100) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- Programs Table
CREATE TABLE IF NOT EXISTS `programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL,
  `age_group` VARCHAR(50) DEFAULT 'Sub Junior',
  `type` ENUM('individual', 'group') NOT NULL DEFAULT 'individual',
  `venue_id` INT DEFAULT NULL,
  `program_date` DATE DEFAULT NULL,
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `max_participants` INT DEFAULT 20,
  `status` ENUM('pending', 'running', 'completed') DEFAULT 'pending',
  `duration_minutes` INT DEFAULT 10,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE SET NULL
);

-- Program Judges Mapping Table
CREATE TABLE IF NOT EXISTS `program_judges` (
  `program_id` INT NOT NULL,
  `judge_id` INT NOT NULL,
  PRIMARY KEY (`program_id`, `judge_id`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`judge_id`) REFERENCES `judges`(`id`) ON DELETE CASCADE
);

-- Program Participants Table
CREATE TABLE IF NOT EXISTS `program_participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `chest_no` INT NOT NULL,
  `attendance` ENUM('present', 'absent', 'pending') DEFAULT 'pending',
  UNIQUE KEY `unique_program_student` (`program_id`, `student_id`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
);

-- Marks Table
CREATE TABLE IF NOT EXISTS `marks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `judge_id` INT NOT NULL,
  `presentation` DECIMAL(5,2) DEFAULT 0,
  `pronunciation` DECIMAL(5,2) DEFAULT 0,
  `confidence` DECIMAL(5,2) DEFAULT 0,
  `voice` DECIMAL(5,2) DEFAULT 0,
  `content` DECIMAL(5,2) DEFAULT 0,
  `memorization` DECIMAL(5,2) DEFAULT 0,
  `time_management` DECIMAL(5,2) DEFAULT 0,
  `overall_impression` DECIMAL(5,2) DEFAULT 0,
  `total_mark` DECIMAL(5,2) DEFAULT 0,
  `status` ENUM('draft', 'final') DEFAULT 'draft',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_mark` (`program_id`, `student_id`, `judge_id`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`judge_id`) REFERENCES `judges`(`id`) ON DELETE CASCADE
);

-- Results Table
CREATE TABLE IF NOT EXISTS `results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `total_score` DECIMAL(6,2) NOT NULL,
  `prize` ENUM('1st', '2nd', '3rd', 'participation', 'special') NOT NULL,
  `points_awarded` INT NOT NULL DEFAULT 0,
  `tie_breaker_note` VARCHAR(255) DEFAULT NULL,
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `certificate_no` VARCHAR(50) NOT NULL UNIQUE,
  `student_id` INT DEFAULT NULL,
  `program_id` INT DEFAULT NULL,
  `type` ENUM('winner', 'participation', 'judge', 'volunteer', 'coordinator') NOT NULL,
  `recipient_name` VARCHAR(100) NOT NULL,
  `issue_date` DATE NOT NULL,
  `pdf_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `priority` ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
  `posted_by` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `album_name` VARCHAR(100) NOT NULL DEFAULT 'Milad 2026',
  `title` VARCHAR(255) NOT NULL,
  `media_type` ENUM('photo', 'video') DEFAULT 'photo',
  `url` TEXT NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NOT NULL
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
