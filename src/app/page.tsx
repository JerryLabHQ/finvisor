"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  Sliders, 
  X, 
  Home, 
  Sparkles, 
  CheckCircle,
  PiggyBank,
  Briefcase
} from "lucide-react";
import { runBuyVsRentCalculation, CalculatorInputs } from "@/lib/calculator";
import "./dashboard.css";

// Helper for formatting GBP
const formatGBP = (value: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false);
  
  // State for basic inputs
  const [propertyPrice, setPropertyPrice] = useState(450000);
  const [depositPercent, setDepositPercent] = useState(15);
  const [initialRent, setInitialRent] = useState(1850);
  const [timeHorizon, setTimeHorizon] = useState(15);

  // State for advanced inputs
  const [mortgageRate, setMortgageRate] = useState(4.5);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  const [fixedTermYears, setFixedTermYears] = useState(5);
  const [svrRate, setSvrRate] = useState(7.5);
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(true);
  const [legalFees, setLegalFees] = useState(1500);
  const [surveyFees, setSurveyFees] = useState(500);
  const [councilTaxMonthly, setCouncilTaxMonthly] = useState(180);
  const [serviceChargeMonthly, setServiceChargeMonthly] = useState(120);
  const [maintenancePercent, setMaintenancePercent] = useState(1.0);
  const [insuranceMonthly, setInsuranceMonthly] = useState(35);
  
  const [rentIncreasePercent, setRentIncreasePercent] = useState(3.5);
  const [renterInsuranceMonthly, setRenterInsuranceMonthly] = useState(15);
  
  const [investmentReturnPercent, setInvestmentReturnPercent] = useState(7.0);
  const [inflationPercent, setInflationPercent] = useState(2.5);
  const [houseAppreciationPercent, setHouseAppreciationPercent] = useState(3.5);

  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  // Fix hydration issues with Recharts
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Compute inputs object
  const inputs: CalculatorInputs = useMemo(() => {
    return {
      propertyPrice,
      depositPercent,
      mortgageRate,
      mortgageTerm,
      fixedTermYears,
      svrRate,
      isFirstTimeBuyer,
      stampDutyOverride: null,
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
      timeHorizonYears: timeHorizon,
    };
  }, [
    propertyPrice, depositPercent, mortgageRate, mortgageTerm, fixedTermYears, svrRate,
    isFirstTimeBuyer, legalFees, surveyFees, councilTaxMonthly, serviceChargeMonthly,
    maintenancePercent, insuranceMonthly, initialRent, rentIncreasePercent,
    renterInsuranceMonthly, investmentReturnPercent, inflationPercent,
    houseAppreciationPercent, timeHorizon
  ]);

  // Run calculation
  const results = useMemo(() => {
    return runBuyVsRentCalculation(inputs);
  }, [inputs]);

  // Dynamic recommendation copy
  const advisorRecommendation = useMemo(() => {
    const horizon = timeHorizon;
    const diff = results.netWorthDifferenceAtHorizon;
    const absDiff = Math.abs(diff);
    
    if (diff > 0) {
      return {
        decision: "BUY",
        title: "Buying is the clear winner",
        class: "text-primary",
        main: `Buying is mathematically the stronger financial decision for this scenario. Over your ${horizon}-year time horizon, buying will build ${formatGBP(absDiff)} more net worth (equity + investments) than renting.`,
        details: results.breakEvenYear 
          ? `You will break even on the upfront purchase costs (Stamp Duty, fees) in Year ${results.breakEvenYear}, after which the equity growth rapidly outpaces renting.`
          : `Even though buying has high initial upfront costs, you will end up wealthier due to compounding property appreciation and mortgage principal paydown.`
      };
    } else {
      return {
        decision: "RENT",
        title: "Renting is the stronger move",
        class: "text-secondary",
        main: `Renting and investing your deposit is mathematically the stronger decision here. By renting, you will build ${formatGBP(absDiff)} more net worth over ${horizon} years compared to buying.`,
        details: `Due to high interest rates (${mortgageRate}% fixed / ${svrRate}% SVR) and buying outgoings, renting and putting the £${((propertyPrice * depositPercent / 100) + results.sdltCost + legalFees + surveyFees - (initialRent * 5 * 12 / 52)).toFixed(0)} difference into a Stocks & Shares ISA at ${investmentReturnPercent}% yields better returns.`
      };
    }
  }, [results, timeHorizon, propertyPrice, depositPercent, mortgageRate, svrRate, investmentReturnPercent, initialRent, legalFees, surveyFees]);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadFormSubmitted(true);
    setTimeout(() => {
      setIsLeadModalOpen(false);
      setLeadFormSubmitted(false);
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
    }, 2500);
  };

  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <nav className="nav-bar glass-panel">
        <div className="logo">
          <TrendingUp className="logo-icon" />
          <span>finvisor</span>
        </div>
        <ul className="nav-links">
          <li><a href="#" className="active">UK Calculator</a></li>
          <li><a href="https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/housepriceindex/latest" target="_blank" rel="noreferrer">ONS Market Data</a></li>
        </ul>
      </nav>

      {/* Main Form Quick Bar */}
      <div className="quick-inputs-bar glass-panel">
        <div className="quick-inputs-group">
          <div className="input-field-wrapper">
            <label className="input-label" htmlFor="prop-price">Property Price</label>
            <div className="input-with-symbol">
              <span className="input-symbol">£</span>
              <input
                id="prop-price"
                type="number"
                className="numeric-input"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="input-field-wrapper">
            <label className="input-label" htmlFor="deposit-pct">Deposit</label>
            <div className="input-with-symbol">
              <input
                id="deposit-pct"
                type="number"
                className="numeric-input"
                value={depositPercent}
                onChange={(e) => setDepositPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                style={{ paddingLeft: "12px", paddingRight: "28px" }}
              />
              <span className="input-symbol-right">%</span>
            </div>
          </div>

          <div className="input-field-wrapper">
            <label className="input-label" htmlFor="init-rent">Monthly Rent</label>
            <div className="input-with-symbol">
              <span className="input-symbol">£</span>
              <input
                id="init-rent"
                type="number"
                className="numeric-input"
                value={initialRent}
                onChange={(e) => setInitialRent(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>
        </div>

        <button className="settings-btn" onClick={() => setIsDrawerOpen(true)}>
          <Sliders size={18} />
          <span>Advanced Settings</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side (Visuals) */}
        <div className="visuals-area">
          {/* Main Net Worth Chart Card */}
          <div className="chart-container glass-panel">
            <div className="chart-header">
              <div className="chart-title-group">
                <h2>Net Worth Comparison</h2>
                <span className="chart-subtitle">Comparing Total Net Worth (Property Equity + Investments) over time</span>
              </div>
              
              {results.breakEvenYear ? (
                <div className="break-even-badge">
                  <Sparkles size={16} />
                  <span>Break-Even: {results.breakEvenYear} Years</span>
                </div>
              ) : (
                <div className="break-even-badge no-breakeven">
                  <X size={16} />
                  <span>Renting Wins Throughout</span>
                </div>
              )}
            </div>

            {/* Time Horizon Slider */}
            <div className="slider-group" style={{ padding: "8px 0" }}>
              <div className="slider-labels">
                <span>Projection Timeframe</span>
                <span style={{ color: "var(--primary)", fontWeight: "800" }}>{timeHorizon} Years</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="1"
                max="40"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
              />
            </div>

            {/* Recharts Area */}
            <div style={{ width: "100%", height: 320, marginTop: 12 }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={results.annualBreakdown}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="year" 
                      stroke="var(--on-surface-variant)" 
                      fontSize={12} 
                      tickLine={false}
                      label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fill: 'var(--on-surface-variant)', fontSize: 11 }}
                    />
                    <YAxis 
                      stroke="var(--on-surface-variant)" 
                      fontSize={11} 
                      tickLine={false}
                      tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--surface-container-high)", 
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                      formatter={(value) => [formatGBP(Number(value || 0)), ""]}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      content={() => (
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="legend-color-buy"></span>
                            <span style={{color: "var(--primary)"}}>Buying (Equity + Savings)</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color-rent"></span>
                            <span style={{color: "var(--secondary)"}}>Renting (Savings ISA)</span>
                          </div>
                        </div>
                      )}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="buyerTotalNetWorth" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorBuy)" 
                      name="Buying Total"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="renterTotalNetWorth" 
                      stroke="var(--secondary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRent)" 
                      name="Renting Total"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-surface-variant)" }}>
                  Loading Projection Chart...
                </div>
              )}
            </div>
          </div>

          {/* Sunk Cost Metrics Comparison */}
          <div className="stats-row">
            {/* Buying Stats */}
            <div className="stat-card buy-card glass-panel">
              <div className="stat-header">
                <span className="stat-title">Buying Summary</span>
                <Home size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div className="stat-value" style={{ color: "var(--primary)" }}>
                {formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.buyerTotalNetWorth || 0)}
              </div>
              <div className="stat-subtitle" style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "-6px" }}>
                Projected Net Worth in {timeHorizon} Years
              </div>
              <div className="stat-details">
                <div className="detail-row">
                  <span>Home Equity:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.buyerEquity || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Investment Pot:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.buyerInvestmentPot || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Total Sunk Costs:</span>
                  <span className="detail-value" style={{ color: "var(--tertiary)" }}>{formatGBP(results.buyTotalSunkCostsAtHorizon)}</span>
                </div>
                <div className="detail-row">
                  <span>Upfront Cash Required:</span>
                  <span className="detail-value">{formatGBP(results.buyUpfrontCosts)}</span>
                </div>
              </div>
            </div>

            {/* Renting Stats */}
            <div className="stat-card rent-card glass-panel">
              <div className="stat-header">
                <span className="stat-title">Renting Summary</span>
                <PiggyBank size={18} style={{ color: "var(--secondary)" }} />
              </div>
              <div className="stat-value" style={{ color: "var(--secondary)" }}>
                {formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.renterTotalNetWorth || 0)}
              </div>
              <div className="stat-subtitle" style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "-6px" }}>
                Projected Net Worth in {timeHorizon} Years
              </div>
              <div className="stat-details">
                <div className="detail-row">
                  <span>Stocks ISA Pot:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.renterInvestmentPot || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Refundable Deposit:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.renterDepositRefundable || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Total Sunk Rent/Fees:</span>
                  <span className="detail-value" style={{ color: "var(--tertiary)" }}>{formatGBP(results.rentTotalSunkCostsAtHorizon)}</span>
                </div>
                <div className="detail-row">
                  <span>Upfront Cash Required:</span>
                  <span className="detail-value">{formatGBP(results.rentUpfrontCosts)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Advisor & Lead Gen) */}
        <div className="advisor-area">
          <div className="advisor-card glass-panel">
            <div className="advisor-header">
              <Sparkles className="advisor-icon" />
              <h3 className="advisor-title">Advisor Recommendations</h3>
            </div>
            <h4 style={{ fontSize: 16, marginTop: 4 }} className={advisorRecommendation.class}>
              {advisorRecommendation.title}
            </h4>
            <p className="advisor-recommendation">
              {advisorRecommendation.main}
            </p>
            <div className="advisor-details">
              {advisorRecommendation.details}
            </div>
          </div>

          <div className="cta-card glass-panel">
            <Briefcase size={24} style={{ color: "var(--primary)", margin: "0 auto 4px" }} />
            <h3 className="cta-title">UK Mortgage & Tax Review</h3>
            <p className="cta-desc">
              Mortgage options in the UK are shifting. Get a bespoke illustration including first-time buyer incentives, Stamp Duty optimization, and current lender fixed-rates.
            </p>
            <button className="cta-button" onClick={() => setIsLeadModalOpen(true)}>
              Get Free Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Settings Drawer Overlay */}
      <div 
        className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`} 
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Drawer */}
      <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Advanced UK Settings</h2>
          <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Mortgage settings */}
          <div className="drawer-section">
            <h3 className="section-title">Buying & Mortgage</h3>
            
            <div className="checkbox-row" onClick={() => setIsFirstTimeBuyer(!isFirstTimeBuyer)}>
              <input 
                type="checkbox" 
                className="checkbox-input"
                checked={isFirstTimeBuyer}
                onChange={() => {}} // Controlled by row click
              />
              <span className="checkbox-label">First-Time Buyer Relief</span>
            </div>
            <p className="help-text">
              Saves SDLT (Stamp Duty) on purchases up to £625k in England/NI.
            </p>

            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Mortgage Rate (Fixed)</span>
                  <span>{mortgageRate}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="1" 
                  max="10" 
                  step="0.1"
                  value={mortgageRate}
                  onChange={(e) => setMortgageRate(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Fixed Term period</span>
                  <span>{fixedTermYears} Years</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="1" 
                  max="10" 
                  value={fixedTermYears}
                  onChange={(e) => setFixedTermYears(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Standard Variable Rate (SVR)</span>
                  <span>{svrRate}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="3" 
                  max="12" 
                  step="0.1"
                  value={svrRate}
                  onChange={(e) => setSvrRate(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Mortgage Term</span>
                  <span>{mortgageTerm} Years</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="10" 
                  max="40" 
                  value={mortgageTerm}
                  onChange={(e) => setMortgageTerm(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Running costs */}
          <div className="drawer-section">
            <h3 className="section-title">Running Costs (Annual/Monthly)</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Monthly Council Tax</span>
                  <span>£{councilTaxMonthly}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="50" 
                  max="500" 
                  step="10"
                  value={councilTaxMonthly}
                  onChange={(e) => setCouncilTaxMonthly(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Monthly Service Charge / Ground Rent</span>
                  <span>£{serviceChargeMonthly}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="0" 
                  max="800" 
                  step="10"
                  value={serviceChargeMonthly}
                  onChange={(e) => setServiceChargeMonthly(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Maintenance Reserve (Annual %)</span>
                  <span>{maintenancePercent}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="0" 
                  max="3" 
                  step="0.1"
                  value={maintenancePercent}
                  onChange={(e) => setMaintenancePercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Monthly Buildings Insurance</span>
                  <span>£{insuranceMonthly}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="10" 
                  max="150" 
                  step="5"
                  value={insuranceMonthly}
                  onChange={(e) => setInsuranceMonthly(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Legal & Solicitor Fees</span>
                  <span>£{legalFees}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="500" 
                  max="5000" 
                  step="100"
                  value={legalFees}
                  onChange={(e) => setLegalFees(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Survey & Valuation Fees</span>
                  <span>£{surveyFees}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="100" 
                  max="2000" 
                  step="50"
                  value={surveyFees}
                  onChange={(e) => setSurveyFees(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Rent details */}
          <div className="drawer-section rent-section">
            <h3 className="section-title rent-section">Renting Details</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Annual Rent Increase</span>
                  <span>{rentIncreasePercent}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="0" 
                  max="15" 
                  step="0.5"
                  value={rentIncreasePercent}
                  onChange={(e) => setRentIncreasePercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Monthly Contents Insurance</span>
                  <span>£{renterInsuranceMonthly}</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={renterInsuranceMonthly}
                  onChange={(e) => setRenterInsuranceMonthly(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Economic variables */}
          <div className="drawer-section eco-section">
            <h3 className="section-title eco-section">Macroeconomics (UK index values)</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Stocks/ISA Returns (Annual)</span>
                  <span>{investmentReturnPercent}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="1" 
                  max="15" 
                  step="0.5"
                  value={investmentReturnPercent}
                  onChange={(e) => setInvestmentReturnPercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>House Appreciation (HPI Annual)</span>
                  <span>{houseAppreciationPercent}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="-2" 
                  max="10" 
                  step="0.1"
                  value={houseAppreciationPercent}
                  onChange={(e) => setHouseAppreciationPercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>CPI Inflation (Annual)</span>
                  <span>{inflationPercent}%</span>
                </div>
                <input 
                  type="range" 
                  className="slider-input" 
                  min="0" 
                  max="10" 
                  step="0.1"
                  value={inflationPercent}
                  onChange={(e) => setInflationPercent(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Generation Modal */}
      {isLeadModalOpen && (
        <div className="drawer-overlay open" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-panel" style={{ width: "90%", maxWidth: 450, padding: 32, display: "flex", flexDirection: "column", gap: 20, position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" style={{ position: "absolute", top: 16, right: 16 }} onClick={() => setIsLeadModalOpen(false)}>
              <X size={20} />
            </button>
            
            {leadFormSubmitted ? (
              <div style={{ textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <CheckCircle size={48} style={{ color: "var(--secondary)" }} />
                <h3 style={{ fontSize: 20 }}>Consultation Requested</h3>
                <p style={{ color: "var(--on-surface-variant)", fontSize: 14 }}>
                  A UK FCA-regulated mortgage advisor will contact you within 24 business hours.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3 style={{ fontSize: 20 }}>Book Free UK Consultation</h3>
                  <p style={{ color: "var(--on-surface-variant)", fontSize: 13, lineHeight: 1.5 }}>
                    Connect with a mortgage specialist to get real broker-only fixed rates, custom SDLT reliefs, and a tailored lending illustration.
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="input-field-wrapper">
                    <label className="input-label" htmlFor="lead-name">Full Name</label>
                    <input 
                      id="lead-name"
                      type="text" 
                      required 
                      className="numeric-input" 
                      placeholder="e.g. Alex Mercer"
                      style={{ paddingLeft: 12 }}
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                    />
                  </div>

                  <div className="input-field-wrapper">
                    <label className="input-label" htmlFor="lead-email">Email Address</label>
                    <input 
                      id="lead-email"
                      type="email" 
                      required 
                      className="numeric-input" 
                      placeholder="alex@example.com"
                      style={{ paddingLeft: 12 }}
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                    />
                  </div>

                  <div className="input-field-wrapper">
                    <label className="input-label" htmlFor="lead-phone">Phone Number (Optional)</label>
                    <input 
                      id="lead-phone"
                      type="tel" 
                      className="numeric-input" 
                      placeholder="07123 456789"
                      style={{ paddingLeft: 12 }}
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="cta-button" style={{ width: "100%", marginTop: 8 }}>
                    Submit Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
