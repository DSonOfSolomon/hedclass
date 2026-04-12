-- RESET DATABASE
DELETE FROM marks;
DELETE FROM modules;
DELETE FROM students;
DELETE FROM officer_degrees;
DELETE FROM degrees;
DELETE FROM users;

-- USERS
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin', 'admin@hedclass.com', '$2b$10$asnL3YbhfDdv8kNLir95teBBJ/Ls1ZXZh6Nz8uSewEmLt4ecrBPL6', 'admin'),
(4, 'Mark Spencer', 'markspencer@mail.com', '$2b$10$9IjaxTBuJrQIGx2N2Mfh.eNtQeiL1J2JLmwm47pqNwAvptIj35bbm', 'officer'),
(5, 'John Joe', 'Johnjoe@mail.com', '$2b$10$OplwCyb1EqkFyVglNu7b.eTGndnkmVy.yzXJP/Ht.F2JDCJBB/Bve', 'officer');

-- DEGREES
INSERT INTO degrees (id, name, description) VALUES
(1, 'BSc Computer Science', 'Computer Science degree'),
(2, 'BSc Electrical Engineering', 'Electrical Engineering degree'),
(3, 'BSc Software Engineering', 'Software Engineering degree');

-- OFFICER ASSIGNMENTS
INSERT INTO officer_degrees (officer_id, degree_id) VALUES
(4, 1), -- Mark Spencer: Computer Science
(4, 2), -- Mark Spencer: Electrical Engineering
(5, 3); -- John Joe: Software Engineering

-- STUDENTS

INSERT INTO students (id, name, student_number, degree_id) VALUES

-- Computer Science (10 students)
(1, 'Alice Smith', '10120134', 1),
(2, 'Bob Jones', '10120135', 1),
(3, 'Charlie Brown', '10120136', 1),
(4, 'David Lee', '10120137', 1),
(5, 'Emma White', '10120138', 1),
(6, 'Frank Green', '10120139', 1),
(7, 'Grace Hall', '10120140', 1),
(8, 'Henry King', '10120141', 1),
(9, 'Isla Scott', '10120142', 1),
(10, 'Jack Young', '10120143', 1),

-- Software Engineering (10 students)
(11, 'Liam Murphy', '10120150', 3),
(12, 'Noah Kelly', '10120151', 3),
(13, 'Jack Byrne', '10120152', 3),
(14, 'James Ryan', '10120153', 3),
(15, 'Daniel O''Connor', '10120154', 3),
(16, 'Conor Walsh', '10120155', 3),
(17, 'Sean O''Neill', '10120156', 3),
(18, 'Cian Doyle', '10120157', 3),
(19, 'Ethan McCarthy', '10120158', 3),
(20, 'Adam Gallagher', '10120159', 3);


-- MODULES

INSERT INTO modules (id, name, credits, year, degree_id) VALUES

-- COMPUTER SCIENCE (degree 1)

(1,'CS Y2 Module A',20,2,1),
(2,'CS Y2 Module B',20,2,1),
(3,'CS Y2 Module C',20,2,1),
(4,'CS Y2 Module D',20,2,1),
(5,'CS Y2 Module E',20,2,1),
(6,'CS Y2 Module F',20,2,1),

(7,'CS Dissertation',40,3,1),
(8,'CS Y3 Module A',20,3,1),
(9,'CS Y3 Module B',20,3,1),
(10,'CS Y3 Module C',20,3,1),
(11,'CS Y3 Module D',20,3,1),



-- ELECTRICAL ENGINEERING (degree 2)

(12,'EE Y2 Module A',20,2,2),
(13,'EE Y2 Module B',20,2,2),
(14,'EE Y2 Module C',20,2,2),
(15,'EE Y2 Module D',20,2,2),
(16,'EE Y2 Module E',20,2,2),
(17,'EE Y2 Module F',20,2,2),

(18,'EE Dissertation',40,3,2),
(19,'EE Y3 Module A',20,3,2),
(20,'EE Y3 Module B',20,3,2),
(21,'EE Y3 Module C',20,3,2),
(22,'EE Y3 Module D',20,3,2),


-- SOFTWARE ENGINEERING (degree 3)

(23,'SE Y2 Module A',20,2,3),
(24,'SE Y2 Module B',20,2,3),
(25,'SE Y2 Module C',20,2,3),
(26,'SE Y2 Module D',20,2,3),
(27,'SE Y2 Module E',20,2,3),
(28,'SE Y2 Module F',20,2,3),

(29,'Dissertation',40,3,3),
(30,'SE Y3 Module A',20,3,3),
(31,'SE Y3 Module B',20,3,3),
(32,'SE Y3 Module C',20,3,3),
(33,'SE Y3 Module D',20,3,3);


-- MARKS

INSERT INTO marks (student_id, module_id, mark, is_resit)
VALUES



-- COMPUTER SCIENCE (students 1–10)


-- Student 1 (First)
(1,1,72,0),(1,2,68,0),(1,3,65,0),(1,4,70,0),(1,5,75,0),(1,6,69,0),
(1,7,74,0),(1,8,71,0),(1,9,73,0),(1,10,76,0),(1,11,72,0),

-- Student 2 (2:1)
(2,1,65,0),(2,2,67,0),(2,3,66,0),(2,4,68,0),(2,5,69,0),(2,6,67,0),
(2,7,70,0),(2,8,69,0),(2,9,68,0),(2,10,71,0),(2,11,70,0),

