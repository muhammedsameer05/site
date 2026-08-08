-- Madrasa Milad Management System Seed Data

USE `madrasa_milad_db`;

-- Seed Houses
INSERT INTO `houses` (`id`, `code`, `name`, `color_hex`, `motto`, `captain_name`, `total_points`) VALUES
(1, 'H-GRN', 'Green House', '#10B981', 'Courage and Devotion in Faith', 'Ahmad Bin Ziyad', 145),
(2, 'H-BLU', 'Blue House', '#3B82F6', 'Knowledge is Light and Guidance', 'Muhammed Fayaz', 132),
(3, 'H-RED', 'Red House', '#EF4444', 'Excellence through Virtuous Endeavor', 'Salman Faris', 118),
(4, 'H-YLW', 'Yellow House', '#F59E0B', 'Unity, Wisdom, and Harmony', 'Bilal Bin Rabah', 104);

-- Seed Categories
INSERT INTO `categories` (`id`, `name`, `min_age`, `max_age`, `description`) VALUES
(1, 'Kids', 5, 8, 'Students from Class 1 to Class 3'),
(2, 'Sub Junior', 9, 11, 'Students from Class 4 to Class 6'),
(3, 'Junior', 12, 14, 'Students from Class 7 to Class 9'),
(4, 'Senior', 15, 18, 'Students from Class 10 to Higher Secondary');

-- Seed Venues
INSERT INTO `venues` (`id`, `name`, `stage_number`, `capacity`, `location`) VALUES
(1, 'Auditorium Main Stage (Imam Bukhari Stage)', 1, 500, 'Main Building Ground Floor'),
(2, 'Stage 2 (Imam Shafi Stage)', 2, 200, 'Academic Block 1st Floor'),
(3, 'Stage 3 (Imam Ghazali Hall)', 3, 150, 'Library Extension Block'),
(4, 'Open Air Stage (Syed Alavi Hall)', 4, 300, 'Madrasa Courtyard Area');

-- Seed Users
INSERT INTO `users` (`id`, `username`, `email`, `password`, `name`, `role`) VALUES
(1, 'superadmin', 'superadmin@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Usthad Sayyid Muhammed', 'superadmin'),
(2, 'admin', 'admin@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Usthad Abdul Rahman', 'admin'),
(3, 'judge1', 'judge1@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Qari Zakariya Al-Hafiz', 'judge'),
(4, 'judge2', 'judge2@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Dr. Luqman Hakeem', 'judge'),
(5, 'coordinator1', 'stage1@madrasa.org', '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8', 'Umer Farooq', 'stage_coordinator');

-- Seed Judges
INSERT INTO `judges` (`id`, `judge_code`, `name`, `qualification`, `phone`, `email`, `specialization`, `user_id`) VALUES
(1, 'JDG-001', 'Qari Zakariya Al-Hafiz', 'M.A. Islamic Studies, Qiraat Specialist', '+91 9876543210', 'judge1@madrasa.org', 'Tajweed & Quran Recitation', 3),
(2, 'JDG-002', 'Dr. Luqman Hakeem', 'Ph.D. Arabic Literature', '+91 9876543211', 'judge2@madrasa.org', 'Arabic & Malayalam Eloquence', 4),
(3, 'JDG-003', 'Usthad Zainul Abideen', 'Fazil Baqavi', '+91 9876543212', 'zain@madrasa.org', 'Nasheed & Voice Culture', NULL);

-- Seed Students
INSERT INTO `students` (`id`, `student_id`, `admission_no`, `name`, `arabic_name`, `gender`, `dob`, `age`, `class_name`, `division`, `house_id`, `parent_name`, `phone`, `email`, `address`) VALUES
(1, 'STU-1001', 'ADM-2024-01', 'Muhammed Danish', 'محمد دانش', 'male', '2012-05-14', 14, 'Class 8', 'A', 1, 'Ibrahim K.T.', '+91 9123456789', 'danish@mail.com', 'Green Villa, Calicut Road'),
(2, 'STU-1002', 'ADM-2024-02', 'Ahmad Zayan', 'أحمد زيان', 'male', '2013-08-20', 13, 'Class 7', 'B', 2, 'Kassim Ali', '+91 9123456790', 'zayan@mail.com', 'Noor Manzil, Madrasa Nagar'),
(3, 'STU-1003', 'ADM-2024-03', 'Fathima Zahra', 'فاطمة الزهراء', 'female', '2014-02-10', 12, 'Class 6', 'A', 3, 'Muhammed Shareef', '+91 9123456791', 'zahra@mail.com', 'Rose Garden, Beach Road'),
(4, 'STU-1004', 'ADM-2024-04', 'Aisha Raihana', 'عائشة ريحانة', 'female', '2011-11-05', 15, 'Class 9', 'A', 4, 'Abdul Latheef', '+91 9123456792', 'aisha@mail.com', 'Baitul Noor, Market Street'),
(5, 'STU-1005', 'ADM-2024-05', 'Omar Abdullah', 'عمر عبد الله', 'male', '2015-09-12', 11, 'Class 5', 'B', 1, 'Abdullah K.', '+91 9123456793', 'omar@mail.com', 'Al-Madina House, Town Hall');

