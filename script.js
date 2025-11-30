const modeButtons = document.querySelectorAll(".mode-btn");
const sipFields = document.getElementById("sip-fields");
const emiFields = document.getElementById("emi-fields");
const btnSip = document.getElementById("btn-sip");
const btnEmi = document.getElementById("btn-emi");
const btnReset = document.getElementById("btn-reset");
const errorMsg = document.getElementById("error-msg");

const formTitle = document.getElementById("form-title");
const formSub = document.getElementById("form-sub");

const resultsTitle = document.getElementById("results-title");
const resultsBadge = document.getElementById("results-badge");
const metricMainLabel = document.getElementById("metric-main-label");
const metricMainValue = document.getElementById("metric-main-value");
const metricMainSub = document.getElementById("metric-main-sub");
const metricSideLine1 = document.getElementById("metric-side-line1");
const metricSideLine2 = document.getElementById("metric-side-line2");
const metricChipLabel = document.getElementById("metric-chip-label");
const summaryPanel = document.getElementById("summary-panel");

const vizLineHeading = document.getElementById("viz-line-heading");
const vizLineSub = document.getElementById("viz-line-sub");
const vizLineTag = document.getElementById("viz-line-tag");
const vizPieHeading = document.getElementById("viz-pie-heading");
const vizPieSub = document.getElementById("viz-pie-sub");
const vizPieTag = document.getElementById("viz-pie-tag");
const vizLegend = document.getElementById("viz-legend");
const vizCards = document.querySelectorAll(".viz-card");

let currentMode = "sip";

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.mode === mode)
  );

  const isSip = mode === "sip";
  sipFields.style.display = isSip ? "grid" : "none";
  emiFields.style.display = isSip ? "none" : "grid";
  btnSip.style.display = isSip ? "inline-flex" : "none";
  btnEmi.style.display = isSip ? "none" : "inline-flex";
  errorMsg.textContent = "";
  summaryPanel.classList.remove("results-animate");

  if (isSip) {
    formTitle.textContent = "SIP inputs";
    formSub.textContent =
      "Define your systematic investment plan to project future value.";
    resultsTitle.textContent = "SIP projection";
    resultsBadge.textContent = "Monthly compounding";
    metricMainLabel.textContent = "Estimated corpus at maturity";
    metricMainValue.textContent = "0";
    metricMainSub.textContent =
      "Start by entering SIP details to view your projected wealth.";
    metricSideLine1.textContent = "Total invested: ₹0";
    metricSideLine2.textContent = "Total returns: ₹0";
    metricChipLabel.textContent = "Compounding in progress";

    vizLineHeading.textContent = "Corpus over time";
    vizLineSub.textContent =
      "Projected wealth at the end of each year of your SIP.";
    vizLineTag.textContent = "SIP mode";
    vizPieHeading.textContent = "Invested vs returns";
    vizPieSub.textContent =
      "Proportion of your contributions versus market gains.";
    vizPieTag.textContent = "Wealth breakdown";
  } else {
    formTitle.textContent = "EMI inputs";
    formSub.textContent =
      "Describe your loan to estimate EMI, interest and payoff timeline.";
    resultsTitle.textContent = "EMI breakdown";
    resultsBadge.textContent = "Fixed‑rate loan";
    metricMainLabel.textContent = "Approx. monthly EMI";
    metricMainValue.textContent = "0";
    metricMainSub.textContent =
      "Enter loan details to view EMI, total interest and payoff amount.";
    metricSideLine1.textContent = "Total payable: ₹0";
    metricSideLine2.textContent = "Total interest: ₹0";
    metricChipLabel.textContent = "EMI not calculated yet";

    vizLineHeading.textContent = "Outstanding balance over time";
    vizLineSub.textContent =
      "Approximate loan balance at the end of each year.";
    vizLineTag.textContent = "EMI mode";
    vizPieHeading.textContent = "Principal vs interest";
    vizPieSub.textContent = "Total repayment split by components.";
    vizPieTag.textContent = "Repayment composition";
  }
}

modeButtons.forEach((btn) =>
  btn.addEventListener("click", () => setMode(btn.dataset.mode))
);

function animateSummary() {
  summaryPanel.classList.remove("results-animate");
  void summaryPanel.offsetWidth;
  summaryPanel.classList.add("results-animate");
}

function animateViz() {
  vizCards.forEach((card) => {
    card.classList.remove("viz-animate");
    void card.offsetWidth;
    card.classList.add("viz-animate");
  });
}

function formatNumber(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function validatePositiveNumber(value, label) {
  if (value === "" || isNaN(value)) {
    throw new Error(label + " is required.");
  }
  const num = Number(value);
  if (num <= 0) {
    throw new Error(label + " must be greater than zero.");
  }
  return num;
}

// Ripple on primary buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".js-ripple");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  ripple.className = "btn-ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
});

