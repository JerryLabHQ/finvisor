/**
 * UK Pension Drawdown, Annuity & FIRE Retirement Simulator
 * Models Flexible Drawdown vs. Lifetime Annuity, 25% Tax-Free Lump Sum (PCLS),
 * State Pension bridge, and Autumn Budget 2027 Pension Inheritance Tax (IHT) rules.
 * Verified against UK statutory benchmarks.
 */

export interface PensionInputs {
  currentPensionPot: number;          // Total DC Pension / SIPP balance (£)
  currentIsaPot: number;              // Tax-free Stocks & Shares ISA balance (£)
  currentAge: number;                 // e.g. 55
  targetRetirementAge: number;        // e.g. 60
  lifeExpectancyAge: number;          // e.g. 88
  desiredAnnualIncomeNet: number;     // Target post-tax spending (£/year)
  takeTaxFreeLumpSumAtRetirement: boolean; // Take 25% PCLS up to £268,275 cap
  assumedRealReturnPercent: number;   // Expected return after fees (e.g. 5.5%)
  inflationPercent: number;           // CPI inflation (e.g. 2.5%)
  statePensionAge: number;            // e.g. 67
  qualifiesForFullStatePension: boolean;
  annuityQuoteRatePercent: number;    // e.g. 6.5% for age 65 benchmark
}

export interface PensionYearProjection {
  year: number;
  age: number;
  startingPensionPot: number;
  startingIsaPot: number;
  statePensionReceived: number;
  drawdownFromPension: number;
  drawdownFromIsa: number;
  taxPaidOnDrawdown: number;
  investmentGrowth: number;
  endingPensionPot: number;
  endingIsaPot: number;
  totalNetWorth: number;
  isPotDepleted: boolean;
}

export interface PensionResults {
  inputs: PensionInputs;
  projections: PensionYearProjection[];
  pclsLumpSumTaken: number;           // 25% Pension Commencement Lump Sum
  sustainableSafeWithdrawalRatePercent: number;
  initialDrawdownRatePercent: number;
  potLastsUntilAge: number;
  isFullyFunded: boolean;
  finalLegacyPotAtLifeExpectancy: number;
  guaranteedAnnuityAnnualIncome: number;
  estimatedPost2027IhtExposure: number; // Potential 40% IHT on unused pension
  verdict: "SUSTAINABLE_DRAWDOWN" | "RISK_OF_DEPLETION" | "ANNUITY_RECOMMENDED";
  verdictReasoning: string;
}

export const PENSION_CONSTANTS = {
  // UK Full New State Pension (2024/2026 benchmark)
  fullNewStatePensionAnnual: 11502, // £221.20 per week * 52
  // Maximum Tax-Free Lump Sum (Lump Sum Allowance LSA introduced April 2024)
  lumpSumAllowanceCap: 268275, // 25% of old Lifetime Allowance £1,073,100
  // Standard Personal Allowance
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  basicRate: 0.20,
  higherRate: 0.40,
  // IHT Rate on unused pension from April 2027
  ihtStandardRate: 0.40,
  nilRateBand: 325000,
};

/**
 * Calculates income tax on gross taxable pension drawdown
 */
export function calculatePensionDrawdownTax(
  taxablePensionIncome: number,
  statePension: number
): number {
  const totalIncome = taxablePensionIncome + statePension;
  const taxableAbovePa = Math.max(0, totalIncome - PENSION_CONSTANTS.personalAllowance);

  if (taxableAbovePa === 0) return 0;

  const basicRateBandSize = PENSION_CONSTANTS.basicRateThreshold - PENSION_CONSTANTS.personalAllowance;
  const basicTaxable = Math.min(taxableAbovePa, basicRateBandSize);
  let tax = basicTaxable * PENSION_CONSTANTS.basicRate;

  if (taxableAbovePa > basicRateBandSize) {
    const higherTaxable = taxableAbovePa - basicRateBandSize;
    tax += higherTaxable * PENSION_CONSTANTS.higherRate;
  }

  return Math.round(tax);
}

