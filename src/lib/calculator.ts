export interface CalculatorInputs {
  propertyPrice: number;
  depositPercent: number;
  mortgageRate: number; // Initial fixed rate (e.g. 4.5% = 4.5)
  mortgageTerm: number; // e.g. 25 or 30 years
  fixedTermYears: number; // Fixed rate period (e.g. 5)
  svrRate: number; // Standard Variable Rate after fixed term (e.g. 7.5)
  isFirstTimeBuyer: boolean;
  stampDutyOverride: number | null;
  legalFees: number;
  surveyFees: number;
  councilTaxMonthly: number;
  serviceChargeMonthly: number;
  maintenancePercent: number; // Annual maintenance as % of property price (e.g. 1% = 1.0)
  insuranceMonthly: number; // Buildings insurance
  
  initialRent: number;
  rentIncreasePercent: number; // e.g. 3.5%
  renterInsuranceMonthly: number; // Contents insurance
  
  investmentReturnPercent: number; // Stocks and shares ISA return (e.g. 7.0)
  inflationPercent: number; // CPI (e.g. 2.5)
  houseAppreciationPercent: number; // HPI (e.g. 3.5)
  timeHorizonYears: number;
}

export interface AnnualData {
  year: number;
  // Buyer metrics
  homeValue: number;
  mortgageBalance: number;
  buyerEquity: number;
  buyerInvestmentPot: number;
  buyerTotalNetWorth: number;
  buyerSunkCostsCumulative: number;
  buyerPaymentsThisYear: number;
  
  // Renter metrics
  renterInvestmentPot: number;
  renterDepositRefundable: number;
  renterTotalNetWorth: number;
  renterSunkCostsCumulative: number;
  renterPaymentsThisYear: number;
}

export interface CalculatorResults {
  inputs: CalculatorInputs;
  annualBreakdown: AnnualData[];
  breakEvenYear: number | null;
  buyUpfrontCosts: number;
  rentUpfrontCosts: number;
  netWorthDifferenceAtHorizon: number; // Positive if Buy is better, negative if Rent
  buyTotalSunkCostsAtHorizon: number;
  rentTotalSunkCostsAtHorizon: number;
  sdltCost: number;
}

/**
 * Calculates Stamp Duty Land Tax (SDLT) for England & Northern Ireland
 */
export function calculateSDLT(price: number, isFirstTimeBuyer: boolean): number {
  if (isFirstTimeBuyer) {
    // First-time buyer relief applies to purchases up to £625,000
    if (price <= 625000) {
      if (price <= 425000) {
        return 0;
      } else {
        // 0% on first 425k, 5% on 425k to price
        return (price - 425000) * 0.05;
      }
    }
    // If price is over £625k, no relief applies; standard rates are used
  }

  // Standard Rates
  let sdlt = 0;
  if (price > 1500000) {
    sdlt += (price - 1500000) * 0.12;
    sdlt += (1500000 - 925000) * 0.10;
    sdlt += (925000 - 250000) * 0.05;
  } else if (price > 925000) {
    sdlt += (price - 925000) * 0.10;
    sdlt += (925000 - 250000) * 0.05;
  } else if (price > 250000) {
    sdlt += (price - 250000) * 0.05;
  }
  return sdlt;
}

/**
 * Calculates the monthly mortgage payment based on standard amortization
 */
