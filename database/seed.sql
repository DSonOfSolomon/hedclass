SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE marks;
TRUNCATE TABLE modules;
TRUNCATE TABLE students;
TRUNCATE TABLE officer_degrees;
TRUNCATE TABLE degrees;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, name, email, password, role) VALUES
  (1, 'Portfolio Admin', 'admin@hed.com', '$2b$10$i7PZgV/18SGwtg95OHdxzOhCG4jQ.Hsh4R8rsuZlyXfUhegtAERdm', 'admin'),
  (2, 'Alex Carter', 'alex.carter@hed.com', '$2b$10$wo/aeaWytFIVUKlaPcWhwur9/zAzg7cuo01RBkn.x4LxJhRWFi3aG', 'officer'),
  (3, 'Sam Rivera', 'sam.rivera@hed.com', '$2b$10$06jFcKuc.F6WptJ8DHQpSOvVG3d.YbLv.MH3zW/KD0sIsXlOJXZeC', 'officer');

INSERT INTO degrees (id, name, description, year2_weight, year3_weight) VALUES
  (1, 'BSc Computer Science', 'Portfolio demo degree for honours classification workflows.', 30, 70),
  (2, 'BSc Software Engineering', 'Second demo degree used for admin assignment and officer dashboards.', 30, 70);

INSERT INTO officer_degrees (id, officer_id, degree_id) VALUES
  (1, 2, 1),
  (2, 3, 2);

INSERT INTO students (id, name, student_number, degree_id, classification) VALUES
  (1, 'Avery Brooks', 'P10001', 1, 'Pending'),
  (2, 'Jordan Ellis', 'P10002', 1, 'Pending'),
  (3, 'Taylor Morgan', 'P10003', 2, 'Pending'),
  (4, 'Casey Nguyen', 'P10004', 2, 'Pending');

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

INSERT INTO marks (student_id, module_id, mark, is_resit) VALUES
  (1, 1, 74, 0), (1, 2, 71, 0), (1, 3, 72, 0), (1, 4, 69, 0), (1, 5, 75, 0), (1, 6, 73, 0),
  (1, 7, 76, 0), (1, 8, 74, 0), (1, 9, 75, 0), (1, 10, 77, 0), (1, 11, 76, 0),
  (2, 1, 58, 0), (2, 2, 60, 0), (2, 3, 62, 0), (2, 4, 59, 0), (2, 5, 61, 0), (2, 6, 60, 0),
  (2, 7, 64, 0), (2, 8, 63, 0), (2, 9, 61, 0), (2, 10, 62, 0), (2, 11, 64, 0),
  (3, 12, 68, 0), (3, 13, 66, 0), (3, 14, 67, 0), (3, 15, 69, 0), (3, 16, 68, 0), (3, 17, 67, 0),
  (3, 18, 71, 0), (3, 19, 70, 0), (3, 20, 69, 0), (3, 21, 72, 0), (3, 22, 71, 0),
  (4, 12, 35, 0), (4, 13, 48, 0), (4, 14, 50, 0), (4, 15, 52, 0), (4, 16, 49, 0), (4, 17, 51, 0),
  (4, 18, 58, 0), (4, 19, 55, 0), (4, 20, 57, 0), (4, 21, 56, 0), (4, 22, 54, 0);