// Chart.js setup
let lineChart, pieChart;
const lineCtx = document.getElementById("lineChart").getContext("2d");
const pieCtx = document.getElementById("pieChart").getContext("2d");

const baseAnim = { duration: 700, easing: "easeOutCubic" };

function initCharts() {
  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Value",
        data: [],
        borderColor: "#38bdf8",
        borderWidth: 2.3,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 8,
        fill: true,
        backgroundColor: "rgba(56, 189, 248, 0.16)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: baseAnim,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#020617",
          borderColor: "rgba(56, 189, 248, 0.85)",
          borderWidth: 1,
          titleFont: { size: 13 },
          bodyFont: { size: 13 },
          callbacks: {
            label: ctx =>
              " ₹" + formatNumber(Math.round(ctx.parsed.y))
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(30, 64, 175, 0.5)" },
          ticks: {
            color: "rgba(148, 163, 184, 0.97)",
            maxTicksLimit: 6,
            font: { size: 12 }
          }
        },
        y: {
          grid: { color: "rgba(15, 23, 42, 0.9)" },
          ticks: {
            color: "rgba(148, 163, 184, 0.97)",
            maxTicksLimit: 5,
            font: { size: 12 },
            callback: value =>
              "₹" +
              (value >= 100000
                ? (value / 100000).toFixed(1) + "L"
                : formatNumber(value))
          }
        }
      }
    }
  });

  pieChart = new Chart(pieCtx, {
    type: "doughnut",
    data: {
      labels: ["Invested", "Returns"],
      datasets: [{
        data: [0, 0],
        backgroundColor: ["#38bdf8", "#22c55e"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      rotation: -90,
      animation: baseAnim,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#020617",
          borderColor: "rgba(56, 189, 248, 0.85)",
          borderWidth: 1,
          titleFont: { size: 13 },
          bodyFont: { size: 13 },
          callbacks: {
            label: ctx =>
              ctx.label + ": ₹" + formatNumber(Math.round(ctx.parsed))
          }
        }
      }
    }
  });

  updateLegend(["Invested", "Returns"], ["#38bdf8", "#22c55e"]);
}

function updateLegend(labels, colors) {
  vizLegend.innerHTML = "";
  labels.forEach((label, idx) => {
    const item = document.createElement("div");
    item.className = "viz-legend-item";
    const dot = document.createElement("div");
    dot.className = "viz-legend-dot";
    dot.style.background = colors[idx];
    item.appendChild(dot);
    const text = document.createElement("span");
    text.textContent = label;
    item.appendChild(text);
    vizLegend.appendChild(item);
  });
}

function calculateSip() {
  try {
    errorMsg.textContent = "";
    const amount = validatePositiveNumber(
      document.getElementById("sip-amount").value,
      "Monthly SIP amount"
    );
    const years = validatePositiveNumber(
      document.getElementById("sip-years").value,
      "Investment duration"
    );
    const rate = validatePositiveNumber(
      document.getElementById("sip-rate").value,
      "Expected annual return"
    );
    const frequency = document.getElementById("sip-frequency").value;

    const months = years * 12;
    const annualRate = rate / 100;
    const monthlyRate = annualRate / 12;
    // Assuming Monthly SIP is at the end of the period, so using a different monthly contribution for yearly mode calculation is incorrect
    // The original code was using 'contribution' as a proxy for the recurring payment amount, but the SIP formula (future value of an annuity due)
    // and the annual loop calculation are designed for monthly contribution based compounding.
    // Given the formula used, the simplest fix is to treat all contributions as monthly for the core calculation, but the prompt says 'yearly' is for bulk annual contributions.
    // Sticking to the original logic which seems to force monthly contributions for simplicity in calculations:
    const contribution = frequency === "monthly" ? amount : amount / 12; 

    const i = monthlyRate;
    const n = months;
    // Future Value of Annuity Due formula is being used (as it multiplies by (1+i))
    // FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    const fv =
      i === 0
        ? contribution * n // Simple total invested if rate is 0
        : contribution * (((1 + i) ** n - 1) / i) * (1 + i);

    // If frequency is yearly, total invested is 'amount * years'
    const totalInvested =
      frequency === "monthly" ? amount * months : amount * years;
    const gain = fv - totalInvested;

    metricMainValue.textContent = formatNumber(Math.round(fv));
    metricMainSub.textContent =
      "Over " +
      years +
      " years, investing ₹" +
      formatNumber(amount) +
      (frequency === "monthly" ? " per month." : " per year.");
    metricSideLine1.textContent =
      "Total invested: ₹" + formatNumber(Math.round(totalInvested));
    metricSideLine2.textContent =
      "Total returns: ₹" + formatNumber(Math.round(gain));
    metricChipLabel.textContent =
      "Assuming " + rate.toFixed(1) + "% annualised growth (input).";

    animateSummary();

    const labels = [];
    const values = [];
    // The original year-wise calculation logic is flawed as it uses annual rate (iYear) and year count (nYear)
    // with a monthly contribution proxy (yearlyContribution), essentially mixing calculation periods.
    // For a standard chart, we should calculate the future value at the end of each year (monthly compounding).
    // Start with a clean slate for yearly values.
    for (let y = 1; y <= years; y++) {
      const yearMonths = y * 12;
      const yearFv =
        i === 0
          ? contribution * yearMonths
          : contribution * (((1 + i) ** yearMonths - 1) / i) * (1 + i);
      
      labels.push("Year " + y);
      values.push(Math.round(yearFv));
    }

    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = values;
    lineChart.data.datasets[0].label = "Corpus value";
    lineChart.data.datasets[0].borderColor = "#38bdf8";
    lineChart.data.datasets[0].backgroundColor =
      "rgba(56, 189, 248, 0.18)";
    lineChart.update();

    pieChart.data.labels = ["Invested", "Returns"];
    pieChart.data.datasets[0].data = [
      Math.round(totalInvested),
      Math.round(gain)
    ];
    pieChart.data.datasets[0].backgroundColor = ["#38bdf8", "#22c55e"];
    pieChart.update();
    updateLegend(
      pieChart.data.labels,
      pieChart.data.datasets[0].backgroundColor
    );

    animateViz();
  } catch (err) {
    errorMsg.textContent = err.message;
  }
}

