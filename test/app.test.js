const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const mock = require("mock-require");

const webRoot = path.resolve(__dirname, "../src/web");
const dbPath = path.join(webRoot, "models", "db.js");

function clearWebModules() {
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(webRoot)) {
      delete require.cache[key];
    }
  }
}

function createMockDb(handlers) {
  return {
    query(sql, params, callback) {
      let actualParams = params;
      let actualCallback = callback;

      if (typeof params === "function") {
        actualCallback = params;
        actualParams = [];
      }

      const handler = handlers.find((item) => item.match(sql, actualParams));

      if (!handler) {
        actualCallback(new Error(`Unhandled query in test: ${sql}`));
        return;
      }

      if (handler.onCall) {
        handler.onCall(actualParams);
      }

      if (handler.error) {
        actualCallback(handler.error);
        return;
      }

      actualCallback(null, handler.result);
    },
  };
}

function loadModule(relativePath, handlers) {
  process.env.NODE_ENV = "test";
  process.env.SESSION_SECRET = "test-secret";
  process.env.SESSION_STORE = "memory";

  mock.stopAll();
  clearWebModules();
  mock(dbPath, createMockDb(handlers));
  return require(path.join(webRoot, relativePath));
}

function createResponse() {
  return {
    attachmentName: null,
    cookiesCleared: [],
    headers: {},
    locals: {},
    redirectedTo: null,
    rendered: null,
    sent: null,
    statusCode: 200,
    attachment(name) {
      this.attachmentName = name;
      return this;
    },
    clearCookie(name) {
      this.cookiesCleared.push(name);
      return this;
    },
    header(name, value) {
      this.headers[name] = value;
      return this;
    },
    redirect(path) {
      this.redirectedTo = path;
      return this;
    },
    render(view, data) {
      this.rendered = { view, data };
      return this;
    },
    send(payload) {
      this.sent = payload;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
  };
}

async function flushAsyncWork() {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

test("isAuthenticated redirects unauthenticated users to login", () => {
  const authMiddleware = loadModule("middleware/authMiddleware.js", []);
  const req = { session: {} };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware.isAuthenticated(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.redirectedTo, "/login");
});

test("isAdmin renders a 403 error page for officers", () => {
  const authMiddleware = loadModule("middleware/authMiddleware.js", []);
  const req = { session: { user: { role: "officer" } } };
  const res = createResponse();

  authMiddleware.isAdmin(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.equal(res.rendered.view, "error");
  assert.match(res.rendered.data.message, /admins only/i);
});

test("authController.login rejects invalid credentials with a friendly error", async () => {
  const passwordHash = await bcrypt.hash("CorrectPassword1!", 4);
  const authController = loadModule("controllers/authController.js", [
    {
      match: (sql) => sql.includes("SELECT * FROM users WHERE email = ?"),
      result: [{ id: 1, name: "Admin", email: "admin@hed.com", password: passwordHash, role: "admin" }],
    },
  ]);

  const req = { body: { email: "admin@hed.com", password: "WrongPassword1!" }, session: {} };
  const res = createResponse();

  authController.login(req, res);
  await flushAsyncWork();

  assert.equal(res.statusCode, 401);
  assert.equal(res.rendered.view, "login");
  assert.match(res.rendered.data.error, /invalid email or password/i);
});

test("authController.login creates a session and redirects admins", async () => {
  const passwordHash = await bcrypt.hash("Admin123!", 4);
  const authController = loadModule("controllers/authController.js", [
    {
      match: (sql) => sql.includes("SELECT * FROM users WHERE email = ?"),
      result: [{ id: 1, name: "Admin", email: "admin@hed.com", password: passwordHash, role: "admin" }],
    },
  ]);

  const req = { body: { email: "admin@hed.com", password: "Admin123!" }, session: {} };
  const res = createResponse();

  authController.login(req, res);
  await flushAsyncWork();

  assert.deepEqual(req.session.user, {
    id: 1,
    name: "Admin",
    email: "admin@hed.com",
    role: "admin",
  });
  assert.equal(res.redirectedTo, "/admin/dashboard");
});

test("studentController.listStudents renders returned data for officers", () => {
  const studentController = loadModule("controllers/studentController.js", [
    {
      match: (sql) => sql.includes("FROM students") && sql.includes("officer_degrees"),
      result: [{ id: 1, name: "Avery Brooks", student_number: "P10001", degree_name: "BSc Computer Science" }],
    },
    {
      match: (sql) => sql.includes("SELECT degrees.*"),
      result: [{ id: 1, name: "BSc Computer Science" }],
    },
  ]);

  const req = { query: {}, session: { user: { id: 2, role: "officer" } } };
  const res = createResponse();

  studentController.listStudents(req, res);

  assert.equal(res.rendered.view, "students");
  assert.equal(res.rendered.data.students[0].name, "Avery Brooks");
});

test("studentController.createStudent redirects back with flash on invalid input", () => {
  const studentController = loadModule("controllers/studentController.js", []);
  const req = { body: { name: "", student_number: "", degree_id: "" }, session: {} };
  const res = createResponse();

  studentController.createStudent(req, res);

  assert.equal(res.redirectedTo, "/students/create");
  assert.equal(req.session.flash.type, "error");
});

test("studentController.classifyStudent updates the database with calculated values", () => {
  let updatePayload = null;
  const studentController = loadModule("controllers/studentController.js", [
    {
      match: (sql) => sql.includes("FROM marks") && sql.includes("JOIN modules") && sql.includes("JOIN students"),
      result: [
        { mark: 72, is_resit: 0, credits: 120, year: 2, year2_weight: 30, year3_weight: 70 },
        { mark: 74, is_resit: 0, credits: 120, year: 3, year2_weight: 30, year3_weight: 70 },
      ],
    },
    {
      match: (sql) => sql.includes("UPDATE students") && sql.includes("SET classification"),
      result: { affectedRows: 1 },
      onCall: (params) => {
        updatePayload = params;
      },
    },
  ]);

  const req = { params: { id: "1" }, session: {} };
  const res = createResponse();

  studentController.classifyStudent(req, res);

  assert.ok(updatePayload);
  assert.equal(updatePayload[0], "First Class Honours (1st)");
  assert.equal(res.redirectedTo, "/students#student-1");
});