-- Student 3 (2:2 borderline)
(3,1,59,0),(3,2,60,0),(3,3,58,0),(3,4,61,0),(3,5,60,0),(3,6,59,0),
(3,7,60,0),(3,8,59,0),(3,9,61,0),(3,10,60,0),(3,11,59,0),

-- Student 4 (Fail)
(4,1,35,0),(4,2,50,0),(4,3,55,0),(4,4,60,0),(4,5,58,0),(4,6,52,0),
(4,7,65,0),(4,8,62,0),(4,9,60,0),(4,10,63,0),(4,11,64,0),

-- Student 5 (Resit case)
(5,1,45,1),(5,2,50,0),(5,3,55,0),(5,4,60,0),(5,5,58,0),(5,6,52,0),
(5,7,65,0),(5,8,62,0),(5,9,60,0),(5,10,63,0),(5,11,64,0),

-- Student 6 (First)
(6,1,72,0),(6,2,70,0),(6,3,74,0),(6,4,73,0),(6,5,71,0),(6,6,72,0),
(6,7,75,0),(6,8,74,0),(6,9,73,0),(6,10,76,0),(6,11,75,0),

-- Student 7 (2:2)
(7,1,52,0),(7,2,50,0),(7,3,54,0),(7,4,53,0),(7,5,51,0),(7,6,52,0),
(7,7,55,0),(7,8,54,0),(7,9,53,0),(7,10,56,0),(7,11,55,0),

-- Student 8 (High 2:1 borderline)
(8,1,68,0),(8,2,69,0),(8,3,67,0),(8,4,70,0),(8,5,69,0),(8,6,68,0),
(8,7,70,0),(8,8,69,0),(8,9,68,0),(8,10,71,0),(8,11,70,0),

-- Student 9 (Third)
(9,1,45,0),(9,2,42,0),(9,3,44,0),(9,4,43,0),(9,5,46,0),(9,6,45,0),
(9,7,47,0),(9,8,48,0),(9,9,46,0),(9,10,45,0),(9,11,47,0),

-- Student 10 (Strong First)
(10,1,75,0),(10,2,73,0),(10,3,76,0),(10,4,74,0),(10,5,75,0),(10,6,76,0),
(10,7,78,0),(10,8,77,0),(10,9,76,0),(10,10,79,0),(10,11,78,0),


-- SOFTWARE ENGINEERING (students 11–20)


-- Student 11
(11,23,65,0),(11,24,68,0),(11,25,70,0),(11,26,66,0),(11,27,67,0),(11,28,69,0),
(11,29,72,0),(11,30,71,0),(11,31,70,0),(11,32,73,0),(11,33,72,0),

-- Student 12
(12,23,55,0),(12,24,58,0),(12,25,60,0),(12,26,57,0),(12,27,56,0),(12,28,59,0),
(12,29,62,0),(12,30,61,0),(12,31,60,0),(12,32,63,0),(12,33,62,0),

-- Student 13
(13,23,59,0),(13,24,60,0),(13,25,58,0),(13,26,61,0),(13,27,60,0),(13,28,59,0),
(13,29,60,0),(13,30,59,0),(13,31,61,0),(13,32,60,0),(13,33,59,0),

-- Student 14 (fail)
(14,23,35,0),(14,24,50,0),(14,25,55,0),(14,26,60,0),(14,27,58,0),(14,28,52,0),
(14,29,65,0),(14,30,62,0),(14,31,60,0),(14,32,63,0),(14,33,64,0),

-- Student 15 (resit)
(15,23,45,1),(15,24,50,0),(15,25,55,0),(15,26,60,0),(15,27,58,0),(15,28,52,0),
(15,29,65,0),(15,30,62,0),(15,31,60,0),(15,32,63,0),(15,33,64,0),

-- Student 16 (first)
(16,23,72,0),(16,24,70,0),(16,25,74,0),(16,26,73,0),(16,27,71,0),(16,28,72,0),
(16,29,75,0),(16,30,74,0),(16,31,73,0),(16,32,76,0),(16,33,75,0),

-- Student 17 (2:2)
(17,23,52,0),(17,24,50,0),(17,25,54,0),(17,26,53,0),(17,27,51,0),(17,28,52,0),
(17,29,55,0),(17,30,54,0),(17,31,53,0),(17,32,56,0),(17,33,55,0),

-- Student 18 (third)
(18,23,45,0),(18,24,42,0),(18,25,44,0),(18,26,43,0),(18,27,46,0),(18,28,45,0),
(18,29,47,0),(18,30,48,0),(18,31,46,0),(18,32,45,0),(18,33,47,0),

-- Student 19 (2:1)
(19,23,65,0),(19,24,67,0),(19,25,66,0),(19,26,68,0),(19,27,69,0),(19,28,67,0),
(19,29,70,0),(19,30,69,0),(19,31,68,0),(19,32,71,0),(19,33,70,0),

-- Student 20 (first)
(20,23,75,0),(20,24,73,0),(20,25,76,0),(20,26,74,0),(20,27,75,0),(20,28,76,0),
(20,29,78,0),(20,30,77,0),(20,31,76,0),(20,32,79,0),(20,33,78,0);