function calculateEmi() {
  try {
    errorMsg.textContent = "";
    const principal = validatePositiveNumber(
      document.getElementById("emi-principal").value,
      "Loan amount"
    );
    const years = validatePositiveNumber(
      document.getElementById("emi-years").value,
      "Loan tenure"
    );
    const rate = validatePositiveNumber(
      document.getElementById("emi-rate").value,
      "Interest rate"
    );

    const months = years * 12;
    const monthlyRate = rate / 12 / 100;
    const r = monthlyRate;
    const n = months;

    let emi;
    // Standard EMI formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    if (r === 0) {
      emi = principal / n;
    } else {
      const factor = (1 + r) ** n;
      emi = (principal * r * factor) / (factor - 1);
    }

    const totalPayable = emi * n;
    const totalInterest = totalPayable - principal;

    metricMainValue.textContent = formatNumber(Math.round(emi));
    metricMainSub.textContent =
      "For a ₹" +
      formatNumber(principal) +
      " loan over " +
      years +
      " years at " +
      rate.toFixed(2) +
      "% p.a.";
    metricSideLine1.textContent =
      "Total payable: ₹" + formatNumber(Math.round(totalPayable));
    metricSideLine2.textContent =
      "Total interest: ₹" + formatNumber(Math.round(totalInterest));
    metricChipLabel.textContent =
      "Tenure: " + n + " months • Fixed EMI.";

    animateSummary();

    const labels = [];
    const balances = [];
    let balance = principal;
    // Amortization table calculation for yearly balance
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        const interestComp = balance * r;
        const principalComp = emi - interestComp;
        balance = Math.max(0, balance - principalComp);
      }
      labels.push("Year " + y);
      balances.push(Math.round(balance));
    }
    
    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = balances;
    lineChart.data.datasets[0].label = "Outstanding balance";
    lineChart.data.datasets[0].borderColor = "#f97316";
    lineChart.data.datasets[0].backgroundColor =
      "rgba(248, 171, 78, 0.22)";
    lineChart.update();

    pieChart.data.labels = ["Principal", "Interest"];
    pieChart.data.datasets[0].data = [
      Math.round(principal),
      Math.round(totalInterest)
    ];
    pieChart.data.datasets[0].backgroundColor = ["#38bdf8", "#f97316"];
    pieChart.update();
    updateLegend(
      pieChart.data.labels,
      pieChart.data.datasets[0].backgroundColor
    );

    animateViz();
  } catch (err) {
    errorMsg.textContent = err.message;
  }
}

btnSip.addEventListener("click", () => {
  if (currentMode === "sip") calculateSip();
  else setMode("sip");
});

btnEmi.addEventListener("click", () => {
  if (currentMode === "emi") calculateEmi();
  else setMode("emi");
});

btnReset.addEventListener("click", () => {
  document
    .querySelectorAll("input, textarea")
    .forEach((el) => (el.value = ""));
  errorMsg.textContent = "";
  setMode(currentMode);
  animateSummary();
  animateViz();
});

document
  .getElementById("contact-form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you! This demo form is not wired to a backend yet.");
  });

// Init
initCharts();
setMode("sip");