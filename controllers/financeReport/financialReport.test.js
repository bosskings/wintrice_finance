/**
 * Test file for Financial Report Controller
 * Tests with simulated user inputs
 */

import {
  // generateFinancialReport,
  // calculateRetirementGrowth,
  // calculateSocialSecurity,
  // calculateRetirementIncome,
  // calculateCombinedIncome
} from './financeReport/financialReport.js';

// Test Case 1: Young Professional (25 years old)
const testCase1 = {
  currentAge: 25,
  retirementAge: 65,
  currentSalary: 50000,
  salaryGrowthRate: 0.03, // 3%
  currentRetirementBalance: 0,
  employeeContributionRate: 0.10, // 10%
  employerContributionRate: 0.05, // 5%
  expectedReturn: 0.07, // 7%
  inflationRate: 0.025, // 2.5%
  withdrawalRate: 0.04, // 4%
  yearsWorked: 3
};

// Test Case 2: Mid-Career Professional (40 years old)
const testCase2 = {
  currentAge: 40,
  retirementAge: 67,
  currentSalary: 75000,
  salaryGrowthRate: 0.025, // 2.5%
  currentRetirementBalance: 150000,
  employeeContributionRate: 0.12, // 12%
  employerContributionRate: 0.06, // 6%
  expectedReturn: 0.06, // 6%
  inflationRate: 0.03, // 3%
  withdrawalRate: 0.04, // 4%
  yearsWorked: 18
};

// Test Case 3: Near Retirement (55 years old)
const testCase3 = {
  currentAge: 55,
  retirementAge: 65,
  currentSalary: 90000,
  salaryGrowthRate: 0.02, // 2%
  currentRetirementBalance: 400000,
  employeeContributionRate: 0.15, // 15%
  employerContributionRate: 0.08, // 8%
  expectedReturn: 0.05, // 5% (more conservative)
  inflationRate: 0.025, // 2.5%
  withdrawalRate: 0.04, // 4%
  yearsWorked: 33
};

// Test Case 4: Early Retirement Scenario
const testCase4 = {
  currentAge: 30,
  retirementAge: 55, // Early retirement
  currentSalary: 60000,
  salaryGrowthRate: 0.04, // 4%
  currentRetirementBalance: 25000,
  employeeContributionRate: 0.15, // 15% (aggressive)
  employerContributionRate: 0.10, // 10%
  expectedReturn: 0.08, // 8%
  inflationRate: 0.025, // 2.5%
  withdrawalRate: 0.04, // 4%
  yearsWorked: 8
};

// Test Case 5: Delayed Retirement Scenario
const testCase5 = {
  currentAge: 50,
  retirementAge: 70, // Delayed retirement
  currentSalary: 85000,
  salaryGrowthRate: 0.02, // 2%
  currentRetirementBalance: 300000,
  employeeContributionRate: 0.10, // 10%
  employerContributionRate: 0.05, // 5%
  expectedReturn: 0.06, // 6%
  inflationRate: 0.025, // 2.5%
  withdrawalRate: 0.04, // 4%
  yearsWorked: 28
};

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format percentage for display
 */
function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

/**
 * Print test results in a readable format
 */