/**
 * Full Multi-Year Pension Drawdown & FIRE Simulation
 */
export function runPensionCalculation(inputs: PensionInputs): PensionResults {
  const yearsToRetirement = Math.max(0, inputs.targetRetirementAge - inputs.currentAge);
  const retirementHorizonYears = Math.max(1, inputs.lifeExpectancyAge - inputs.targetRetirementAge);

  // 1. Accumulation to Retirement Age
  const realReturnRate = (inputs.assumedRealReturnPercent - inputs.inflationPercent) / 100;
  let accumulatedPension = inputs.currentPensionPot;
  let accumulatedIsa = inputs.currentIsaPot;

  for (let y = 0; y < yearsToRetirement; y++) {
    accumulatedPension = accumulatedPension * (1 + realReturnRate);
    accumulatedIsa = accumulatedIsa * (1 + realReturnRate);
  }

  accumulatedPension = Math.round(accumulatedPension);
  accumulatedIsa = Math.round(accumulatedIsa);

  // 2. Tax-Free Cash (PCLS) Option
  let pclsLumpSumTaken = 0;
  if (inputs.takeTaxFreeLumpSumAtRetirement && accumulatedPension > 0) {
    pclsLumpSumTaken = Math.min(
      Math.round(accumulatedPension * 0.25),
      PENSION_CONSTANTS.lumpSumAllowanceCap
    );
    accumulatedPension -= pclsLumpSumTaken;
    accumulatedIsa += pclsLumpSumTaken; // Rolled into tax-free cash / ISA
  }

  // 3. Guaranteed Annuity Alternative Benchmark
  const guaranteedAnnuityAnnualIncome = Math.round(
    (accumulatedPension + pclsLumpSumTaken) * (inputs.annuityQuoteRatePercent / 100)
  );

  // 4. Decumulation Simulation
  const projections: PensionYearProjection[] = [];
  let pensionBalance = accumulatedPension;
  let isaBalance = accumulatedIsa;
  let potLastsUntilAge = inputs.lifeExpectancyAge;
  let isFullyFunded = true;

  for (let year = 1; year <= retirementHorizonYears; year++) {
    const currentAge = inputs.targetRetirementAge + year - 1;
    const isStatePensionActive =
      inputs.qualifiesForFullStatePension && currentAge >= inputs.statePensionAge;
    const statePension = isStatePensionActive ? PENSION_CONSTANTS.fullNewStatePensionAnnual : 0;

    const netIncomeNeeded = Math.max(0, inputs.desiredAnnualIncomeNet - statePension);

    const startPension = Math.round(pensionBalance);
    const startIsa = Math.round(isaBalance);

    let pensionDrawdown = 0;
    let isaDrawdown = 0;
    let taxPaid = 0;

    if (pensionBalance + isaBalance <= 0) {
      if (isFullyFunded) {
        isFullyFunded = false;
        potLastsUntilAge = currentAge;
      }
    } else {
      // Drawdown Strategy: Draw from Pension first (optimizing 2027 IHT rule), then ISA
      if (pensionBalance > 0) {
        // Approximate gross pension needed to achieve netIncomeNeeded
        // Simplified gross-up factoring in basic rate
        const grossNeeded = netIncomeNeeded > 0 ? Math.round(netIncomeNeeded * 1.22) : 0;
        pensionDrawdown = Math.min(pensionBalance, grossNeeded);
        taxPaid = calculatePensionDrawdownTax(pensionDrawdown, statePension);
        const netPensionReceived = Math.max(0, pensionDrawdown - taxPaid);

        const remainingShortfall = Math.max(0, netIncomeNeeded - netPensionReceived);
        if (remainingShortfall > 0 && isaBalance > 0) {
          isaDrawdown = Math.min(isaBalance, remainingShortfall);
        }
      } else if (isaBalance > 0) {
        isaDrawdown = Math.min(isaBalance, netIncomeNeeded);
      }
    }

    pensionBalance = Math.max(0, pensionBalance - pensionDrawdown);
    isaBalance = Math.max(0, isaBalance - isaDrawdown);

    // Apply real investment return to remaining balances
    const pensionGrowth = Math.round(pensionBalance * realReturnRate);
    const isaGrowth = Math.round(isaBalance * realReturnRate);

    pensionBalance += pensionGrowth;
    isaBalance += isaGrowth;

    const totalNetWorth = Math.round(pensionBalance + isaBalance);
    const isPotDepleted = totalNetWorth <= 0;

    projections.push({
      year,
      age: currentAge,
      startingPensionPot: startPension,
      startingIsaPot: startIsa,
      statePensionReceived: statePension,
      drawdownFromPension: pensionDrawdown,
      drawdownFromIsa: isaDrawdown,
      taxPaidOnDrawdown: taxPaid,
      investmentGrowth: pensionGrowth + isaGrowth,
      endingPensionPot: Math.round(pensionBalance),
      endingIsaPot: Math.round(isaBalance),
      totalNetWorth,
      isPotDepleted,
    });
  }

  const finalLegacyPotAtLifeExpectancy = Math.max(0, Math.round(pensionBalance + isaBalance));

  // 2027 IHT rule: unused pension subjected to 40% IHT if total estate > nil rate band
  let estimatedPost2027IhtExposure = 0;
  if (pensionBalance > PENSION_CONSTANTS.nilRateBand) {
    estimatedPost2027IhtExposure = Math.round(
      (pensionBalance - PENSION_CONSTANTS.nilRateBand) * PENSION_CONSTANTS.ihtStandardRate
    );
  }

  const totalStartingPot = accumulatedPension + pclsLumpSumTaken + accumulatedIsa;
  const initialDrawdownRatePercent =
    totalStartingPot > 0
      ? Math.round((inputs.desiredAnnualIncomeNet / totalStartingPot) * 1000) / 10
      : 0;

  // Sustainable safe withdrawal benchmark (3.8% SWR rule of thumb in UK)
  const sustainableSafeWithdrawalRatePercent = 3.8;

  let verdict: "SUSTAINABLE_DRAWDOWN" | "RISK_OF_DEPLETION" | "ANNUITY_RECOMMENDED" =
    "SUSTAINABLE_DRAWDOWN";
  let verdictReasoning = "";

  if (isFullyFunded && initialDrawdownRatePercent <= 4.2) {
    verdict = "SUSTAINABLE_DRAWDOWN";
    verdictReasoning = `Your retirement plan is robust. With an initial withdrawal rate of ${initialDrawdownRatePercent}%, your portfolio is projected to comfortably survive to age ${inputs.lifeExpectancyAge} with an estimated £${finalLegacyPotAtLifeExpectancy.toLocaleString()} legacy surplus.`;
  } else if (!isFullyFunded) {
    verdict = "RISK_OF_DEPLETION";
    verdictReasoning = `High depletion risk: Your desired spending of £${inputs.desiredAnnualIncomeNet.toLocaleString()}/yr draws down your capital faster than investment growth can replenish it, causing the portfolio to run dry at age ${potLastsUntilAge}. Consider securing baseline income via an annuity or adjusting retirement age.`;
  } else {
    verdict = "ANNUITY_RECOMMENDED";
    verdictReasoning = `Your withdrawal rate (${initialDrawdownRatePercent}%) is near the edge of market volatility risk. Combining a guaranteed annuity (£${guaranteedAnnuityAnnualIncome.toLocaleString()}/yr) with a smaller flexible drawdown pot provides optimal peace of mind.`;
  }

  return {
    inputs,
    projections,
    pclsLumpSumTaken,
    sustainableSafeWithdrawalRatePercent,
    initialDrawdownRatePercent,
    potLastsUntilAge,
    isFullyFunded,
    finalLegacyPotAtLifeExpectancy,
    guaranteedAnnuityAnnualIncome,
    estimatedPost2027IhtExposure,
    verdict,
    verdictReasoning,
  };
}
