CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'officer') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS degrees (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(1000) NULL,
  year2_weight TINYINT UNSIGNED NOT NULL DEFAULT 30,
  year3_weight TINYINT UNSIGNED NOT NULL DEFAULT 70,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_degree_weights CHECK (year2_weight + year3_weight = 100)
);

CREATE TABLE IF NOT EXISTS officer_degrees (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  officer_id INT UNSIGNED NOT NULL,
  degree_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_officer_degrees_degree (degree_id),
  KEY idx_officer_degrees_officer (officer_id),
  CONSTRAINT fk_officer_degrees_officer
    FOREIGN KEY (officer_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_officer_degrees_degree
    FOREIGN KEY (degree_id) REFERENCES degrees(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  student_number VARCHAR(50) NOT NULL,
  degree_id INT UNSIGNED NOT NULL,
  classification VARCHAR(100) NOT NULL DEFAULT 'Pending',
  final_average DECIMAL(5,2) NULL,
  year2_average DECIMAL(5,2) NULL,
  year3_average DECIMAL(5,2) NULL,
  rationale TEXT NULL,
  needs_review TINYINT(1) NOT NULL DEFAULT 0,
  override_classification VARCHAR(100) NULL,
  override_reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_number (student_number),
  KEY idx_students_degree (degree_id),
  CONSTRAINT fk_students_degree
    FOREIGN KEY (degree_id) REFERENCES degrees(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS modules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  credits INT UNSIGNED NOT NULL,
  year TINYINT UNSIGNED NOT NULL,
  degree_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_modules_degree (degree_id),
  CONSTRAINT fk_modules_degree
    FOREIGN KEY (degree_id) REFERENCES degrees(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  module_id INT UNSIGNED NOT NULL,
  mark INT UNSIGNED NOT NULL,
  is_resit TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_marks_student_module (student_id, module_id),
  KEY idx_marks_module (module_id),
  CONSTRAINT fk_marks_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_marks_module
    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_marks_mark CHECK (mark >= 0 AND mark <= 100)
);
