// App.js - Dashboard interactivity & Chart.js orchestration

// Global Chart Instances
let revenueChartInstance = null;
let profitabilityChartInstance = null;
let allocationChartInstance = null;

// Currency & Studio States
let currentStudio = 'ALL';
let currentCurrencyMode = 'EUR'; // 'EUR' or 'LOCAL'

// Base Themes & Colors
const studioColors = {
    "Banijay Group": { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.25)" },
    "Fremantle": { border: "#a855f7", bg: "rgba(168, 85, 247, 0.25)" },
    "ITV Studios": { border: "#eab308", bg: "rgba(234, 179, 8, 0.25)" },
    "BBC Studios": { border: "#ef4444", bg: "rgba(239, 68, 68, 0.25)" },
    "Mediawan": { border: "#10b981", bg: "rgba(16, 185, 129, 0.25)" },
    "All3Media": { border: "#f97316", bg: "rgba(249, 115, 22, 0.25)" }
};

// Japanese translations for Axis A segments
const segmentNamesJp = {
    "Work-for-Hire": "受託制作",
    "Owned IP": "自社IP",
    "Catalog & Format": "カタログ＆フォーマット"
};

const segmentColors = {
    "Work-for-Hire": { border: "#0ea5e9", bg: "rgba(14, 165, 233, 0.4)" },      // Safe steady
    "Owned IP": { border: "#ec4899", bg: "rgba(236, 72, 153, 0.4)" },           // Risk-taking
    "Catalog & Format": { border: "#10b981", bg: "rgba(16, 185, 129, 0.4)" }   // High margin IP distribution
};

// Main DOM Elements
const companySelector = document.getElementById('company-selector');
const currencyEurBtn = document.getElementById('currency-eur');
const currencyLocalBtn = document.getElementById('currency-local');

const valRev = document.getElementById('val-rev');
const subRev = document.getElementById('sub-rev');
const valMargin = document.getElementById('val-margin');
const subMargin = document.getElementById('sub-margin');
const valCagr = document.getElementById('val-cagr');
const subCagr = document.getElementById('sub-cagr');
const valRisk = document.getElementById('val-risk');
const subRisk = document.getElementById('sub-risk');
const timelineContainer = document.getElementById('timeline-container');

// Helper to dynamically get the active currency symbol based on global states
function getActiveCurrencySymbol(data) {
    const isEur = currentCurrencyMode === 'EUR';
    if (isEur) return '€';
    if (currentStudio === 'ALL') return '€';
    
    // Fallback to record Currency
    const record = (data && data.length > 0) ? data[0] : null;
    if (record && record.Currency === 'GBP') {
        return '£';
    }
    return '€';
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateDashboard();
});

function setupEventListeners() {
    companySelector.addEventListener('change', (e) => {
        currentStudio = e.target.value;
        
        // If ALL studios is selected, force EUR mode because combining currencies is invalid
        if (currentStudio === 'ALL') {
            currentCurrencyMode = 'EUR';
            currencyEurBtn.classList.add('active');
            currencyLocalBtn.classList.remove('active');
            currencyLocalBtn.disabled = true;
            currencyLocalBtn.style.opacity = '0.4';
            currencyLocalBtn.style.cursor = 'not-allowed';
        } else {
            currencyLocalBtn.disabled = false;
            currencyLocalBtn.style.opacity = '1';
            currencyLocalBtn.style.cursor = 'pointer';
        }
        
        updateDashboard();
    });

    currencyEurBtn.addEventListener('click', () => {
        if (currentCurrencyMode !== 'EUR') {
            currentCurrencyMode = 'EUR';
            currencyEurBtn.classList.add('active');
            currencyLocalBtn.classList.remove('active');
            updateDashboard();
        }
    });

    currencyLocalBtn.addEventListener('click', () => {
        if (currentStudio === 'ALL') return; // Cannot select local for all studios
        if (currentCurrencyMode !== 'LOCAL') {
            currentCurrencyMode = 'LOCAL';
            currencyLocalBtn.classList.add('active');
            currencyEurBtn.classList.remove('active');
            updateDashboard();
        }
    });
}