export function calculateMonthlyMortgage(
  loanAmount: number,
  annualRate: number,
  termYears: number
): number {
  if (annualRate <= 0) return loanAmount / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function runBuyVsRentCalculation(inputs: CalculatorInputs): CalculatorResults {
  const {
    propertyPrice,
    depositPercent,
    mortgageRate,
    mortgageTerm,
    fixedTermYears,
    svrRate,
    isFirstTimeBuyer,
    stampDutyOverride,
    legalFees,
    surveyFees,
    councilTaxMonthly,
    serviceChargeMonthly,
    maintenancePercent,
    insuranceMonthly,
    initialRent,
    rentIncreasePercent,
    renterInsuranceMonthly,
    investmentReturnPercent,
    inflationPercent,
    houseAppreciationPercent,
    timeHorizonYears,
  } = inputs;

  const deposit = propertyPrice * (depositPercent / 100);
  const loanAmount = propertyPrice - deposit;
  
  // Upfront Costs
  const sdltCost = stampDutyOverride !== null ? stampDutyOverride : calculateSDLT(propertyPrice, isFirstTimeBuyer);
  const buyUpfrontCosts = deposit + sdltCost + legalFees + surveyFees;
  
  // Rent deposit is usually capped at 5 weeks rent in the UK
  const rentDeposit = (initialRent * 12 / 52) * 5;
  const rentUpfrontCosts = rentDeposit;
  
  // Starting investment differences
  const investmentDifference = buyUpfrontCosts - rentUpfrontCosts;
  
  // If renting, we invest the difference in upfront costs
  let renterInvestments = investmentDifference > 0 ? investmentDifference : 0;
  let buyerInvestments = investmentDifference < 0 ? Math.abs(investmentDifference) : 0;

  let currentHomeValue = propertyPrice;
  let remainingMortgageBalance = loanAmount;
  let buyerSunkCostsCumulative = sdltCost + legalFees + surveyFees;
  let renterSunkCostsCumulative = 0;

  const annualBreakdown: AnnualData[] = [];
  const totalMonths = timeHorizonYears * 12;
  
  // Monthly rates
  const monthlyStockReturn = Math.pow(1 + investmentReturnPercent / 100, 1 / 12) - 1;
  const monthlyHpi = Math.pow(1 + houseAppreciationPercent / 100, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + inflationPercent / 100, 1 / 12) - 1;

  let buyerPaymentsThisYear = 0;
  let renterPaymentsThisYear = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const yearIndex = Math.ceil(month / 12);
    
    // Determine current mortgage rate (fixed vs SVR)
    const currentMortgageRate = month <= fixedTermYears * 12 ? mortgageRate : svrRate;
    
    // Monthly mortgage payment (re-calculates if rate changes after fixed term, but for simplicity we calculate initial and SVR)
    // To handle SVR change accurately: remaining balance is amortized over remaining term
    let monthlyMortgage = 0;
    if (remainingMortgageBalance > 0) {
      const remainingTermYears = mortgageTerm - (month - 1) / 12;
      monthlyMortgage = calculateMonthlyMortgage(remainingMortgageBalance, currentMortgageRate, remainingTermYears);
    }

    // Buyer Monthly Costs (inflating council tax, insurance, service charge, maintenance over time)
    const inflationFactor = Math.pow(1 + monthlyInflation, month);
    
    const monthlyMaintenance = (currentHomeValue * (maintenancePercent / 100)) / 12;
    const buyerMonthlyOutgoings = 
      monthlyMortgage +
      (councilTaxMonthly * inflationFactor) +
      (serviceChargeMonthly * inflationFactor) +
      monthlyMaintenance +
      (insuranceMonthly * inflationFactor);

    // Mortgage Interest and Principal breakdown
    let interestPayment = 0;
    let principalPayment = 0;
    if (remainingMortgageBalance > 0) {
      interestPayment = remainingMortgageBalance * (currentMortgageRate / 100 / 12);
      principalPayment = Math.min(monthlyMortgage - interestPayment, remainingMortgageBalance);
      remainingMortgageBalance -= principalPayment;
    }

    // Buyer Sunk Costs: Interest + Maintenance + Insurance + Service Charge + Council Tax
    const buyerMonthlySunk = interestPayment + monthlyMaintenance + (insuranceMonthly * inflationFactor) + (serviceChargeMonthly * inflationFactor) + (councilTaxMonthly * inflationFactor);
    buyerSunkCostsCumulative += buyerMonthlySunk;

    // Renter Monthly Costs (inflated rent + insurance + council tax)
    const currentRentForMonth = initialRent * Math.pow(1 + rentIncreasePercent / 100, (yearIndex - 1));
    const renterMonthlyOutgoings = 
      currentRentForMonth +
      (renterInsuranceMonthly * inflationFactor) +
      (councilTaxMonthly * inflationFactor);

    renterSunkCostsCumulative += renterMonthlyOutgoings;

    // Opportunity Cost calculation:
    // We compare monthly outgoings and invest the difference
    const monthlyDifference = buyerMonthlyOutgoings - renterMonthlyOutgoings;
    
    // Compound investments first
    buyerInvestments *= (1 + monthlyStockReturn);
    renterInvestments *= (1 + monthlyStockReturn);

    if (monthlyDifference > 0) {
      // Renting is cheaper this month, so renter invests the savings
      renterInvestments += monthlyDifference;
    } else {
      // Buying is cheaper this month, so buyer invests the savings
      buyerInvestments += Math.abs(monthlyDifference);
    }

    // Home appreciates
    currentHomeValue *= (1 + monthlyHpi);

    buyerPaymentsThisYear += buyerMonthlyOutgoings;
    renterPaymentsThisYear += renterMonthlyOutgoings;

    // Store annual summary
    if (month % 12 === 0) {
      const year = month / 12;
      annualBreakdown.push({
        year,
        homeValue: Math.round(currentHomeValue),
        mortgageBalance: Math.round(remainingMortgageBalance),
        buyerEquity: Math.round(Math.max(0, currentHomeValue - remainingMortgageBalance)),
        buyerInvestmentPot: Math.round(buyerInvestments),
        buyerTotalNetWorth: Math.round(Math.max(0, currentHomeValue - remainingMortgageBalance) + buyerInvestments),
        buyerSunkCostsCumulative: Math.round(buyerSunkCostsCumulative),
        buyerPaymentsThisYear: Math.round(buyerPaymentsThisYear),
        
        renterInvestmentPot: Math.round(renterInvestments),
        renterDepositRefundable: Math.round(rentDeposit * Math.pow(1 + inflationPercent / 100, year)),
        renterTotalNetWorth: Math.round(renterInvestments + rentDeposit),
        renterSunkCostsCumulative: Math.round(renterSunkCostsCumulative),
        renterPaymentsThisYear: Math.round(renterPaymentsThisYear),
      });

      buyerPaymentsThisYear = 0;
      renterPaymentsThisYear = 0;
    }
  }

  // Find break-even year
  let breakEvenYear: number | null = null;
  for (const yearData of annualBreakdown) {
    if (yearData.buyerTotalNetWorth > yearData.renterTotalNetWorth) {
      breakEvenYear = yearData.year;
      break;
    }
  }

  const finalYearData = annualBreakdown[annualBreakdown.length - 1];
  const netWorthDifferenceAtHorizon = finalYearData.buyerTotalNetWorth - finalYearData.renterTotalNetWorth;

  return {
    inputs,
    annualBreakdown,
    breakEvenYear,
    buyUpfrontCosts,
    rentUpfrontCosts,
    netWorthDifferenceAtHorizon,
    buyTotalSunkCostsAtHorizon: finalYearData.buyerSunkCostsCumulative,
    rentTotalSunkCostsAtHorizon: finalYearData.renterSunkCostsCumulative,
    sdltCost,
  };
}