function printTestResults(testCase, result, testName) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST CASE: ${testName}`);
  console.log('='.repeat(80));
  
  if (!result.success) {
    console.error(`ERROR: ${result.error}`);
    return;
  }
  
  const data = result.data;
  
  console.log('\n📊 INPUT SUMMARY:');
  console.log(`   Current Age: ${data.inputs.currentAge}`);
  console.log(`   Retirement Age: ${data.inputs.retirementAge}`);
  console.log(`   Years to Retirement: ${data.inputs.yearsToRetirement}`);
  console.log(`   Current Salary: ${formatCurrency(data.inputs.currentSalary)}`);
  console.log(`   Current Retirement Balance: ${formatCurrency(data.inputs.currentRetirementBalance)}`);
  console.log(`   Employee Contribution Rate: ${formatPercent(data.inputs.employeeContributionRate * 100)}`);
  console.log(`   Employer Contribution Rate: ${formatPercent(data.inputs.employerContributionRate * 100)}`);
  console.log(`   Expected Return: ${formatPercent(data.inputs.expectedReturn * 100)}`);
  console.log(`   Inflation Rate: ${formatPercent(data.inputs.inflationRate * 100)}`);
  
  console.log('\n💰 RETIREMENT SAVINGS SUMMARY:');
  console.log(`   Final Retirement Balance: ${formatCurrency(data.summary.finalRetirementBalance)}`);
  console.log(`   Inflation-Adjusted Balance: ${formatCurrency(data.summary.inflationAdjustedBalance)}`);
  console.log(`   Total Contributions: ${formatCurrency(data.summary.totalContributions)}`);
  console.log(`   Total Investment Growth: ${formatCurrency(data.summary.totalInvestmentGrowth)}`);
  console.log(`   Return on Contributions: ${formatPercent(data.summary.returnOnContributions)}`);
  console.log(`   Final Salary: ${formatCurrency(data.summary.finalSalary)}`);
  
  console.log('\n🏛️ SOCIAL SECURITY ESTIMATES:');
  console.log(`   Average Indexed Monthly Earnings: ${formatCurrency(data.socialSecurity.averageIndexedMonthlyEarnings)}`);
  console.log(`   Primary Insurance Amount (PIA): ${formatCurrency(data.socialSecurity.primaryInsuranceAmount)}`);
  console.log(`   Adjusted PIA: ${formatCurrency(data.socialSecurity.adjustedPrimaryInsuranceAmount)}`);
  console.log(`   Monthly Benefit: ${formatCurrency(data.socialSecurity.monthlyBenefit)}`);
  console.log(`   Annual Benefit: ${formatCurrency(data.socialSecurity.annualBenefit)}`);
  console.log(`   Full Retirement Age: ${data.socialSecurity.fullRetirementAge}`);
  console.log(`   Retirement Age Adjustment: ${data.socialSecurity.retirementAgeAdjustment > 0 ? '+' : ''}${data.socialSecurity.retirementAgeAdjustment} years`);
  
  console.log('\n💵 RETIREMENT INCOME FROM SAVINGS:');
  console.log(`   Annual Income: ${formatCurrency(data.retirementIncome.annualIncome)}`);
  console.log(`   Monthly Income: ${formatCurrency(data.retirementIncome.monthlyIncome)}`);
  console.log(`   Withdrawal Rate: ${formatPercent(data.retirementIncome.withdrawalRate * 100)}`);
  
  console.log('\n📈 COMBINED RETIREMENT INCOME ANALYSIS:');
  console.log(`   Total Annual Income: ${formatCurrency(data.combinedIncome.totalAnnualIncome)}`);
  console.log(`   Total Monthly Income: ${formatCurrency(data.combinedIncome.totalMonthlyIncome)}`);
  console.log(`   Final Salary: ${formatCurrency(data.combinedIncome.finalSalary)}`);
  console.log(`   Replacement Ratio: ${formatPercent(data.combinedIncome.replacementRatio)}`);
  console.log(`   Income Gap/Surplus: ${data.combinedIncome.hasSurplus ? 'Surplus' : 'Gap'} of ${formatCurrency(Math.abs(data.combinedIncome.incomeGap))}`);
  console.log(`   Portfolio Income: ${formatPercent(data.combinedIncome.portfolioIncomePercentage)}`);
  console.log(`   Social Security Income: ${formatPercent(data.combinedIncome.socialSecurityIncomePercentage)}`);
  
  console.log('\n📅 YEAR-BY-YEAR PROJECTION (First 5 years):');
  data.retirementProjection.slice(0, 5).forEach(year => {
    console.log(`   Year ${year.year} (Age ${year.age}):`);
    console.log(`      Salary: ${formatCurrency(year.salary)}`);
    console.log(`      Contributions: ${formatCurrency(year.totalContribution)}`);
    console.log(`      Year-End Balance: ${formatCurrency(year.yearEndBalance)}`);
  });
  
  if (data.retirementProjection.length > 5) {
    console.log(`   ... (${data.retirementProjection.length - 5} more years)`);
    const lastYear = data.retirementProjection[data.retirementProjection.length - 1];
    console.log(`   Year ${lastYear.year} (Age ${lastYear.age}):`);
    console.log(`      Salary: ${formatCurrency(lastYear.salary)}`);
    console.log(`      Contributions: ${formatCurrency(lastYear.totalContribution)}`);
    console.log(`      Year-End Balance: ${formatCurrency(lastYear.yearEndBalance)}`);
  }
  
  console.log('\n✅ Calculation completed successfully!');
  console.log(`   Calculated at: ${data.calculatedAt}`);
  console.log(`   Version: ${data.version}`);
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('\n🧪 FINANCIAL REPORT CONTROLLER - TEST SUITE');
  console.log('='.repeat(80));
  console.log('Testing with simulated user inputs...\n');
  
  // Test Case 1
  const result1 = generateFinancialReport(testCase1);
  printTestResults(testCase1, result1, 'Young Professional (25 → 65)');
  
  // Test Case 2
  const result2 = generateFinancialReport(testCase2);
  printTestResults(testCase2, result2, 'Mid-Career Professional (40 → 67)');
  
  // Test Case 3
  const result3 = generateFinancialReport(testCase3);
  printTestResults(testCase3, result3, 'Near Retirement (55 → 65)');
  
  // Test Case 4
  const result4 = generateFinancialReport(testCase4);
  printTestResults(testCase4, result4, 'Early Retirement (30 → 55)');
  
  // Test Case 5
  const result5 = generateFinancialReport(testCase5);
  printTestResults(testCase5, result5, 'Delayed Retirement (50 → 70)');
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  const results = [result1, result2, result3, result4, result5];
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed successfully!');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
  }
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Test individual calculation functions
 */
function testIndividualFunctions() {
  console.log('\n🔬 TESTING INDIVIDUAL CALCULATION FUNCTIONS');
  console.log('='.repeat(80));
  
  // Test retirement growth
  console.log('\n1. Testing calculateRetirementGrowth...');
  const growthResult = calculateRetirementGrowth(testCase1);
  console.log(`   ✅ Generated ${growthResult.length} years of projections`);
  console.log(`   ✅ Final balance: ${formatCurrency(growthResult[growthResult.length - 1].yearEndBalance)}`);
  
  // Test Social Security
  console.log('\n2. Testing calculateSocialSecurity...');
  const ssResult = calculateSocialSecurity(testCase1);
  console.log(`   ✅ Monthly benefit: ${formatCurrency(ssResult.monthlyBenefit)}`);
  console.log(`   ✅ Annual benefit: ${formatCurrency(ssResult.annualBenefit)}`);
  
  // Test retirement income
  console.log('\n3. Testing calculateRetirementIncome...');
  const incomeResult = calculateRetirementIncome(1000000, 0.04);
  console.log(`   ✅ Annual income: ${formatCurrency(incomeResult.annualIncome)}`);
  console.log(`   ✅ Monthly income: ${formatCurrency(incomeResult.monthlyIncome)}`);
  
  // Test combined income
  console.log('\n4. Testing calculateCombinedIncome...');
  const combinedResult = calculateCombinedIncome(incomeResult, ssResult, 100000);
  console.log(`   ✅ Total annual income: ${formatCurrency(combinedResult.totalAnnualIncome)}`);
  console.log(`   ✅ Replacement ratio: ${formatPercent(combinedResult.replacementRatio)}`);
  
  console.log('\n✅ All individual function tests completed!');
}

/**
 * Test error handling
 */
function testErrorHandling() {
  console.log('\n🚨 TESTING ERROR HANDLING');
  console.log('='.repeat(80));
  
  // Test missing required field
  console.log('\n1. Testing missing required field...');
  const result1 = generateFinancialReport({ currentAge: 25 });
  if (!result1.success) {
    console.log(`   ✅ Correctly caught error: ${result1.error}`);
  } else {
    console.log('   ❌ Should have caught missing field error');
  }
  
  // Test invalid age range
  console.log('\n2. Testing invalid age range...');
  const result2 = generateFinancialReport({
    currentAge: 65,
    retirementAge: 60,
    currentSalary: 50000
  });
  if (!result2.success) {
    console.log(`   ✅ Correctly caught error: ${result2.error}`);
  } else {
    console.log('   ❌ Should have caught invalid age range error');
  }
  
  console.log('\n✅ Error handling tests completed!');
}

// Run tests if this file is executed directly
// if (require.main === module) {
//   runAllTests();
//   testIndividualFunctions();
//   testErrorHandling();
// }

export{
  testCase1,
  testCase2,
  testCase3,
  testCase4,
  testCase5,
  runAllTests,
  testIndividualFunctions,
  testErrorHandling
};