// Compute metrics, render graphs, and build remarks timeline
function updateDashboard() {
    const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    let filteredData = [];
    
    if (currentStudio === 'ALL') {
        // Aggregate all studio records per year
        years.forEach(year => {
            const yearRecords = STUDIO_DATA.filter(d => d.Year === year);
            let totRev = 0, totProfit = 0, workHire = 0, ownedIp = 0, catalog = 0;
            
            yearRecords.forEach(r => {
                totRev += r["Total Revenue (EUR)"];
                totProfit += r["Operating Profit (EUR)"];
                workHire += r["Work-for-Hire (EUR)"];
                ownedIp += r["Owned IP (EUR)"];
                catalog += r["Catalog & Format (EUR)"];
            });

            filteredData.push({
                Year: year,
                Company: "Consolidated",
                "Total Revenue (EUR)": totRev,
                "Operating Profit (EUR)": totProfit,
                "Operating Margin (%)": totRev > 0 ? (totProfit / totRev) * 100 : 0,
                "Work-for-Hire (EUR)": workHire,
                "Owned IP (EUR)": ownedIp,
                "Catalog & Format (EUR)": catalog,
                "M&A Remark": "",
                "Data Status (Revenue/Profit)": "Actual",
                "Axis A Valuation Method": "Scenario-based Allocation (想定値)"
            });
        });
    } else {
        filteredData = STUDIO_DATA.filter(d => d.Company === currentStudio);
    }

    // Update KPI Card numbers
    updateKPIs(filteredData);

    // Build timeline
    buildTimeline();

    // Render charts
    renderRevenueChart(filteredData, years);
    renderProfitabilityChart(filteredData, years);
    renderAllocationChart(filteredData, years);
}

function updateKPIs(data) {
    const latest = data.find(d => d.Year === 2025) || data[data.length - 1];
    const earliest = data.find(d => d.Year === 2015) || data[0];
    
    const isEur = currentCurrencyMode === 'EUR';
    const currencySymbol = getActiveCurrencySymbol(data);
    const displayCurrencyName = isEur ? 'ユーロ' : (latest && latest.Currency === 'GBP' ? '英ポンド' : 'ユーロ');

    // 1. Revenue KPI
    const revValKey = isEur ? "Total Revenue (EUR)" : "Total Revenue (Local)";
    const rev2025 = latest[revValKey];
    valRev.textContent = `${currencySymbol}${Math.round(rev2025).toLocaleString()}M`;
    subRev.textContent = currentStudio === 'ALL' ? `全社合算（${displayCurrencyName}）` : `年間総売上高（${displayCurrencyName}）`;

    // 2. Margin KPI
    const margin2025 = latest["Operating Margin (%)"];
    valMargin.textContent = `${Math.round(margin2025)}%`;
    const labelProfitType = (currentStudio === 'Banijay Group' || currentStudio === 'Mediawan' || currentStudio === 'BBC Studios' || currentStudio === 'All3Media' || currentStudio === 'Fremantle') ? 'EBITDAマージン' : 'EBITマージン';
    subMargin.textContent = `${labelProfitType}（2025年度）`;

    // 3. CAGR KPI
    const rev2015 = earliest[revValKey];
    if (rev2015 > 0) {
        const cagr = (Math.pow(rev2025 / rev2015, 1 / 10) - 1) * 100;
        valCagr.textContent = `${cagr > 0 ? '+' : ''}${Math.round(cagr)}%`;
    } else {
        valCagr.textContent = 'N/A';
    }
    subCagr.textContent = "10年間の年平均成長率 (2015-2025)";

    // 4. Low-Risk Share
    const lowRiskRev = latest["Work-for-Hire (EUR)"] + latest["Catalog & Format (EUR)"];
    const totalRevEur = latest["Total Revenue (EUR)"];
    const lowRiskPercent = totalRevEur > 0 ? (lowRiskRev / totalRevEur) * 100 : 0;
    
    valRisk.textContent = `${Math.round(lowRiskPercent)}%`;
    subRisk.textContent = `受託とカタログ配給の合算比率`;
}

