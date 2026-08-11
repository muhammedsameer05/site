-- Madrasa Milad Management System Seed Data

USE `madrasa_milad_db`;

-- Seed Houses (Green House & Blue House)
INSERT INTO `houses` (`id`, `code`, `name`, `color_hex`, `motto`, `captain_name`, `total_points`) VALUES
(1, 'H-GRN', 'Green House', '#10B981', 'Courage and Devotion in Faith', 'Captain 1', 0),
(2, 'H-BLU', 'Blue House', '#3B82F6', 'Knowledge is Light and Guidance', 'Captain 2', 0);

-- Seed Categories
INSERT INTO `categories` (`id`, `name`, `min_age`, `max_age`, `description`) VALUES
(1, 'Kiddies', 5, 7, 'Kiddies Category'),
(2, 'Sub Junior', 8, 10, 'Sub Junior Category'),
(3, 'Junior', 11, 13, 'Junior Category'),
(4, 'Senior', 14, 16, 'Senior Category'),
(5, 'Super Senior', 17, 20, 'Super Senior Category');

-- Seed Venues
INSERT INTO `venues` (`id`, `name`, `stage_number`, `capacity`, `location`) VALUES
(1, 'Stage 1 (Imam Bukhari Stage)', 1, 500, 'Main Auditorium'),
(2, 'Stage 2 (Imam Shafi Stage)', 2, 200, 'Academic Hall'),
(3, 'Stage 3 (Imam Ghazali Hall)', 3, 150, 'Library Extension');

-- Seed Users
INSERT INTO `users` (`id`, `username`, `email`, `password`, `name`, `role`) VALUES
(1, 'superadmin', 'superadmin@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Usthad Sayyid Muhammed', 'super_admin'),
(2, 'admin', 'admin@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Usthad Abdul Rahman', 'admin'),
(3, 'judge1', 'judge1@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Qari Zakariya Al-Hafiz', 'judge');

-- Settings
INSERT INTO `settings` (`key_name`, `value`) VALUES
('school_name', 'Jamalullaili Secondary Madrasa, MKMJC - Payyanur'),
('milad_title', 'വൈബ് ഓഫ് മദീന 2K26'),
('academic_year', '2026-2027'),
('point_1st', '10'),
('point_2nd', '7'),
('point_3rd', '5'),
('point_participation', '3'),
('theme_primary', '#065F46');
