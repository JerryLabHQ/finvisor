import { SDLT_CONFIG } from "./constants";

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
  sellingCostPercent?: number; // Optional selling agent/legal fee at exit (default: 1.5%)
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
  principalPaidThisYear: number;
  interestPaidThisYear: number;
  maintenancePaidThisYear: number;
  serviceChargePaidThisYear: number;
  
  // Renter metrics
  rentPaidThisYear: number;
  renterInvestmentPot: number;
  renterDepositRefundable: number;
  renterTotalNetWorth: number;
  renterSunkCostsCumulative: number;
  renterPaymentsThisYear: number;
}

export interface SunkCostBreakdown {
  buySdlt: number;
  buyLegalAndSurvey: number;
  buyMortgageInterest: number;
  buyMaintenance: number;
  buyServiceCharge: number;
  buyInsurance: number;
  buyTotal: number;
  
  rentCumulative: number;
  rentInsurance: number;
  rentTotal: number;
}

export interface CalculatorResults {
  inputs: CalculatorInputs;
  annualBreakdown: AnnualData[];
  breakEvenYear: number | null;
  buyUpfrontCosts: number;
  rentUpfrontCosts: number;
  depositAmount: number;
  loanAmount: number;
  initialMonthlyMortgage: number;
  initialMonthlyRent: number;
  initialMonthlyBuyerOutgoings: number;
  netWorthDifferenceAtHorizon: number; // Positive if Buy is better, negative if Rent
  buyTotalSunkCostsAtHorizon: number;
  rentTotalSunkCostsAtHorizon: number;
  sdltCost: number;
  sunkCostBreakdown: SunkCostBreakdown;
  sellingFeesAtHorizon: number;
  netBuyerWorthAfterSelling: number;
}

/**
 * Calculates Stamp Duty Land Tax (SDLT) for England & Northern Ireland
 */
