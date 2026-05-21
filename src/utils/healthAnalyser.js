// BMI: <18.5 underweight, 18.5-24.9 normal, 25-29.9 overweight, >=30 obese
export function analyseBMI(bmi) {
  const val = parseFloat(bmi);
  if (isNaN(val)) return null;
  if (val < 18.5) return { label: "Underweight", status: "risk" };
  if (val <= 24.9) return { label: "Normal", status: "healthy" };
  if (val <= 29.9) return { label: "Overweight", status: "risk" };
  return { label: "Obese", status: "critical" };
}

// BP systolic/diastolic (mmHg)
export function analyseBloodPressure(systolic, diastolic) {
  const s = parseFloat(systolic);
  const d = parseFloat(diastolic);
  if (isNaN(s) || isNaN(d)) return null;
  if (s > 180 || d > 120) return { label: "Hypertensive Crisis", status: "critical" };
  if (s >= 140 || d >= 90) return { label: "High Stage 2", status: "critical" };
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89))
    return { label: "High Stage 1", status: "risk" };
  if (s >= 120 && s <= 129 && d < 80) return { label: "Elevated", status: "risk" };
  if (s < 120 && d < 80) return { label: "Normal", status: "healthy" };
  return { label: "Elevated", status: "risk" };
}

// Fasting glucose (mg/dL)
export function analyseGlucose(glucose) {
  const val = parseFloat(glucose);
  if (isNaN(val)) return null;
  if (val < 70) return { label: "Hypoglycemia", status: "critical" };
  if (val <= 99) return { label: "Normal", status: "healthy" };
  if (val <= 125) return { label: "Prediabetes", status: "risk" };
  return { label: "Diabetes Range", status: "critical" };
}

export function overallStatus(bmiResult, bpResult, glucoseResult) {
  const statuses = [bmiResult, bpResult, glucoseResult]
    .filter(Boolean)
    .map((r) => r.status);
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("risk")) return "risk";
  if (statuses.length > 0) return "healthy";
  return null;
}
