import mongoose from 'mongoose';

const financeRecordSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pages: [
        {
            page: { type: Number, required: true },
            title: { type: String },
            section: { type: String },
            preparedFor: { type: String },
            employer: { type: String },
            date: { type: String },
            preparedBy: { type: String },
            profile: {
                name: { type: String },
                age: { type: Number },
                retirementAgeGoal: { type: Number },
                lifeExpectancy: { type: Number },
                maritalStatus: { type: String },
                dependents: { type: Number },
                annualSalary: { type: Number },
                annualSalaryGrowth: { type: Number },
                currentRetirementSavings: { type: Number },
                monthlyRetirementContribution: { type: Number },
                employerMatch: { type: Number }
            },
            wintriceScore: { type: Number },
            scorecard: [
                {
                    category: { type: String },
                    score: { type: Number }
                }
            ],
            assets: [
                {
                    label: { type: String },
                    value: { type: Number }
                }
            ],
            totalAssets: { type: Number },
            liabilities: [
                {
                    label: { type: String },
                    value: { type: Number }
                }
            ],
            totalLiabilities: { type: Number },
            netWorth: { type: Number },
            monthlyIncome: { type: Number },
            monthlyExpenses: { type: Number },
            monthlySurplus: { type: Number },
            monthlyCoreExpenses: { type: Number },
            recommendedEFund: { type: Number },
            liquidSavings: { type: Number },
            efundStatus: { type: Number },
            debtToIncomeRatio: { type: Number },
            studentLoanPayoffYears: { type: Number },
            mortgageYears: { type: Number },
            allocation: [
                {
                    label: { type: String },
                    percent: { type: Number }
                }
            ],
            riskProfile: { type: String },
            riskCapacity: { type: String },
            riskBehavior: { type: String },
            portfolioAlignment: { type: Number },
            retirementAge: { type: Number },
            projectedPortfolio67: { type: Number },
            estimatedAnnualRetIncome: { type: Number },
            projectedNeededIncome: { type: Number },
            projectedIncome: { type: Number },
            annualGap: { type: Number },
            gapCoverage: { type: Number },
            savingsIncrease: { type: Number },
            delayRetirementYears: { type: Number },
            ssa67: { type: Number },
            ssa70: { type: Number },
            breakEvenAge: { type: Number },
            currentContribution: { type: Number },
            recommendedContribution: { type: Number },
            employerMatchStatus: { type: String },
            taxRate: { type: Number },
            traditionalPercent: { type: Number },
            rothPercent: { type: Number },
            lifetimeTaxSavings: { type: Number },
            inflationRate: { type: Number },
            salaryToday: { type: Number },
            salaryFuture: { type: Number },
            yearsUntilRetirement: { type: Number },
            chancePast90: { type: Number },
            chancePast95: { type: Number },
            portfolioLastsTo: { type: Number },
            healthcareAnnual: { type: Number },
            healthcareLifetime: { type: Number },
            lifeInsurance: { type: Number },
            recommendedInsurance: { type: Number },
            disabilityCoverage: { type: String },
            insuranceGap: { type: Number },
            dependents: { type: Number },
            projectedCollegeCost: { type: Number },
            savings529: { type: Number },
            collegeGap: { type: Number },
            optimisticPortfolio: { type: Number },
            optimisticReplacement: { type: Number },
            conservativePortfolio: { type: Number },
            conservativeReplacement: { type: Number },
            stressTestResult: { type: String },
            actionPlan: [String],
            roadmap: [
                {
                    quarter: { type: String },
                    steps: [String]
                }
            ],
            assumedReturn: { type: Number },
            inflation: { type: Number },
            disclosures: [String],
            footer: {
                clientName: { type: String },
                employer: { type: String },
                preparedBy: { type: String }
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }

});


export default mongoose.model('FinanceRecord', financeRecordSchema);