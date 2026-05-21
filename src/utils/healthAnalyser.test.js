import { describe, it, expect } from "vitest";
import {
  analyseBMI,
  analyseBloodPressure,
  analyseGlucose,
  overallStatus,
} from "./healthAnalyser";

// ─── analyseBMI ────────────────────────────────────────────────────────────

describe("analyseBMI", () => {
  describe("invalid input", () => {
    it("returns null for non-numeric string", () => {
      expect(analyseBMI("abc")).toBeNull();
    });
    it("returns null for empty string", () => {
      expect(analyseBMI("")).toBeNull();
    });
    it("returns null for undefined", () => {
      expect(analyseBMI(undefined)).toBeNull();
    });
  });

  describe("Underweight (BMI < 18.5) → risk", () => {
    it("classifies BMI 10 as Underweight / risk", () => {
      expect(analyseBMI(10)).toEqual({ label: "Underweight", status: "risk" });
    });
    it("classifies BMI 18.4 as Underweight / risk", () => {
      expect(analyseBMI(18.4)).toEqual({ label: "Underweight", status: "risk" });
    });
  });

  describe("Normal (18.5 – 24.9) → healthy", () => {
    it("classifies BMI 18.5 as Normal / healthy (lower boundary)", () => {
      expect(analyseBMI(18.5)).toEqual({ label: "Normal", status: "healthy" });
    });
    it("classifies BMI 22 as Normal / healthy", () => {
      expect(analyseBMI(22)).toEqual({ label: "Normal", status: "healthy" });
    });
    it("classifies BMI 24.9 as Normal / healthy (upper boundary)", () => {
      expect(analyseBMI(24.9)).toEqual({ label: "Normal", status: "healthy" });
    });
  });

  describe("Overweight (25 – 29.9) → risk", () => {
    it("classifies BMI 25 as Overweight / risk (lower boundary)", () => {
      expect(analyseBMI(25)).toEqual({ label: "Overweight", status: "risk" });
    });
    it("classifies BMI 27 as Overweight / risk", () => {
      expect(analyseBMI(27)).toEqual({ label: "Overweight", status: "risk" });
    });
    it("classifies BMI 29.9 as Overweight / risk (upper boundary)", () => {
      expect(analyseBMI(29.9)).toEqual({ label: "Overweight", status: "risk" });
    });
  });

  describe("Obese (≥ 30) → critical", () => {
    it("classifies BMI 30 as Obese / critical (boundary)", () => {
      expect(analyseBMI(30)).toEqual({ label: "Obese", status: "critical" });
    });
    it("classifies BMI 40 as Obese / critical", () => {
      expect(analyseBMI(40)).toEqual({ label: "Obese", status: "critical" });
    });
  });
});

// ─── analyseBloodPressure ──────────────────────────────────────────────────

describe("analyseBloodPressure", () => {
  describe("invalid input", () => {
    it("returns null when systolic is non-numeric", () => {
      expect(analyseBloodPressure("abc", 80)).toBeNull();
    });
    it("returns null when diastolic is non-numeric", () => {
      expect(analyseBloodPressure(120, "abc")).toBeNull();
    });
    it("returns null when both values are missing", () => {
      expect(analyseBloodPressure("", "")).toBeNull();
    });
  });

  describe("Normal (systolic < 120 AND diastolic < 80) → healthy", () => {
    it("classifies 110/70 as Normal / healthy", () => {
      expect(analyseBloodPressure(110, 70)).toEqual({ label: "Normal", status: "healthy" });
    });
    it("classifies 119/79 as Normal / healthy (upper boundary)", () => {
      expect(analyseBloodPressure(119, 79)).toEqual({ label: "Normal", status: "healthy" });
    });
  });

  describe("Elevated (systolic 120–129, diastolic < 80) → risk", () => {
    it("classifies 120/75 as Elevated / risk (lower sys boundary)", () => {
      expect(analyseBloodPressure(120, 75)).toEqual({ label: "Elevated", status: "risk" });
    });
    it("classifies 125/70 as Elevated / risk", () => {
      expect(analyseBloodPressure(125, 70)).toEqual({ label: "Elevated", status: "risk" });
    });
    it("classifies 129/79 as Elevated / risk (upper boundary)", () => {
      expect(analyseBloodPressure(129, 79)).toEqual({ label: "Elevated", status: "risk" });
    });
  });

  describe("High Stage 1 (systolic 130–139 OR diastolic 80–89) → risk", () => {
    it("classifies 130/85 as High Stage 1 / risk (lower sys boundary)", () => {
      expect(analyseBloodPressure(130, 85)).toEqual({ label: "High Stage 1", status: "risk" });
    });
    it("classifies 135/88 as High Stage 1 / risk", () => {
      expect(analyseBloodPressure(135, 88)).toEqual({ label: "High Stage 1", status: "risk" });
    });
    it("classifies 139/89 as High Stage 1 / risk (upper boundary)", () => {
      expect(analyseBloodPressure(139, 89)).toEqual({ label: "High Stage 1", status: "risk" });
    });
    it("classifies 115/80 as High Stage 1 / risk (diastolic only elevated)", () => {
      expect(analyseBloodPressure(115, 80)).toEqual({ label: "High Stage 1", status: "risk" });
    });
  });

  describe("High Stage 2 (systolic ≥ 140 OR diastolic ≥ 90) → critical", () => {
    it("classifies 140/90 as High Stage 2 / critical (boundary)", () => {
      expect(analyseBloodPressure(140, 90)).toEqual({ label: "High Stage 2", status: "critical" });
    });
    it("classifies 160/100 as High Stage 2 / critical", () => {
      expect(analyseBloodPressure(160, 100)).toEqual({ label: "High Stage 2", status: "critical" });
    });
    it("classifies 180/120 as High Stage 2 / critical (upper boundary before crisis)", () => {
      expect(analyseBloodPressure(180, 120)).toEqual({ label: "High Stage 2", status: "critical" });
    });
  });

  describe("Hypertensive Crisis (systolic > 180 OR diastolic > 120) → critical", () => {
    it("classifies 181/110 as Hypertensive Crisis / critical (sys > 180)", () => {
      expect(analyseBloodPressure(181, 110)).toEqual({ label: "Hypertensive Crisis", status: "critical" });
    });
    it("classifies 170/121 as Hypertensive Crisis / critical (dia > 120)", () => {
      expect(analyseBloodPressure(170, 121)).toEqual({ label: "Hypertensive Crisis", status: "critical" });
    });
    it("classifies 200/130 as Hypertensive Crisis / critical", () => {
      expect(analyseBloodPressure(200, 130)).toEqual({ label: "Hypertensive Crisis", status: "critical" });
    });
  });
});

