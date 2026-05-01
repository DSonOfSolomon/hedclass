SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE marks;
TRUNCATE TABLE modules;
TRUNCATE TABLE students;
TRUNCATE TABLE officer_degrees;
TRUNCATE TABLE degrees;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, name, email, password, role) VALUES
  (2, 'Alex Carter', 'alex.carter@hed.com', '$2b$10$wo/aeaWytFIVUKlaPcWhwur9/zAzg7cuo01RBkn.x4LxJhRWFi3aG', 'officer'),
  (3, 'Sam Rivera', 'sam.rivera@hed.com', '$2b$10$06jFcKuc.F6WptJ8DHQpSOvVG3d.YbLv.MH3zW/KD0sIsXlOJXZeC', 'officer');

-- Degree definitions
INSERT INTO degrees (id, name, description, year2_weight, year3_weight) VALUES
  (1, 'BSc Computer Science', 'Standard Computer Science degree', 30, 70),
  (2, 'BSc Software Engineering', 'Standard Software Enginnering degree', 30, 70);

-- Officer to degree assignments
INSERT INTO officer_degrees (id, officer_id, degree_id) VALUES
  (1, 2, 1),
  (2, 3, 2);

-- Demo students
-- Computer Science students (degree_id = 1)
INSERT INTO students (id, name, student_number, degree_id, classification) VALUES
  (1, 'Avery Brooks', 'P10001', 1, 'Pending'),
  (2, 'Jordan Ellis', 'P10002', 1, 'Pending'),
  (3, 'Morgan Patel', 'P10003', 1, 'Pending'),
  (4, 'Riley Turner', 'P10004', 1, 'Pending'),
  (5, 'Parker Shah', 'P10005', 1, 'Pending'),
  (6, 'Harper Lewis', 'P10006', 1, 'Pending'),
  (7, 'Cameron Ross', 'P10007', 1, 'Pending'),
  (8, 'Skyler James', 'P10008', 1, 'Pending'),
  (9, 'Quinn Foster', 'P10009', 1, 'Pending'),
  (10, 'Drew Bennett', 'P10010', 1, 'Pending'),
  -- Software Engineering students (degree_id = 2)
  (11, 'Taylor Morgan', 'P10011', 2, 'Pending'),
  (12, 'Casey Nguyen', 'P10012', 2, 'Pending'),
  (13, 'Jamie Collins', 'P10013', 2, 'Pending'),
  (14, 'Blake Murphy', 'P10014', 2, 'Pending'),
  (15, 'Rowan Hughes', 'P10015', 2, 'Pending'),
  (16, 'Ari Sullivan', 'P10016', 2, 'Pending'),
  (17, 'Logan Price', 'P10017', 2, 'Pending'),
  (18, 'Emerson Reed', 'P10018', 2, 'Pending'),
  (19, 'Finley Ward', 'P10019', 2, 'Pending'),
  (20, 'Sage Cooper', 'P10020', 2, 'Pending');

-- Degree modules
-- Computer Science modules (degree_id = 1)
INSERT INTO modules (id, name, credits, year, degree_id) VALUES
  (1, 'Algorithms', 20, 2, 1),
  (2, 'Databases', 20, 2, 1),
  (3, 'Networking', 20, 2, 1),
  (4, 'Web Engineering', 20, 2, 1),
  (5, 'Software Design', 20, 2, 1),
  (6, 'Operating Systems', 20, 2, 1),
  (7, 'Dissertation', 40, 3, 1),
  (8, 'Distributed Systems', 20, 3, 1),
  (9, 'Cloud Platforms', 20, 3, 1),
  (10, 'Security Engineering', 20, 3, 1),
  (11, 'Machine Learning', 20, 3, 1),
  -- Software Engineering modules (degree_id = 2)
  (12, 'Requirements Engineering', 20, 2, 2),
  (13, 'Testing Strategies', 20, 2, 2),
  (14, 'DevOps Foundations', 20, 2, 2),
  (15, 'Agile Delivery', 20, 2, 2),
  (16, 'UX Engineering', 20, 2, 2),
  (17, 'Mobile Development', 20, 2, 2),
  (18, 'Capstone Project', 40, 3, 2),
  (19, 'Platform Architecture', 20, 3, 2),
  (20, 'Site Reliability', 20, 3, 2),
  (21, 'Engineering Leadership', 20, 3, 2),
  (22, 'Data Intensive Systems', 20, 3, 2);

