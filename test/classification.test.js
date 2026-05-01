const test = require("node:test");
const assert = require("node:assert/strict");

const { calculateClassification } = require("../src/web/utils/classification");

test("calculateClassification returns a first for strong marks", () => {
  const outcome = calculateClassification([
    { mark: 72, is_resit: 0, credits: 120, year: 2, year2_weight: 30, year3_weight: 70 },
    { mark: 76, is_resit: 0, credits: 120, year: 3, year2_weight: 30, year3_weight: 70 },
  ]);

  assert.equal(outcome.classification, "First Class Honours (1st)");
  assert.equal(outcome.needsReview, false);
  assert.equal(outcome.finalAverage.toFixed(2), "74.80");
});

test("calculateClassification caps resits and flags missing credits", () => {
  const outcome = calculateClassification([
    { mark: 65, is_resit: 1, credits: 100, year: 2, year2_weight: 30, year3_weight: 70 },
    { mark: 68, is_resit: 0, credits: 120, year: 3, year2_weight: 30, year3_weight: 70 },
  ]);

  assert.equal(outcome.classification, "Not Eligible (Fail)");
  assert.equal(outcome.needsReview, true);
  assert.match(outcome.rationale, /full 120 credits/i);
});

test("calculateClassification flags failed modules", () => {
  const outcome = calculateClassification([
    { mark: 35, is_resit: 0, credits: 120, year: 2, year2_weight: 30, year3_weight: 70 },
    { mark: 71, is_resit: 0, credits: 120, year: 3, year2_weight: 30, year3_weight: 70 },
  ]);

  assert.equal(outcome.classification, "Not Eligible (Fail)");
  assert.equal(outcome.needsReview, true);
  assert.match(outcome.rationale, /failed modules/i);
});
