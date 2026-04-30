const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getTrimmedString(value, { required = false, maxLength = 255 } = {}) {
  if (typeof value !== "string") {
    return required ? null : "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return required ? null : "";
  }

  if (trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

function getEmail(value) {
  const email = getTrimmedString(value, { required: true, maxLength: 255 });

  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }

  return email.toLowerCase();
}

function getInteger(value, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  const number = Number.parseInt(value, 10);

  if (!Number.isInteger(number) || number < min || number > max) {
    return null;
  }

  return number;
}

function getCheckboxValue(value) {
  return value === "on" || value === "1" || value === 1;
}

function getClassification(value) {
  const allowed = new Set([
    "First Class Honours (1st)",
    "Upper Second Class Honours (2:1)",
    "Lower Second Class Honours (2:2)",
    "Third Class Honours",
    "Not Eligible (Fail)",
    "Fail",
  ]);

  const classification = getTrimmedString(value, { required: true, maxLength: 100 });

  if (!classification || !allowed.has(classification)) {
    return null;
  }

  return classification;
}

module.exports = {
  getCheckboxValue,
  getClassification,
  getEmail,
  getInteger,
  getTrimmedString,
};
