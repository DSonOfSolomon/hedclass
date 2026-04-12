# HEdClass – Higher Education Classification System

##  Overview

HEdClass is a web-based system for managing student classifications.
It allows classification officers to manage students, modules, marks, and generate degree classifications based on academic rules.

---

##  Installation & Setup

### 1. Install dependencies

```
npm install
```

---

### 2. Set up database

* Create a MySQL database
* Import and run the seeder file:

```
src/seeder/data.sql
```

This will populate:

* users
* degrees
* students
* modules
* marks

---

### 3. Run the application

```
node src/web/app.js
```

---

### 4. Access the system

```
http://localhost:3000
```

---

##  Login Credentials

### Admin

* Email: admin@hedclass.com
* Password: admin123

### Classification Officer 1

* Email: markspencer@mail.com
* Password: markspenser123

### Classification Officer 2

* Email: johnjoe@mail.com
* Password: JohnJoe123

---

##  Features

### Authentication

* Secure login using bcrypt
* Role-based access (Institutional Admin / Classification Officer)

---

### Admin Features

* Manage classification officers
* Manage degrees
* Assign officers to programmes
* Manage Assignments

---

### Officer Features

* View dashboard
* Manage students (CRUD)
* Manage modules (CRUD)
* Manage marks (CRUD)
* Run classification

---

### Classification Logic

* Weighted average:

  * Year 2 → 30%
  * Year 3 → 70%
* Resit marks capped at 40
* Failed modules → Not eligible
* Borderline cases flagged for review

---

### Dashboard

* Student count
* Programme count
* Module  count 
* Programme summary
* Classification distribution (chart + table)

---

##  Seeder

The system includes an idempotent SQL seeder:

```
src/seeder/data.sql
```

* Resets database
* Populates full dataset
* Ensures consistent testing

---

##  Project Structure

```
src/
  ├── seeder/
  ├── web/
  └── api/ (optional)
```

---

##  Notes

* Passwords are stored securely using bcrypt hashing
* System designed for demonstration and academic use

---