export function calculateSDLT(price: number, isFirstTimeBuyer: boolean): number {
  if (price <= 0) return 0;

  if (isFirstTimeBuyer) {
    // First-time buyer relief applies to purchases up to £625,000
    if (price <= SDLT_CONFIG.firstTimeBuyerMaxPrice) {
      if (price <= SDLT_CONFIG.firstTimeBuyerZeroRateThreshold) {
        return 0;
      } else {
        return (price - SDLT_CONFIG.firstTimeBuyerZeroRateThreshold) * SDLT_CONFIG.firstTimeBuyerReliefRate;
      }
    }
    // If price is over £625k, no first-time buyer relief applies; standard rates are used
  }

  // Standard Rates (marginal bands)
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
  if (loanAmount <= 0) return 0;
  if (termYears <= 0) return loanAmount;
  if (annualRate <= 0) return loanAmount / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
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
    sellingCostPercent = 1.5,
  } = inputs;

  const deposit = propertyPrice * (depositPercent / 100);
  const loanAmount = Math.max(0, propertyPrice - deposit);
  
  // Upfront Costs
  const sdltCost = stampDutyOverride !== null ? stampDutyOverride : calculateSDLT(propertyPrice, isFirstTimeBuyer);
  const buyUpfrontCosts = deposit + sdltCost + legalFees + surveyFees;
  
  // Rent deposit is capped at 5 weeks rent in the UK
  const rentDeposit = (initialRent * 12 / 52) * 5;
  const rentUpfrontCosts = rentDeposit;
  
  // Starting investment differences
  const investmentDifference = buyUpfrontCosts - rentUpfrontCosts;
  
  let renterInvestments = investmentDifference > 0 ? investmentDifference : 0;
  let buyerInvestments = investmentDifference < 0 ? Math.abs(investmentDifference) : 0;

  let currentHomeValue = propertyPrice;
  let remainingMortgageBalance = loanAmount;
  let buyerSunkCostsCumulative = sdltCost + legalFees + surveyFees;
  let renterSunkCostsCumulative = 0;

  // Cumulative sunk trackers
  let cumulativeInterest = 0;
  let cumulativeMaintenance = 0;
  let cumulativeServiceCharge = 0;
  let cumulativeBuyerInsurance = 0;
  let cumulativeRent = 0;
  let cumulativeRenterInsurance = 0;

  const annualBreakdown: AnnualData[] = [];
  const totalMonths = Math.max(1, timeHorizonYears * 12);
  
  // Monthly rates
  const monthlyStockReturn = Math.pow(1 + investmentReturnPercent / 100, 1 / 12) - 1;
  const monthlyHpi = Math.pow(1 + houseAppreciationPercent / 100, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + inflationPercent / 100, 1 / 12) - 1;

  let buyerPaymentsThisYear = 0;
  let renterPaymentsThisYear = 0;
  let principalPaidThisYear = 0;
  let interestPaidThisYear = 0;
  let maintenancePaidThisYear = 0;
  let serviceChargePaidThisYear = 0;
  let rentPaidThisYear = 0;

  const initialMonthlyMortgage = calculateMonthlyMortgage(loanAmount, mortgageRate, mortgageTerm);
  const initialMonthlyBuyerOutgoings =
    initialMonthlyMortgage +
    councilTaxMonthly +
    serviceChargeMonthly +
    (propertyPrice * (maintenancePercent / 100) / 12) +
    insuranceMonthly;

  for (let month = 1; month <= totalMonths; month++) {
    const yearIndex = Math.ceil(month / 12);
    
    // Determine current mortgage rate (fixed vs SVR)
    const currentMortgageRate = month <= fixedTermYears * 12 ? mortgageRate : svrRate;
    
    // Monthly mortgage payment
    let monthlyMortgage = 0;
    const remainingMonths = (mortgageTerm * 12) - (month - 1);
    if (remainingMortgageBalance > 0 && remainingMonths > 0) {
      if (remainingMonths === 1) {
        const lastMonthInterest = remainingMortgageBalance * (currentMortgageRate / 100 / 12);
        monthlyMortgage = remainingMortgageBalance + lastMonthInterest;
      } else {
        monthlyMortgage = calculateMonthlyMortgage(remainingMortgageBalance, currentMortgageRate, remainingMonths / 12);
      }
    }

    // Buyer Monthly Costs (inflating council tax, insurance, service charge over time)
    const inflationFactor = Math.pow(1 + monthlyInflation, month);
    
    const monthlyMaintenance = (currentHomeValue * (maintenancePercent / 100)) / 12;
    const monthlyServiceCharge = serviceChargeMonthly * inflationFactor;
    const monthlyBuyerInsurance = insuranceMonthly * inflationFactor;
    const monthlyCouncilTax = councilTaxMonthly * inflationFactor;

    const buyerMonthlyOutgoings = 
      monthlyMortgage +
      monthlyCouncilTax +
      monthlyServiceCharge +
      monthlyMaintenance +
      monthlyBuyerInsurance;

    // Mortgage Interest and Principal breakdown
    let interestPayment = 0;
    let principalPayment = 0;
    if (remainingMortgageBalance > 0) {
      interestPayment = remainingMortgageBalance * (currentMortgageRate / 100 / 12);
      principalPayment = Math.min(Math.max(0, monthlyMortgage - interestPayment), remainingMortgageBalance);
      remainingMortgageBalance -= principalPayment;
      if (remainingMortgageBalance < 0.01) {
        remainingMortgageBalance = 0;
      }
    }

    cumulativeInterest += interestPayment;
    cumulativeMaintenance += monthlyMaintenance;
    cumulativeServiceCharge += monthlyServiceCharge;
    cumulativeBuyerInsurance += monthlyBuyerInsurance;

    interestPaidThisYear += interestPayment;
    principalPaidThisYear += principalPayment;
    maintenancePaidThisYear += monthlyMaintenance;
    serviceChargePaidThisYear += monthlyServiceCharge;

    // Buyer Sunk Costs: Interest + Maintenance + Insurance + Service Charge + Council Tax
    const buyerMonthlySunk = interestPayment + monthlyMaintenance + monthlyBuyerInsurance + monthlyServiceCharge + monthlyCouncilTax;
    buyerSunkCostsCumulative += buyerMonthlySunk;

    // Renter Monthly Costs (inflated rent + insurance + council tax)
    const currentRentForMonth = initialRent * Math.pow(1 + rentIncreasePercent / 100, (yearIndex - 1));
    const monthlyRenterInsurance = renterInsuranceMonthly * inflationFactor;
    const renterMonthlyOutgoings = 
      currentRentForMonth +
      monthlyRenterInsurance +
      monthlyCouncilTax;

    cumulativeRent += currentRentForMonth;
    cumulativeRenterInsurance += monthlyRenterInsurance;
    rentPaidThisYear += currentRentForMonth;

    renterSunkCostsCumulative += renterMonthlyOutgoings;

    // Opportunity Cost calculation: invest the monthly outgoings difference
    const monthlyDifference = buyerMonthlyOutgoings - renterMonthlyOutgoings;
    
    // Compound investments
    buyerInvestments *= (1 + monthlyStockReturn);
    renterInvestments *= (1 + monthlyStockReturn);

    if (monthlyDifference > 0) {
      // Renting is cheaper this month -> renter invests the savings
      renterInvestments += monthlyDifference;
    } else {
      // Buying is cheaper this month -> buyer invests the savings
      buyerInvestments += Math.abs(monthlyDifference);
    }

    // Home appreciates
    currentHomeValue *= (1 + monthlyHpi);

    buyerPaymentsThisYear += buyerMonthlyOutgoings;
    renterPaymentsThisYear += renterMonthlyOutgoings;

    // Store annual summary
    if (month % 12 === 0 || month === totalMonths) {
      const year = Math.ceil(month / 12);
      annualBreakdown.push({
        year,
        homeValue: Math.round(currentHomeValue),
        mortgageBalance: Math.round(remainingMortgageBalance),
        buyerEquity: Math.round(Math.max(0, currentHomeValue - remainingMortgageBalance)),
        buyerInvestmentPot: Math.round(buyerInvestments),
        buyerTotalNetWorth: Math.round(Math.max(0, currentHomeValue - remainingMortgageBalance) + buyerInvestments),
        buyerSunkCostsCumulative: Math.round(buyerSunkCostsCumulative),
        buyerPaymentsThisYear: Math.round(buyerPaymentsThisYear),
        principalPaidThisYear: Math.round(principalPaidThisYear),
        interestPaidThisYear: Math.round(interestPaidThisYear),
        maintenancePaidThisYear: Math.round(maintenancePaidThisYear),
        serviceChargePaidThisYear: Math.round(serviceChargePaidThisYear),
        
        rentPaidThisYear: Math.round(rentPaidThisYear),
        renterInvestmentPot: Math.round(renterInvestments),
        renterDepositRefundable: Math.round(rentDeposit * Math.pow(1 + inflationPercent / 100, year)),
        renterTotalNetWorth: Math.round(renterInvestments + rentDeposit),
        renterSunkCostsCumulative: Math.round(renterSunkCostsCumulative),
        renterPaymentsThisYear: Math.round(renterPaymentsThisYear),
      });

      buyerPaymentsThisYear = 0;
      renterPaymentsThisYear = 0;
      principalPaidThisYear = 0;
      interestPaidThisYear = 0;
      maintenancePaidThisYear = 0;
      serviceChargePaidThisYear = 0;
      rentPaidThisYear = 0;
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
  const sellingFeesAtHorizon = Math.round(finalYearData.homeValue * (sellingCostPercent / 100));
  const netBuyerWorthAfterSelling = finalYearData.buyerTotalNetWorth - sellingFeesAtHorizon;

  const sunkCostBreakdown: SunkCostBreakdown = {
    buySdlt: Math.round(sdltCost),
    buyLegalAndSurvey: Math.round(legalFees + surveyFees),
    buyMortgageInterest: Math.round(cumulativeInterest),
    buyMaintenance: Math.round(cumulativeMaintenance),
    buyServiceCharge: Math.round(cumulativeServiceCharge),
    buyInsurance: Math.round(cumulativeBuyerInsurance),
    buyTotal: Math.round(buyerSunkCostsCumulative),
    
    rentCumulative: Math.round(cumulativeRent),
    rentInsurance: Math.round(cumulativeRenterInsurance),
    rentTotal: Math.round(renterSunkCostsCumulative),
  };

  return {
    inputs,
    annualBreakdown,
    breakEvenYear,
    buyUpfrontCosts: Math.round(buyUpfrontCosts),
    rentUpfrontCosts: Math.round(rentUpfrontCosts),
    depositAmount: Math.round(deposit),
    loanAmount: Math.round(loanAmount),
    initialMonthlyMortgage: Math.round(initialMonthlyMortgage),
    initialMonthlyRent: Math.round(initialRent),
    initialMonthlyBuyerOutgoings: Math.round(initialMonthlyBuyerOutgoings),
    netWorthDifferenceAtHorizon: Math.round(netWorthDifferenceAtHorizon),
    buyTotalSunkCostsAtHorizon: finalYearData.buyerSunkCostsCumulative,
    rentTotalSunkCostsAtHorizon: finalYearData.renterSunkCostsCumulative,
    sdltCost: Math.round(sdltCost),
    sunkCostBreakdown,
    sellingFeesAtHorizon,
    netBuyerWorthAfterSelling: Math.round(netBuyerWorthAfterSelling),
  };
}

/**
 * Runs stress test variations against baseline inputs
 */
export function runStressTests(baselineInputs: CalculatorInputs) {
  const base = runBuyVsRentCalculation(baselineInputs);

  const rateHikeInputs: CalculatorInputs = {
    ...baselineInputs,
    mortgageRate: baselineInputs.mortgageRate + 1.5,
    svrRate: baselineInputs.svrRate + 1.5,
  };
  const rateHike = runBuyVsRentCalculation(rateHikeInputs);

  const priceDropInputs: CalculatorInputs = {
    ...baselineInputs,
    houseAppreciationPercent: Math.max(-2, baselineInputs.houseAppreciationPercent - 2.5),
  };
  const priceDrop = runBuyVsRentCalculation(priceDropInputs);

  const rentSurgeInputs: CalculatorInputs = {
    ...baselineInputs,
    rentIncreasePercent: baselineInputs.rentIncreasePercent + 2.5,
  };
  const rentSurge = runBuyVsRentCalculation(rentSurgeInputs);

  return [
    {
      id: "baseline",
      title: "Baseline Scenario",
      description: `Current inputs (${baselineInputs.mortgageRate}% mortgage, ${baselineInputs.houseAppreciationPercent}% HPI, ${baselineInputs.rentIncreasePercent}% rent inflation)`,
      results: base,
      netWorthDiff: base.netWorthDifferenceAtHorizon,
      breakEven: base.breakEvenYear,
    },
    {
      id: "rate-hike",
      title: "Interest Rate Shock (+1.5%)",
      description: `Mortgage rates climb to ${(baselineInputs.mortgageRate + 1.5).toFixed(1)}%, increasing monthly debt service`,
      results: rateHike,
      netWorthDiff: rateHike.netWorthDifferenceAtHorizon,
      breakEven: rateHike.breakEvenYear,
    },
    {
      id: "price-slump",
      title: "Cooling Property Market (-2.5% HPI)",
      description: `House appreciation slows to ${Math.max(-2, baselineInputs.houseAppreciationPercent - 2.5).toFixed(1)}% annually`,
      results: priceDrop,
      netWorthDiff: priceDrop.netWorthDifferenceAtHorizon,
      breakEven: priceDrop.breakEvenYear,
    },
    {
      id: "rent-surge",
      title: "Rental Cost Surge (+2.5%/yr)",
      description: `Rent inflation accelerates to ${(baselineInputs.rentIncreasePercent + 2.5).toFixed(1)}% per year`,
      results: rentSurge,
      netWorthDiff: rentSurge.netWorthDifferenceAtHorizon,
      breakEven: rentSurge.breakEvenYear,
    },
  ];
}
