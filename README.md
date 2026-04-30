# HEdClass Portfolio

Portfolio deployment of a higher education classification management system built with Node.js, Express, EJS, and MySQL.

This repository is a portfolio-safe version of a university project. The core features and workflows are preserved, but the app has been prepared for deployment with environment variables, hosted MySQL support, safer session handling, and demo-only database content.

## Live Demo

Live demo: `TODO`

## Screenshots

Add screenshots here after deployment:

- Login page
- Officer dashboard
- Student management
- Marks and classification views
- Admin degree and assignment pages

## Tech Stack

- Node.js 20
- Express
- EJS
- MySQL
- `mysql2`
- `express-session`
- `helmet`
- `express-rate-limit`
- `bcrypt`

## Features

- Secure login with hashed passwords and role-based access
- Institutional admin workflow for officers, degrees, and assignments
- Classification officer workflow for students, modules, marks, and overrides
- Degree classification calculation using year weighting rules
- Borderline and review flag support
- CSV export for programme classification data

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
DB_NAME=hedclass_portfolio
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

- This app is prepared for a portfolio deployment target, not large-scale production traffic.
- Sessions still use the default in-memory session store, which is acceptable for a single-instance demo but not for a multi-instance production system.
- The repository intentionally includes demo-only credentials and fake data for review and testing.