// ─── analyseGlucose ───────────────────────────────────────────────────────

describe("analyseGlucose", () => {
  describe("invalid input", () => {
    it("returns null for non-numeric string", () => {
      expect(analyseGlucose("xyz")).toBeNull();
    });
    it("returns null for empty string", () => {
      expect(analyseGlucose("")).toBeNull();
    });
  });

  describe("Hypoglycemia (< 70) → critical", () => {
    it("classifies glucose 40 as Hypoglycemia / critical", () => {
      expect(analyseGlucose(40)).toEqual({ label: "Hypoglycemia", status: "critical" });
    });
    it("classifies glucose 69 as Hypoglycemia / critical (boundary)", () => {
      expect(analyseGlucose(69)).toEqual({ label: "Hypoglycemia", status: "critical" });
    });
  });

  describe("Normal (70 – 99) → healthy", () => {
    it("classifies glucose 70 as Normal / healthy (lower boundary)", () => {
      expect(analyseGlucose(70)).toEqual({ label: "Normal", status: "healthy" });
    });
    it("classifies glucose 85 as Normal / healthy", () => {
      expect(analyseGlucose(85)).toEqual({ label: "Normal", status: "healthy" });
    });
    it("classifies glucose 99 as Normal / healthy (upper boundary)", () => {
      expect(analyseGlucose(99)).toEqual({ label: "Normal", status: "healthy" });
    });
  });

  describe("Prediabetes (100 – 125) → risk", () => {
    it("classifies glucose 100 as Prediabetes / risk (lower boundary)", () => {
      expect(analyseGlucose(100)).toEqual({ label: "Prediabetes", status: "risk" });
    });
    it("classifies glucose 112 as Prediabetes / risk", () => {
      expect(analyseGlucose(112)).toEqual({ label: "Prediabetes", status: "risk" });
    });
    it("classifies glucose 125 as Prediabetes / risk (upper boundary)", () => {
      expect(analyseGlucose(125)).toEqual({ label: "Prediabetes", status: "risk" });
    });
  });

  describe("Diabetes Range (≥ 126) → critical", () => {
    it("classifies glucose 126 as Diabetes Range / critical (boundary)", () => {
      expect(analyseGlucose(126)).toEqual({ label: "Diabetes Range", status: "critical" });
    });
    it("classifies glucose 200 as Diabetes Range / critical", () => {
      expect(analyseGlucose(200)).toEqual({ label: "Diabetes Range", status: "critical" });
    });
  });
});

// ─── overallStatus ────────────────────────────────────────────────────────

describe("overallStatus", () => {
  const healthy  = { label: "Normal",     status: "healthy"  };
  const risk     = { label: "Overweight", status: "risk"     };
  const critical = { label: "Obese",      status: "critical" };

  it("returns 'healthy' when all three metrics are healthy", () => {
    expect(overallStatus(healthy, healthy, healthy)).toBe("healthy");
  });

  it("returns 'risk' when any metric is risk and none is critical", () => {
    expect(overallStatus(healthy, risk, healthy)).toBe("risk");
    expect(overallStatus(risk, healthy, healthy)).toBe("risk");
    expect(overallStatus(healthy, healthy, risk)).toBe("risk");
    expect(overallStatus(risk, risk, risk)).toBe("risk");
  });

  it("returns 'critical' when any metric is critical", () => {
    expect(overallStatus(critical, healthy, healthy)).toBe("critical");
    expect(overallStatus(healthy, critical, healthy)).toBe("critical");
    expect(overallStatus(healthy, healthy, critical)).toBe("critical");
  });

  it("returns 'critical' even when other metrics are risk or healthy", () => {
    expect(overallStatus(critical, risk, healthy)).toBe("critical");
    expect(overallStatus(risk, healthy, critical)).toBe("critical");
  });

  it("returns null when all inputs are null (no valid readings)", () => {
    expect(overallStatus(null, null, null)).toBeNull();
  });

  it("returns correct status with partial null inputs", () => {
    expect(overallStatus(healthy, null, null)).toBe("healthy");
    expect(overallStatus(null, risk, null)).toBe("risk");
    expect(overallStatus(null, null, critical)).toBe("critical");
  });
});
