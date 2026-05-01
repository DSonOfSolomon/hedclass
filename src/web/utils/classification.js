function calculateClassification(markRows) {
  if (!Array.isArray(markRows) || markRows.length === 0) {
    return null;
  }

  let year2Total = 0;
  let year2Credits = 0;
  let year3Total = 0;
  let year3Credits = 0;
  let hasFail = false;
  let needsReview = false;

  for (const row of markRows) {
    let markForCalculation = row.mark;

    if (row.is_resit && row.mark > 40) {
      markForCalculation = 40;
    }

    if (markForCalculation < 40) {
      hasFail = true;
    }

    const weightedMark = markForCalculation * row.credits;

    if (row.year === 2) {
      year2Total += weightedMark;
      year2Credits += row.credits;
    }

    if (row.year === 3) {
      year3Total += weightedMark;
      year3Credits += row.credits;
    }
  }

  const year2Average = year2Credits ? year2Total / year2Credits : 0;
  const year3Average = year3Credits ? year3Total / year3Credits : 0;
  const missingCredits = year2Credits !== 120 || year3Credits !== 120;
  const year2Weight = markRows[0].year2_weight / 100;
  const year3Weight = markRows[0].year3_weight / 100;
  const finalAverage = year2Average * year2Weight + year3Average * year3Weight;

  let classification;

  if (hasFail || missingCredits) {
    classification = "Not Eligible (Fail)";
  } else if (finalAverage >= 70) {
    classification = "First Class Honours (1st)";
  } else if (finalAverage >= 60) {
    classification = "Upper Second Class Honours (2:1)";
  } else if (finalAverage >= 50) {
    classification = "Lower Second Class Honours (2:2)";
  } else if (finalAverage >= 40) {
    classification = "Third Class Honours";
  } else {
    classification = "Fail";
  }

  let rationale = `
    Year 2 Average: ${year2Average.toFixed(2)}
    Year 3 Average: ${year3Average.toFixed(2)}
    
    Final Calculation:
    (${year2Average.toFixed(2)} × ${year2Weight}) + (${year3Average.toFixed(2)} × ${year3Weight})
    
    Final Average: ${finalAverage.toFixed(2)}
    Classification: ${classification}
    `;

  if (missingCredits) {
    rationale += "\n⚠️ Student does not have full 120 credits for Year 2 or Year 3.";
  }

  if (hasFail) {
    rationale += "\n⚠️ Student has failed modules → Not eligible for honours classification.";
  }

  if (hasFail || missingCredits) {
    needsReview = true;
  }

  if (
    (finalAverage >= 69 && finalAverage < 70) ||
    (finalAverage >= 59 && finalAverage < 60) ||
    (finalAverage >= 49 && finalAverage < 50) ||
    (finalAverage >= 39 && finalAverage < 40)
  ) {
    needsReview = true;
  }

  if (needsReview) {
    rationale += "\n🔍 Flagged for manual review (borderline or rule issue).";
  }

  return {
    classification,
    finalAverage,
    hasFail,
    missingCredits,
    needsReview,
    rationale,
    year2Average,
    year3Average,
  };
}

module.exports = {
  calculateClassification,
};
