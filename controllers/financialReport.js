/**
 * WINTRICE Financial Planning Blue Print — PDF Generator & Controller
 * Highly customized 25-page financial report according to WINTRICE planning structure.
 */

import { log } from "console";
import PDFDocument from "pdfkit";
import { Readable } from "stream";


// Utility helpers
function currency(v) { return "$" + (v ? v.toLocaleString('en-US') : '0'); }
function percent(p, digits = 0) {
  return (typeof p === 'number'
    ? (p * 100).toFixed(digits)
    : p) + "%";
}

/**
 * Generate 25-page WINTRICE PDF report. For demo: fixed values as per prompt sample.
 * To adapt for dynamic/production, adjust all DEMO_DATA references accordingly.
 * @returns {PDFDocument} - Readable PDFKit stream for download
 */
function generateFinancialReportPDF(formData) {

  const data = formData; // Get the data from the user's form submission
  console.log(data);
  
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  const FONT_FAMILY = "Times-Roman";
  const FONT_BOLD = "Times-Bold";
  const FONT_SIZE = 12;

  const stream = new Readable();
  stream._read = () => {};
  doc.on('data', c => stream.push(c));
  doc.on('end', () => stream.push(null));

  // Header/footer per page
  function headerFooter(page) {
    doc.font(FONT_FAMILY).fontSize(9).fillColor("#333");
    if (page === 1) {
      // Cover page has no header/footer
      return;
    }
    // Header
    doc.text(`WINTRICE Financial Planning Blueprint`, 0, 35, { align: "center", width: doc.page.width - 100 });
    // Footer
    doc.text(`Page ${page} of 25`, 0, doc.page.height - 50, { align: "center", width: doc.page.width - 100 });
    doc.moveDown();
    doc.font(FONT_FAMILY).fontSize(FONT_SIZE).fillColor("black");
  }

  let PAGE = 1;

  // PAGE 1: Cover page
  doc.font(FONT_BOLD).fontSize(20).text("WINTRICE Financial Planning Blue Print", {
    align: "center",
    baseline: "middle"
  });
  doc.moveDown(3);
  doc.font(FONT_FAMILY).fontSize(14).text(`Prepared for: ${data.clientName}`, { align: "center" });
  doc.text(`Employer: ${data.employer}`, { align: "center" });
  doc.moveDown();
  doc.text(`Date: ${data.date}`, { align: "center" });
  doc.moveDown();
  doc.text(`Prepared by: ${data.preparedBy}`, { align: "center" });
  doc.moveDown(3);
  doc.font(FONT_BOLD).fontSize(16).fillColor("#222").text("Confidential & Proprietary", { align: "center" });
  PAGE++;

  for (; PAGE <= 25; PAGE++) {
    doc.addPage();
    headerFooter(PAGE);

    doc.font(FONT_FAMILY).fontSize(FONT_SIZE).fillColor("black");

    // PAGE 2: Personal Profile
    if (PAGE === 2) {
      doc.font(FONT_BOLD).fontSize(16).text("Personal Profile Summary", { align: "left" });
      doc.moveDown();
      doc.font(FONT_BOLD).fontSize(14).text("Client Snapshot");
      doc.moveDown();
      doc.font(FONT_FAMILY).fontSize(FONT_SIZE).list([
        `Name: ${data.clientName}`,
        `Age: ${data.currentAge}`,
        `Retirement Age Goal: ${data.retirementAge}`,
        `Life Expectancy Assumption: ${data.lifeExpectancy}`,
        `Marital Status: ${data.maritalStatus}`,
        `Dependents: ${data.dependents}`,
        `Annual Salary: ${currency(data.annualSalary)}`,
        `Annual Salary Growth Assumption: ${percent(data.salaryGrowth, 0)}`,
        `Current Retirement Savings: ${currency(data.retirementSavings)}`,
        `Monthly Retirement Contribution: ${currency(data.monthlyContribution)}`,
        `Employer Match: ${percent(data.employerMatch, 0)}`
      ]);
    }

    // PAGE 3: Financial Health Scorecard
    else if (PAGE === 3) {
      doc.font(FONT_BOLD).fontSize(16).text("Financial Health Scorecard");
      doc.moveDown(0.5);
      doc.text(`Wintrice Financial Health Score: ${data.wintriceScore} / 100`, { font: FONT_BOLD });
      doc.moveDown();
      doc.text("Category         Score", { font: FONT_BOLD });
      doc.text(`Savings Rate         ${data.savingsRateScore}`);
      doc.text(`Debt Ratio           ${data.debtRatioScore}`);
      doc.text(`Investment Allocation ${data.investmentAllocScore}`);
      doc.text(`Emergency Fund       ${data.emergencyFundScore}`);
      doc.text(`Retirement Readiness ${data.retirementReadinessScore}`);
      doc.moveDown(2);
      doc.text("Graph: [Radar Chart Auto-generated]", { oblique: true });
    }

    // PAGE 4: Net Worth Statement
    else if (PAGE === 4) {
      doc.font(FONT_BOLD).fontSize(16).text("Net Worth Statement", { underline: true });
      doc.moveDown();

      doc.text("Assets", { font: FONT_BOLD });
      data.assets.forEach(a => doc.text(`${a.label}     ${currency(a.value)}`));
      doc.text(`Total Assets           ${currency(data.assets.reduce((s, a) => s + a.value, 0))}`);
      doc.moveDown();
      doc.text("Liabilities", { font: FONT_BOLD });
      data.liabilities.forEach(l => doc.text(`${l.label}    ${currency(l.value)}`));
      doc.text(`Total Liabilities      ${currency(data.liabilities.reduce((s, l) => s + l.value, 0))}`);
      doc.moveDown();
      doc.font(FONT_BOLD).text(`Net Worth: ${currency(data.netWorth)}`);
    }

    // PAGE 5: Cash Flow Analysis
    else if (PAGE === 5) {
      doc.font(FONT_BOLD).fontSize(16).text("Cash Flow Analysis", { underline: true });
      doc.moveDown();
      doc.text(`Monthly Income: ${currency(data.monthlyIncome)}`);
      doc.text(`Monthly Expenses: ${currency(data.monthlyExpenses)}`);
      doc.text(`Surplus: ${currency(data.monthlySurplus)}`);
      doc.moveDown(2);
      doc.text("Pie Chart: [Expense Breakdown]", { oblique: true });
    }

    // PAGE 6: Emergency Fund Adequacy
    else if (PAGE === 6) {
      doc.font(FONT_BOLD).fontSize(16).text("Emergency Fund Adequacy");
      doc.moveDown();
      doc.text(`Monthly Core Expenses: ${currency(data.monthlyCoreExpenses)}`);
      doc.text(`Recommended 6 Months: ${currency(data.recommendedEFund)}`);
      doc.text(`Current Liquid Savings: ${currency(data.liquidSavings)}`);
      doc.text(`Status: ${data.efundStatus}% Funded`);
    }

    // PAGE 7: Debt Analysis
    else if (PAGE === 7) {
      doc.font(FONT_BOLD).fontSize(16).text("Debt Analysis");
      doc.moveDown();
      doc.text(`Debt-to-Income Ratio: ${data.dtiRatio}%`);
      doc.text(`Projected Student Loan Payoff: ${data.loanPayoffYears} Years`);
      doc.text(`Mortgage Payoff: ${data.mortgageYears} Years`);
      doc.moveDown(2);
      doc.text("Graph: [Debt Reduction Timeline]", { oblique: true });
    }

    // PAGE 8: Current Investment Allocation
    else if (PAGE === 8) {
      doc.font(FONT_BOLD).fontSize(16).text("Current Investment Allocation");
      doc.moveDown();
      doc.text("Asset Class        %");
      data.allocation.forEach(a =>
        doc.text(`${a.label}${' '.repeat(22 - a.label.length)}${a.percent}%`)
      );
      doc.moveDown();
      doc.text(`Risk Profile: ${data.riskProfile}`);
    }

    // PAGE 9: Risk Tolerance Assessment Summary
    else if (PAGE === 9) {
      doc.font(FONT_BOLD).fontSize(16).text("Risk Tolerance Assessment Summary");
      doc.moveDown();
      doc.text(`Risk Capacity: ${data.riskCapacity}`);
      doc.text(`Risk Behavior: ${data.riskBehavior}`);
      doc.text(`Portfolio Alignment: ${data.portfolioAlignment}% aligned`);
    }

    // PAGE 10: Retirement Projection (Base Case)
    else if (PAGE === 10) {
      doc.font(FONT_BOLD).fontSize(16).text("Retirement Projection (Base Case)");
      doc.moveDown();
      doc.text(`Retirement Age: ${data.retirementAge}`);
      doc.text(`Projected Portfolio Value at 67: ${currency(data.projectedPortfolio67)}`);
      doc.text(`Estimated Annual Retirement Income: ${currency(data.estimatedAnnualRetIncome)}`);
      doc.moveDown(2);
      doc.text("Graph: [Growth Curve (Age 35–67)]", { oblique: true });
    }

    // PAGE 11: Retirement Income Gap Analysis
    else if (PAGE === 11) {
      doc.font(FONT_BOLD).fontSize(16).text("Retirement Income Gap Analysis");
      doc.moveDown();
      doc.text(`Projected Needed Income: ${currency(data.targetRetirementIncome)}`);
      doc.text(`Projected Income: ${currency(data.estimatedAnnualRetIncome)}`);
      doc.text(`Annual Gap: ${currency(data.retirementIncomeGap)}`);
      doc.text(`Gap Coverage Required: ${data.gapCoverage}%`);
    }

    // PAGE 12: Required Savings Adjustment
    else if (PAGE === 12) {
      doc.font(FONT_BOLD).fontSize(16).text("Required Savings Adjustment");
      doc.moveDown();
      doc.text(`To close gap:`);
      doc.list([
        `Increase monthly savings by: ${currency(data.savingsIncrease)}`,
        `OR`,
        `Delay retirement by: ${data.delayRetirementYears} years`
      ]);
      doc.moveDown();
      doc.text("Scenario Comparison Chart", { oblique: true });
    }

    // PAGE 13: Social Security Estimate
    else if (PAGE === 13) {
      doc.font(FONT_BOLD).fontSize(16).text("Social Security Estimate");
      doc.moveDown();
      doc.text(`Estimated Benefit at 67: ${currency(data.ssa67)}/year`);
      doc.text(`Estimated Benefit at 70: ${currency(data.ssa70)}/year`);
      doc.text(`Break-even Age Analysis: ${data.breakEvenAge}`);
    }

    // PAGE 14: Employer Plan Optimization
    else if (PAGE === 14) {
      doc.font(FONT_BOLD).fontSize(16).text("Employer Plan Optimization");
      doc.moveDown();
      doc.text(`Current Contribution: ${percent(data.currentContribution, 0)}`);
      doc.text(`Recommended Contribution: ${percent(data.recommendedContribution, 0)}`);
      doc.text(`Employer Match Capture Status: ${data.employerMatchStatus}`);
    }

    // PAGE 15: Tax Optimization Overview
    else if (PAGE === 15) {
      doc.font(FONT_BOLD).fontSize(16).text("Tax Optimization Overview");
      doc.moveDown();
      doc.text(`Current Marginal Tax Rate: ${data.taxRate}%`);
      doc.text("Roth vs Traditional Mix Recommendation:");
      doc.list([
        `${data.traditionalPercent}% Traditional`,
        `${data.rothPercent}% Roth`
      ]);
      doc.text(`Projected Lifetime Tax Savings: ${currency(data.lifetimeTaxSavings)}`);
    }

    // PAGE 16: Inflation Impact Analysis
    else if (PAGE === 16) {
      doc.font(FONT_BOLD).fontSize(16).text("Inflation Impact Analysis");
      doc.moveDown();
      doc.text(`Assumed Inflation: ${(data.inflationRate * 100).toFixed(1)}%`);
      doc.text(`${currency(data.salaryToday)} today = ${currency(data.salaryFuture)} at retirement (${data.retirementAge - data.currentAge} years)`);
      doc.moveDown();
      doc.text("Inflation Impact Chart", { oblique: true });
    }

    // PAGE 17: Longevity Risk Analysis
    else if (PAGE === 17) {
      doc.font(FONT_BOLD).fontSize(16).text("Longevity Risk Analysis");
      doc.moveDown();
      doc.text(`Probability of living past 90: ${data.chancePast90}%`);
      doc.text(`Probability of living past 95: ${data.chancePast95}%`);
      doc.text(`Sustainability Test: Portfolio lasts to age ${data.portfolioLastsTo}`);
    }

    // PAGE 18: Healthcare Cost Projection
    else if (PAGE === 18) {
      doc.font(FONT_BOLD).fontSize(16).text("Healthcare Cost Projection");
      doc.moveDown();
      doc.text(`Estimated Annual Healthcare at 67: ${currency(data.healthcareAnnual)}`);
      doc.text(`Lifetime Retirement Healthcare Estimate: ${currency(data.healthcareLifetime)}`);
    }

    // PAGE 19: Insurance Coverage Review
    else if (PAGE === 19) {
      doc.font(FONT_BOLD).fontSize(16).text("Insurance Coverage Review");
      doc.moveDown();
      doc.text(`Life Insurance: ${currency(data.lifeInsurance)}`);
      doc.text(`Recommended Coverage: ${currency(data.recommendedInsurance)}`);
      doc.text(`Disability Coverage: ${data.disabilityCoverage}`);
      doc.text(`Gap Identified: ${currency(data.insuranceGap)}`);
    }

    // PAGE 20: College Planning (If Applicable)
    else if (PAGE === 20) {
      doc.font(FONT_BOLD).fontSize(16).text("College Planning");
      doc.moveDown();
      doc.text(`Dependents: ${data.children}`);
      doc.text(`Projected 4-Year Public Cost: ${currency(data.collegeCost)}`);
      doc.text(`529 Current Balance: ${currency(data.savings529)}`);
      doc.text(`Funding Gap: ${currency(data.collegeGap)}`);
    }

    // PAGE 21: Scenario Analysis – Optimistic Market
    else if (PAGE === 21) {
      doc.font(FONT_BOLD).fontSize(16).text("Scenario Analysis – Optimistic Market");
      doc.moveDown();
      doc.text(`Portfolio at 67: ${currency(data.optimisticPortfolio)}`);
      doc.text(`Income Replacement: ${data.optimisticReplacement}%`);
    }

    // PAGE 22: Scenario Analysis – Conservative Market
    else if (PAGE === 22) {
      doc.font(FONT_BOLD).fontSize(16).text("Scenario Analysis – Conservative Market");
      doc.moveDown();
      doc.text(`Portfolio at 67: ${currency(data.conservativePortfolio)}`);
      doc.text(`Income Replacement: ${data.conservativeReplacement}%`);
      doc.text(`Stress Test Result: Moderate Risk Exposure`);
    }

    // PAGE 23: Recommended Action Plan
    else if (PAGE === 23) {
      doc.font(FONT_BOLD).fontSize(16).text("Recommended Action Plan");
      doc.moveDown();
      data.actionPlan.forEach((item, idx) => doc.text(`Priority ${idx + 1}: ${item}`));
    }

    // PAGE 24: 12-Month Implementation Roadmap
    else if (PAGE === 24) {
      doc.font(FONT_BOLD).fontSize(16).text("12-Month Implementation Roadmap");
      doc.moveDown();
      data.roadmap.forEach(q =>
        doc.list([q.quarter, ...q.steps], { bulletRadius: 1 })
      );
    }

    // PAGE 25: Disclosures & Assumptions
    else if (PAGE === 25) {
      doc.font(FONT_BOLD).fontSize(16).text("Disclosures & Assumptions");
      doc.moveDown();
      doc.list([
        `Assumed return: ${data.assumedReturn}%`,
        `Inflation: ${(data.inflationRate * 100).toFixed(1)}%`,
        `Retirement age: ${data.retireAge}`,
        `Life expectancy: ${data.lifeExp}`,
        `Social Security estimated based on current law`,
        `Projections are hypothetical and not guaranteed`
      ]);
      doc.moveDown(3);

      doc.font(FONT_BOLD).fontSize(14).text('AIFT Financial Security Blueprint™', { align: "center" });
      doc.font(FONT_FAMILY).fontSize(11).text('\nEmployee Retirement Intelligence Report', { align: "center" });
      doc.moveDown();
      doc.text(`Prepared for: ${data.clientName}`, { align: "center" });
      doc.text(`Employer: ${data.employer}`, { align: "center" });
      doc.text('Prepared by: AIFT Retirement Intelligence System', { align: "center" });
      doc.text('Confidential | For Employee Use Only', { align: "center" });
    }
  }

  doc.end();
  return stream;
}

/**
 * Controller for Express endpoint: streams custom WINTRICE PDF report.
 * For demonstration purposes, does not take actual user data input.
 */
async function generateReport(req, res) {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=WINTRICE_Financial_Blueprint.pdf');

    const pdfStream = generateFinancialReportPDF(req.body);
    pdfStream.pipe(res);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while generating financial report',
      details: error.message
    });
  }
}

/**
 * Placeholder: GET endpoint for reports by ID (future expansion).
 */
async function getReport(req, res) {
  try {
    const { reportId } = req.params;
    res.status(200).json({
      success: true,
      message: 'Report retrieval endpoint - implement database lookup',
      reportId
    });
  } catch (error) {
    console.error('Error retrieving report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving report'
    });
  }
}

// Stub exports for dynamic calculators: left as-is or to be re-wired for live calculation integration.
export {
  generateReport,
  getReport,
  // In a dynamic implementation, calculation/analysis helpers would be updated:
  // generateFinancialReport,
  // calculateRetirementGrowth,
  // calculateSocialSecurity,
  // calculateRetirementIncome,
  // calculateCombinedIncome,
  generateFinancialReportPDF
};