function renderRevenueChart(data, years) {
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    const ctx = document.getElementById('revenue-chart').getContext('2d');
    const isEur = currentCurrencyMode === 'EUR';

    let datasets = [];

    if (currentStudio === 'ALL') {
        // Line datasets for each of the 6 studios in EUR
        const studios = ["Banijay Group", "Fremantle", "ITV Studios", "BBC Studios", "Mediawan", "All3Media"];
        
        datasets = studios.map(studioName => {
            const studioData = STUDIO_DATA.filter(d => d.Company === studioName);
            const dataPoints = years.map(yr => {
                const rec = studioData.find(d => d.Year === yr);
                return rec ? rec["Total Revenue (EUR)"] : 0;
            });

            return {
                label: studioName,
                data: dataPoints,
                borderColor: studioColors[studioName].border,
                backgroundColor: studioColors[studioName].bg,
                borderWidth: 2,
                fill: true,
                tension: 0.25
            };
        });
    } else {
        // Business Model segment splits (Work-for-Hire, Owned IP, Catalog) for the selected studio
        const segments = ["Work-for-Hire", "Owned IP", "Catalog & Format"];
        
        datasets = segments.map(segment => {
            const dataPoints = years.map(yr => {
                const rec = data.find(d => d.Year === yr);
                if (!rec) return 0;
                
                // Get allocation ratio
                const totalEur = rec["Total Revenue (EUR)"];
                const segEur = rec[`${segment} (EUR)`];
                const ratio = totalEur > 0 ? segEur / totalEur : 0;
                
                // Project ratio onto the selected currency value
                const displayTotal = isEur ? rec["Total Revenue (EUR)"] : rec["Total Revenue (Local)"];
                return parseFloat((displayTotal * ratio).toFixed(2));
            });

            return {
                label: segmentNamesJp[segment],
                data: dataPoints,
                borderColor: segmentColors[segment].border,
                backgroundColor: segmentColors[segment].bg,
                borderWidth: 2,
                fill: true,
                tension: 0.2
            };
        });
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', weight: 600 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 20, 38, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                const symbol = getActiveCurrencySymbol(data);
                                label += symbol + Math.round(context.parsed.y).toLocaleString() + 'M';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Space Grotesk' } }
                },
                y: {
                    stacked: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Space Grotesk' },
                        callback: function(value) {
                            const symbol = getActiveCurrencySymbol(data);
                            return symbol + value + 'M';
                        }
                    }
                }
            }
        }
    });
}

function renderProfitabilityChart(data, years) {
    if (profitabilityChartInstance) {
        profitabilityChartInstance.destroy();
    }

    const ctx = document.getElementById('profitability-chart').getContext('2d');
    const isEur = currentCurrencyMode === 'EUR';

    // Prepare profit and margin datasets
    const profitKey = isEur ? "Operating Profit (EUR)" : "Operating Profit (Local)";
    const profitData = years.map(yr => {
        const rec = data.find(d => d.Year === yr);
        return rec ? rec[profitKey] : 0;
    });

    const marginData = years.map(yr => {
        const rec = data.find(d => d.Year === yr);
        return rec ? rec["Operating Margin (%)"] : 0;
    });

    const labelProfitType = (currentStudio === 'Banijay Group' || currentStudio === 'Mediawan' || currentStudio === 'BBC Studios' || currentStudio === 'All3Media' || currentStudio === 'Fremantle') ? 'EBITDA' : '営業利益 (EBIT/EBITDA)';
    const displayCurrencyName = isEur ? 'EUR' : (currentStudio === 'ALL' ? 'EUR' : (data[0] ? data[0].Currency : 'EUR'));

    profitabilityChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: `${labelProfitType} (${displayCurrencyName})`,
                    data: profitData,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: '#3b82f6',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: '営業利益率 (%)',
                    data: marginData,
                    type: 'line',
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#a855f7',
                    pointBorderColor: '#ffffff',
                    pointHoverRadius: 7,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', weight: 600 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 20, 38, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                const symbol = getActiveCurrencySymbol(data);
                                label += symbol + Math.round(context.parsed.y).toLocaleString() + 'M';
                            } else {
                                label += context.parsed.y.toFixed(1) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Space Grotesk' } }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Space Grotesk' },
                        callback: function(value) {
                            const symbol = getActiveCurrencySymbol(data);
                            return symbol + value + 'M';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false }, // Avoid duplicate lines
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Space Grotesk' },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    min: 0,
                    max: Math.max(...marginData) > 25 ? 40 : 25
                }
            }
        }
    });
}