-- Seed Programs
INSERT INTO `programs` (`id`, `code`, `name`, `category_id`, `age_group`, `type`, `venue_id`, `program_date`, `start_time`, `end_time`, `max_participants`, `status`, `duration_minutes`) VALUES
(1, 'PRG-101', 'Quran Recitation (Tilawat)', 3, 'Junior', 'individual', 1, '2026-08-15', '09:00:00', '10:30:00', 10, 'running', 90),
(2, 'PRG-102', 'Hifz Competition (Juz 30)', 2, 'Sub Junior', 'individual', 2, '2026-08-15', '09:30:00', '11:00:00', 8, 'pending', 90),
(3, 'PRG-103', 'Arabic Elocution (Speech)', 4, 'Senior', 'individual', 1, '2026-08-15', '11:00:00', '12:30:00', 12, 'pending', 90),
(4, 'PRG-104', 'Malayalam Speech', 3, 'Junior', 'individual', 3, '2026-08-15', '10:00:00', '11:30:00', 10, 'completed', 90),
(5, 'PRG-105', 'Nasheed (Islamic Song)', 3, 'Junior', 'individual', 4, '2026-08-15', '11:30:00', '01:00:00', 15, 'pending', 90),
(6, 'PRG-106', 'Duff Performance (Group)', 4, 'Senior', 'group', 1, '2026-08-15', '02:00:00', '04:00:00', 6, 'pending', 120),
(7, 'PRG-107', 'Islamic Quiz', 3, 'Junior', 'group', 2, '2026-08-15', '02:00:00', '03:30:00', 8, 'pending', 90),
(8, 'PRG-108', 'Arabic Calligraphy', 4, 'Senior', 'individual', 3, '2026-08-15', '02:00:00', '04:00:00', 15, 'pending', 120);

-- Program Judges Assignment
INSERT INTO `program_judges` (`program_id`, `judge_id`) VALUES
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2), (3, 3),
(4, 2);

-- Program Participants
INSERT INTO `program_participants` (`program_id`, `student_id`, `chest_no`, `attendance`) VALUES
(1, 1, 101, 'present'),
(1, 2, 102, 'present'),
(1, 3, 103, 'present'),
(1, 4, 104, 'present'),
(1, 5, 105, 'present'),
(4, 1, 201, 'present'),
(4, 2, 202, 'present'),
(4, 3, 203, 'present');

-- Sample Marks for Program 4 (Malayalam Speech)
INSERT INTO `marks` (`program_id`, `student_id`, `judge_id`, `presentation`, `pronunciation`, `confidence`, `voice`, `content`, `memorization`, `time_management`, `overall_impression`, `total_mark`, `status`) VALUES
(4, 1, 2, 14.0, 14.5, 13.0, 13.5, 14.0, 10.0, 9.5, 9.0, 97.5, 'final'),
(4, 2, 2, 13.0, 13.0, 12.5, 12.0, 13.0, 9.0, 9.0, 8.5, 90.0, 'final'),
(4, 3, 2, 12.0, 12.5, 11.5, 11.0, 12.0, 8.5, 8.0, 8.0, 83.5, 'final');

-- Results for Program 4
INSERT INTO `results` (`program_id`, `student_id`, `total_score`, `prize`, `points_awarded`) VALUES
(4, 1, 97.5, '1st', 10),
(4, 2, 90.0, '2nd', 7),
(4, 3, 83.5, '3rd', 5);

-- Announcements
INSERT INTO `announcements` (`title`, `content`, `priority`, `posted_by`) VALUES
('Welcome to Milad-un-Nabi Festival 2026', 'We are delighted to announce the grand inauguration of Madrasa Milad Festival 2026. All programs start at 9:00 AM sharp at Stage 1.', 'high', 'Madrasa Committee'),
('Live Leaderboard Active', 'Parents and guests can watch live real-time scores and house standings on the digital screens or on our official website portal.', 'normal', 'IT Cell');

-- Gallery
INSERT INTO `gallery` (`album_name`, `title`, `media_type`, `url`, `caption`) VALUES
('Milad 2026 Highlights', 'Opening Ceremony & Qiraat Recitation', 'photo', 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80', 'Inaugural prayer session led by Principal Usthad'),
('Stage 1 Events', 'Duff Group Performance', 'photo', 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80', 'Senior students presenting traditional Duff song');

-- Settings
INSERT INTO `settings` (`key_name`, `value`) VALUES
('school_name', 'Madrasat-ul-Huda Islamic Academy'),
('milad_title', 'Grand Milad-un-Nabi Fest 2026'),
('academic_year', '2026-2027'),
('point_1st', '10'),
('point_2nd', '7'),
('point_3rd', '5'),
('point_participation', '3'),
('theme_primary', '#065F46');
