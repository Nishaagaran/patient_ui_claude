import { useState } from "react";
import {
  analyseBMI,
  analyseBloodPressure,
  analyseGlucose,
  overallStatus,
} from "./utils/healthAnalyser";
import "./App.css";

const STATUS_CONFIG = {
  healthy: { color: "#16a34a", bg: "#f0fdf4", border: "#86efac", label: "Healthy",  icon: "✓" },
  risk:    { color: "#d97706", bg: "#fffbeb", border: "#fcd34d", label: "At Risk",   icon: "!" },
  critical:{ color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", label: "Critical",  icon: "✕" },
};

function StatusBadge({ status }) {
  if (!status) return null;
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function MetricCard({ title, value, unit, result }) {
  const cfg = result ? STATUS_CONFIG[result.status] : null;
  return (
    <div className="metric-card" style={cfg ? { borderColor: cfg.border, background: cfg.bg } : {}}>
      <div className="metric-title">{title}</div>
      <div className="metric-value">
        {value} <span className="metric-unit">{unit}</span>
      </div>
      {result && (
        <div className="metric-result" style={{ color: cfg.color }}>
          <span>{cfg.icon}</span> {result.label}
        </div>
      )}
    </div>
  );
}

const EMPTY = { bmi: "", systolic: "", diastolic: "", glucose: "" };

export default function App() {
  const [form, setForm] = useState(EMPTY);
  const [patientName, setPatientName] = useState("");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.bmi || isNaN(form.bmi) || Number(form.bmi) <= 0) e.bmi = "Enter a valid BMI (e.g. 22.5)";
    if (!form.systolic || isNaN(form.systolic) || Number(form.systolic) <= 0) e.systolic = "Enter systolic BP";
    if (!form.diastolic || isNaN(form.diastolic) || Number(form.diastolic) <= 0) e.diastolic = "Enter diastolic BP";
    if (!form.glucose || isNaN(form.glucose) || Number(form.glucose) <= 0) e.glucose = "Enter a valid glucose level";
    return e;
  }

  function handleAnalyse() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const bmi     = analyseBMI(form.bmi);
    const bp      = analyseBloodPressure(form.systolic, form.diastolic);
    const glucose = analyseGlucose(form.glucose);
    setResults({ bmi, bp, glucose, overall: overallStatus(bmi, bp, glucose) });
  }

  function handleReset() {
    setForm(EMPTY);
    setPatientName("");
    setResults(null);
    setErrors({});
  }

  const overallCfg = results ? STATUS_CONFIG[results.overall] : null;

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">♥</span>
        <div>
          <h1>Patient Health Analyser</h1>
          <p>Enter patient vitals to assess health status</p>
        </div>
      </header>

      <main className="main">
        {/* ── Input panel ── */}
        <section className="panel">
          <h2 className="panel-title">Patient Details</h2>

          <div className="field">
            <label>Patient Name <span className="optional">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <hr className="divider" />

          <h2 className="panel-title">Vital Measurements</h2>

          <div className="field">
            <label>BMI <span className="unit-hint">kg/m²</span></label>
            <input
              type="number"
              placeholder="e.g. 22.5"
              value={form.bmi}
              min="1" step="0.1"
              onChange={(e) => setForm({ ...form, bmi: e.target.value })}
            />
            {errors.bmi && <span className="error">{errors.bmi}</span>}
          </div>

          <div className="field">
            <label>Blood Pressure <span className="unit-hint">mmHg</span></label>
            <div className="bp-row">
              <div className="bp-col">
                <input
                  type="number"
                  placeholder="Systolic"
                  value={form.systolic}
                  min="1"
                  onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                />
                <span className="bp-label">Systolic</span>
                {errors.systolic && <span className="error">{errors.systolic}</span>}
              </div>
              <span className="bp-sep">/</span>
              <div className="bp-col">
                <input
                  type="number"
                  placeholder="Diastolic"
                  value={form.diastolic}
                  min="1"
                  onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                />
                <span className="bp-label">Diastolic</span>
                {errors.diastolic && <span className="error">{errors.diastolic}</span>}
              </div>
            </div>
          </div>

          <div className="field">
            <label>Fasting Glucose <span className="unit-hint">mg/dL</span></label>
            <input
              type="number"
              placeholder="e.g. 95"
              value={form.glucose}
              min="1"
              onChange={(e) => setForm({ ...form, glucose: e.target.value })}
            />
            {errors.glucose && <span className="error">{errors.glucose}</span>}
          </div>

          <div className="button-row">
            <button className="btn-primary" onClick={handleAnalyse}>Analyse Health</button>
            <button className="btn-secondary" onClick={handleReset}>Reset</button>
          </div>

          <div className="reference">
            <h4>Reference Ranges</h4>
            <table className="ref-table">
              <tbody>
                <tr><td>BMI</td><td>18.5 – 24.9 Normal</td><td>≥ 30 Obese</td></tr>
                <tr><td>BP</td><td>&lt;120/80 Normal</td><td>≥140/90 High</td></tr>
                <tr><td>Glucose</td><td>70 – 99 Normal</td><td>≥126 Diabetes</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Dashboard panel ── */}
        <section className="panel dashboard">
          <h2 className="panel-title">Health Dashboard</h2>

          {!results ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Enter patient vitals and click <strong>Analyse Health</strong> to view the dashboard.</p>
            </div>
          ) : (
            <>
              {/* Overall status banner */}
              <div
                className="overall-banner"
                style={{ background: overallCfg.bg, border: `2px solid ${overallCfg.border}` }}
              >
                <div className="overall-icon" style={{ color: overallCfg.color }}>{overallCfg.icon}</div>
                <div>
                  <div className="overall-label">Overall Status</div>
                  <div className="overall-status" style={{ color: overallCfg.color }}>
                    {patientName && <>{patientName} — </>}{overallCfg.label}
                  </div>
                </div>
              </div>

              {/* Metric cards */}
              <div className="metrics-grid">
                <MetricCard title="BMI" value={form.bmi} unit="kg/m²" result={results.bmi} />
                <MetricCard
                  title="Blood Pressure"
                  value={`${form.systolic}/${form.diastolic}`}
                  unit="mmHg"
                  result={results.bp}
                />
                <MetricCard title="Fasting Glucose" value={form.glucose} unit="mg/dL" result={results.glucose} />
              </div>

              {/* Summary table */}
              <div className="summary-section">
                <h3>Analysis Summary</h3>
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>BMI</td>
                      <td>{form.bmi} kg/m²</td>
                      <td>{results.bmi?.label}</td>
                      <td><StatusBadge status={results.bmi?.status} /></td>
                    </tr>
                    <tr>
                      <td>Blood Pressure</td>
                      <td>{form.systolic}/{form.diastolic} mmHg</td>
                      <td>{results.bp?.label}</td>
                      <td><StatusBadge status={results.bp?.status} /></td>
                    </tr>
                    <tr>
                      <td>Fasting Glucose</td>
                      <td>{form.glucose} mg/dL</td>
                      <td>{results.glucose?.label}</td>
                      <td><StatusBadge status={results.glucose?.status} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recommendation */}
              <div
                className="recommendation"
                style={{ borderLeft: `4px solid ${overallCfg.color}`, background: overallCfg.bg }}
              >
                <strong style={{ color: overallCfg.color }}>Recommendation: </strong>
                {results.overall === "healthy" &&
                  "All vitals are within normal ranges. Continue maintaining a healthy lifestyle with regular checkups."}
                {results.overall === "risk" &&
                  "One or more vitals are borderline. Lifestyle changes are advised. Please consult a physician soon."}
                {results.overall === "critical" &&
                  "One or more vitals are in a critical range. Immediate medical attention is strongly recommended."}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