function renderAllocationChart(data, years) {
    if (allocationChartInstance) {
        allocationChartInstance.destroy();
    }

    const ctx = document.getElementById('model-allocation-chart').getContext('2d');
    const segments = ["Work-for-Hire", "Owned IP", "Catalog & Format"];
    const isEur = currentCurrencyMode === 'EUR';

    const datasets = segments.map(segment => {
        // Map percentages
        const percentageDataPoints = years.map(yr => {
            const rec = data.find(d => d.Year === yr);
            if (!rec) return 0;
            
            const totalEur = rec["Total Revenue (EUR)"];
            const segEur = rec[`${segment} (EUR)`];
            return totalEur > 0 ? parseFloat(((segEur / totalEur) * 100).toFixed(1)) : 0;
        });

        // Store corresponding absolute value for custom tooltip display
        const absoluteDataPoints = years.map(yr => {
            const rec = data.find(d => d.Year === yr);
            if (!rec) return 0;
            
            const totalEur = rec["Total Revenue (EUR)"];
            const segEur = rec[`${segment} (EUR)`];
            const ratio = totalEur > 0 ? segEur / totalEur : 0;
            
            const displayTotal = isEur ? rec["Total Revenue (EUR)"] : rec["Total Revenue (Local)"];
            return parseFloat((displayTotal * ratio).toFixed(1));
        });

        return {
            label: segmentNamesJp[segment],
            data: percentageDataPoints,
            absData: absoluteDataPoints, // Custom parameter to store absolute values
            backgroundColor: segmentColors[segment].bg,
            borderColor: segmentColors[segment].border,
            borderWidth: 1.5,
            fill: true
        };
    });

    allocationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', weight: 600 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 20, 38, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const dataset = context.dataset;
                            const percentVal = context.parsed.y;
                            const absVal = dataset.absData[context.dataIndex];
                            const symbol = getActiveCurrencySymbol(data);
                            return `${dataset.label}: ${percentVal.toFixed(1)}% (${symbol}${Math.round(absVal).toLocaleString()}M)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Space Grotesk' } }
                },
                y: {
                    stacked: true,
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Space Grotesk' },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function buildTimeline() {
    timelineContainer.innerHTML = '';
    const legendContainer = document.getElementById('timeline-legend');
    
    let events = [];
    
    if (currentStudio === 'ALL') {
        // Collect all non-empty remarks across all studios
        STUDIO_DATA.forEach(d => {
            if (d["M&A Remark"] && d["M&A Remark"].trim() !== "") {
                events.push({
                    Year: d.Year,
                    Company: d.Company,
                    Remark: d["M&A Remark"]
                });
            }
        });
        
        // Render dynamic legends for ALL studios
        legendContainer.innerHTML = Object.keys(studioColors).map(company => `
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-family: var(--font-sans); font-weight: 600; color: var(--text-secondary);">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${studioColors[company].border}; display: inline-block; box-shadow: 0 0 6px ${studioColors[company].border}"></span>
                ${company}
            </span>
        `).join('');
    } else {
        const studioRecords = STUDIO_DATA.filter(d => d.Company === currentStudio);
        studioRecords.forEach(d => {
            if (d["M&A Remark"] && d["M&A Remark"].trim() !== "") {
                events.push({
                    Year: d.Year,
                    Company: d.Company,
                    Remark: d["M&A Remark"]
                });
            }
        });
        
        // Hide legend when viewing single studio
        legendContainer.innerHTML = '';
    }

    // Sort chronologically in descending order (latest first)
    events.sort((a, b) => b.Year - a.Year);

    if (events.length === 0) {
        timelineContainer.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-text" style="color: var(--text-muted); font-style: italic; width: 100%; text-align: center; padding: 2rem 0;">
                    選択された条件に関する主要なM&A・組織再編イベントはありません。
                </div>
            </div>
        `;
        return;
    }

    events.forEach(ev => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const companyBadge = currentStudio === 'ALL' 
            ? `<span class="badge company-badge" style="color: ${studioColors[ev.Company].border}; background: ${studioColors[ev.Company].bg}; border-color: rgba(255,255,255,0.05);">${ev.Company}</span>` 
            : '';

        timelineItem.innerHTML = `
            <div class="timeline-year">${ev.Year}</div>
            <div class="timeline-content">
                ${companyBadge}
                <div class="timeline-text">${ev.Remark}</div>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}
