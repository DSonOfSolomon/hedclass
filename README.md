# HEdClass

A higher education classification management system built with Node.js, Express, EJS, and MySQL.

This repository contains a production-ready version of a university classification system. The core features and workflows are preserved, with deployment-oriented improvements such as environment variables, hosted MySQL support, safer session handling, and demo-only database content.

The focus of this version is not just CRUD functionality. It also shows production-minded improvements around configuration management, hosted database integration, session security, automated verification, and deployment workflow.

## Live Demo

Live demo: [https://hedclass.onrender.com](https://hedclass.onrender.com)

## Screenshots

Screenshots can be added here to support the live demo:

- Login page
- Officer dashboard
- Student management
- Marks and classification views
- Admin degree and assignment pages

Current live deployment: [https://hedclass.onrender.com](https://hedclass.onrender.com)

## Tech Stack

- Node.js 20
- Express
- EJS
- MySQL
- `mysql2`
- `express-session`
- `express-mysql-session`
- `helmet`
- `express-rate-limit`
- `bcrypt`
- GitHub Actions

## Architecture Overview

- Express routes map to focused controllers for auth, admin, students, modules, marks, and exports
- EJS is used for server-rendered views and form workflows
- MySQL stores users, programme data, marks, and session records
- Session management uses `express-session` with a MySQL-backed store for deployed environments
- Classification logic is isolated in a reusable utility for easier testing

## Domain Logic

This project goes beyond basic CRUD by implementing domain-specific academic classification rules:

- degree classifications are calculated from weighted year 2 and year 3 averages
- resit marks are capped before the final calculation
- failed modules and incomplete credit totals block honours classification
- borderline and policy-sensitive outcomes are flagged for manual review
- officers can apply manual overrides with a recorded reason

These rules are part of what makes the project more representative of real business logic rather than a generic admin dashboard.

## Productionization Highlights

- Environment variables are used for database credentials, session secrets, deployment mode, and port binding
- The app is configured for hosted MySQL providers such as Aiven, including SSL support
- Sessions are stored in MySQL for deployed environments instead of relying on the default in-memory store
- Security headers are enabled with `helmet`
- Login attempts are rate-limited
- Passwords are stored as bcrypt hashes
- Validation is applied to common form inputs before database writes
- Friendly flash messages and dedicated error pages replace many raw text failure responses
- CI runs linting and automated tests on GitHub Actions

## Features

- Secure login with hashed passwords and role-based access
- Institutional admin workflow for officers, degrees, and assignments
- Classification officer workflow for students, modules, marks, and overrides
- Degree classification calculation using year weighting rules
- Borderline and review flag support
- CSV export for programme classification data
- Friendly flash messages and dedicated error pages for common failures
- Automated tests for auth, access control, and classification rules
- GitHub Actions CI for install, lint, and test verification

## Demo Accounts

- Admin
  `admin@hed.com` / `Admin123!`
- Officer
  `alex.carter@hed.com` / `Acarter123!`
- Second officer
  `sam.rivera@hed.com` / `Arivera123!`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from the example:

```bash
cp .env.example .env
```

3. Fill in `.env` with your local database credentials:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=hedclass_app
DB_PASSWORD=change-me
DB_NAME=hedclass
SESSION_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
PORT=3000
DB_SSL=false
```

4. Create the database and import the schema and demo data:

```bash
mysql -u your_user -p your_database_name < database/schema.sql
mysql -u your_user -p your_database_name < database/seed.sql
```

5. Start the app:

```bash
npm start
```

To run the automated checks locally:

```bash
npm run check
```

6. Open:

```text
http://localhost:3000
```

## Environment Variables

Required:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `SESSION_SECRET`
- `NODE_ENV`
- `PORT`

Optional for hosted MySQL:

- `DB_SSL=true`
- `DB_SSL_CA_BASE64`
- `DB_SSL_REJECT_UNAUTHORIZED=true`

## Database Setup

The SQL files used for setup are in [`database/schema.sql`](/Users/dannycanary/40490439/database/schema.sql) and [`database/seed.sql`](/Users/dannycanary/40490439/database/seed.sql).

- `schema.sql` creates the tables and constraints
- `seed.sql` loads fake demo accounts, degrees, students, modules, and marks

No real user data or coursework submission data is included.

## Deployment: Render + Aiven MySQL

### Aiven MySQL

1. Create a MySQL service in Aiven.
2. Create a database for the app.
3. Run:

```bash
mysql --host your-aiven-host --port your-aiven-port --user your-aiven-user --password your-aiven-database < database/schema.sql
mysql --host your-aiven-host --port your-aiven-port --user your-aiven-user --password your-aiven-database < database/seed.sql
```

4. If Aiven requires certificate-based verification, convert the CA certificate to base64 and store it in `DB_SSL_CA_BASE64`.

### Render Web Service

1. Push this repository to GitHub.
2. Create a new Render Web Service from the repository.
3. Set the build command to:

```bash
npm install
```

4. Set the start command to:

```bash
npm start
```

5. Add these environment variables in Render:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `PORT`
- `DB_SSL=true`
- `DB_SSL_CA_BASE64` if your Aiven setup needs an explicit CA value

This split deployment was chosen intentionally:

- Render is used for the Node.js web application
- Aiven is used for the hosted MySQL database
- application secrets stay in environment variables rather than source code
- the app can be rebuilt and redeployed independently of the database service

## Technical Decisions

- `EJS` was kept instead of rewriting to a frontend SPA because the goal was to productionize the existing project safely, not replace its rendering model.
- `express-mysql-session` was added so deployed sessions survive restarts and behave more like a real hosted app.
- Classification logic was extracted into a standalone utility so the core rules can be tested independently of Express routes.
- The project uses server-rendered flash messages and an error page rather than introducing a larger frontend state system for simple form workflows.
- Hosted MySQL SSL configuration is environment-driven so the same codebase works locally and on Aiven with minimal branching.
- GitHub Actions was added to verify install, lint, and test steps automatically on pushes and pull requests.

## Testing

The project includes:

- unit tests for classification rule calculation
- integration tests for login, access control, and key student workflow routes
- ESLint-based static checks

Run them with:

```bash
npm run check
```

## Project Structure

```text
40490439/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   └── web/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── public/
│       ├── routes/
│       ├── utils/
│       └── views/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Notes

- This app is prepared for a hosted deployment target, not large-scale production traffic.
- Production sessions are stored in MySQL. Tests use an in-memory session store to keep the suite isolated.
- The repository intentionally includes demo-only credentials and fake data for review and testing.
- Screenshots can be added later to strengthen the documentation further.