-- Demo marks
-- Computer Science marks: students 1-10, modules 1-11
INSERT INTO marks (student_id, module_id, mark, is_resit) VALUES
  (1, 1, 74, 0), (1, 2, 71, 0), (1, 3, 72, 0), (1, 4, 69, 0), (1, 5, 75, 0), (1, 6, 73, 0),
  (1, 7, 76, 0), (1, 8, 74, 0), (1, 9, 75, 0), (1, 10, 77, 0), (1, 11, 76, 0),
  (2, 1, 58, 0), (2, 2, 60, 0), (2, 3, 62, 0), (2, 4, 59, 0), (2, 5, 61, 0), (2, 6, 60, 0),
  (2, 7, 64, 0), (2, 8, 63, 0), (2, 9, 61, 0), (2, 10, 62, 0), (2, 11, 64, 0),
  (3, 1, 66, 0), (3, 2, 64, 0), (3, 3, 67, 0), (3, 4, 65, 0), (3, 5, 63, 0), (3, 6, 66, 0),
  (3, 7, 70, 0), (3, 8, 68, 0), (3, 9, 67, 0), (3, 10, 69, 0), (3, 11, 68, 0),
  (4, 1, 39, 0), (4, 2, 52, 0), (4, 3, 54, 0), (4, 4, 50, 0), (4, 5, 48, 0), (4, 6, 51, 0),
  (4, 7, 58, 0), (4, 8, 56, 0), (4, 9, 57, 0), (4, 10, 55, 0), (4, 11, 59, 0),
  (5, 1, 45, 1), (5, 2, 55, 0), (5, 3, 58, 0), (5, 4, 57, 0), (5, 5, 56, 0), (5, 6, 54, 0),
  (5, 7, 62, 0), (5, 8, 60, 0), (5, 9, 61, 0), (5, 10, 59, 0), (5, 11, 63, 0),
  (6, 1, 77, 0), (6, 2, 75, 0), (6, 3, 76, 0), (6, 4, 78, 0), (6, 5, 74, 0), (6, 6, 77, 0),
  (6, 7, 80, 0), (6, 8, 79, 0), (6, 9, 78, 0), (6, 10, 81, 0), (6, 11, 80, 0),
  (7, 1, 52, 0), (7, 2, 50, 0), (7, 3, 53, 0), (7, 4, 51, 0), (7, 5, 54, 0), (7, 6, 52, 0),
  (7, 7, 56, 0), (7, 8, 55, 0), (7, 9, 54, 0), (7, 10, 57, 0), (7, 11, 56, 0),
  (8, 1, 69, 0), (8, 2, 68, 0), (8, 3, 70, 0), (8, 4, 67, 0), (8, 5, 71, 0), (8, 6, 69, 0),
  (8, 7, 72, 0), (8, 8, 71, 0), (8, 9, 70, 0), (8, 10, 73, 0), (8, 11, 72, 0),
  (9, 1, 43, 0), (9, 2, 44, 0), (9, 3, 46, 0), (9, 4, 45, 0), (9, 5, 42, 0), (9, 6, 47, 0),
  (9, 7, 49, 0), (9, 8, 48, 0), (9, 9, 47, 0), (9, 10, 46, 0), (9, 11, 45, 0),
  (10, 1, 61, 0), (10, 2, 63, 0), (10, 3, 62, 0), (10, 4, 64, 0), (10, 5, 60, 0), (10, 6, 65, 0),
  (10, 7, 67, 0), (10, 8, 66, 0), (10, 9, 64, 0), (10, 10, 68, 0), (10, 11, 67, 0),

  
  -- Software Engineering marks: students 11-20, modules 12-22
  (11, 12, 68, 0), (11, 13, 66, 0), (11, 14, 67, 0), (11, 15, 69, 0), (11, 16, 68, 0), (11, 17, 67, 0),
  (11, 18, 71, 0), (11, 19, 70, 0), (11, 20, 69, 0), (11, 21, 72, 0), (11, 22, 71, 0),
  (12, 12, 35, 0), (12, 13, 48, 0), (12, 14, 50, 0), (12, 15, 52, 0), (12, 16, 49, 0), (12, 17, 51, 0),
  (12, 18, 58, 0), (12, 19, 55, 0), (12, 20, 57, 0), (12, 21, 56, 0), (12, 22, 54, 0),
  (13, 12, 74, 0), (13, 13, 72, 0), (13, 14, 73, 0), (13, 15, 71, 0), (13, 16, 75, 0), (13, 17, 74, 0),
  (13, 18, 77, 0), (13, 19, 76, 0), (13, 20, 75, 0), (13, 21, 78, 0), (13, 22, 77, 0),
  (14, 12, 59, 0), (14, 13, 61, 0), (14, 14, 60, 0), (14, 15, 58, 0), (14, 16, 62, 0), (14, 17, 59, 0),
  (14, 18, 64, 0), (14, 19, 63, 0), (14, 20, 61, 0), (14, 21, 65, 0), (14, 22, 64, 0),
  (15, 12, 44, 1), (15, 13, 54, 0), (15, 14, 56, 0), (15, 15, 55, 0), (15, 16, 53, 0), (15, 17, 57, 0),
  (15, 18, 60, 0), (15, 19, 59, 0), (15, 20, 58, 0), (15, 21, 61, 0), (15, 22, 60, 0),
  (16, 12, 65, 0), (16, 13, 64, 0), (16, 14, 66, 0), (16, 15, 67, 0), (16, 16, 63, 0), (16, 17, 65, 0),
  (16, 18, 69, 0), (16, 19, 68, 0), (16, 20, 67, 0), (16, 21, 70, 0), (16, 22, 69, 0),
  (17, 12, 52, 0), (17, 13, 50, 0), (17, 14, 51, 0), (17, 15, 53, 0), (17, 16, 54, 0), (17, 17, 52, 0),
  (17, 18, 56, 0), (17, 19, 55, 0), (17, 20, 54, 0), (17, 21, 57, 0), (17, 22, 56, 0),
  (18, 12, 70, 0), (18, 13, 69, 0), (18, 14, 71, 0), (18, 15, 72, 0), (18, 16, 68, 0), (18, 17, 70, 0),
  (18, 18, 74, 0), (18, 19, 73, 0), (18, 20, 72, 0), (18, 21, 75, 0), (18, 22, 74, 0),
  (19, 12, 46, 0), (19, 13, 45, 0), (19, 14, 47, 0), (19, 15, 48, 0), (19, 16, 44, 0), (19, 17, 46, 0),
  (19, 18, 50, 0), (19, 19, 49, 0), (19, 20, 48, 0), (19, 21, 51, 0), (19, 22, 50, 0),
  (20, 12, 62, 0), (20, 13, 63, 0), (20, 14, 61, 0), (20, 15, 64, 0), (20, 16, 65, 0), (20, 17, 62, 0),
  (20, 18, 67, 0), (20, 19, 66, 0), (20, 20, 65, 0), (20, 21, 68, 0), (20, 22, 67, 0);
