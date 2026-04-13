export type HeartMeasurementSchemaEntry = {
  label: string;
  unit: string;
  referenceRange: string;
  description: string;
  statusMode?: "range" | "categorical";
};

export const HEART_MEASUREMENT_SCHEMA: Record<string, HeartMeasurementSchemaEntry> = {
  cp: {
    label: "cp (Chest Pain Type)",
    unit: "score",
    referenceRange: "0-3",
    description: "Categorical chest pain classification used in clinical assessment.",
    statusMode: "categorical",
  },
  trestbps: {
    label: "trestbps (Resting Blood Pressure)",
    unit: "mmHg",
    referenceRange: "90-120",
    description: "Blood pressure measured at rest; higher values may indicate hypertension.",
  },
  chol: {
    label: "chol (Serum Cholesterol)",
    unit: "mg/dL",
    referenceRange: "< 200",
    description: "Total cholesterol level in blood; lower is generally healthier.",
  },
  fbs: {
    label: "fbs (Fasting Blood Sugar)",
    unit: "score",
    referenceRange: "0-1",
    description: "Binary indicator of fasting blood sugar being above 120 mg/dL.",
    statusMode: "categorical",
  },
  restecg: {
    label: "restecg (Resting ECG Results)",
    unit: "score",
    referenceRange: "0-2",
    description: "Categorical summary of resting electrocardiogram findings.",
    statusMode: "categorical",
  },
  thalach: {
    label: "thalach (Maximum Heart Rate Achieved)",
    unit: "bpm",
    referenceRange: "100-200",
    description: "Highest heart rate recorded during exercise testing.",
  },
  exang: {
    label: "exang (Exercise-Induced Angina)",
    unit: "score",
    referenceRange: "0-1",
    description: "Binary indicator of angina triggered by exercise.",
    statusMode: "categorical",
  },
  oldpeak: {
    label: "oldpeak (ST Depression)",
    unit: "mm",
    referenceRange: "0.0-1.0",
    description: "ST segment depression during exercise relative to rest.",
  },
  slope: {
    label: "slope (ST Segment Slope)",
    unit: "score",
    referenceRange: "0-2",
    description: "Categorical slope of the peak exercise ST segment.",
    statusMode: "categorical",
  },
  ca: {
    label: "ca (Number of Major Vessels)",
    unit: "score",
    referenceRange: "0-3",
    description: "Count of major vessels colored by fluoroscopy.",
    statusMode: "categorical",
  },
  thal: {
    label: "thal (Thalassemia Test Result)",
    unit: "score",
    referenceRange: "0-3",
    description: "Categorical thalassemia-related test result used in cardiac assessment.",
    statusMode: "categorical",
  },
};

const FALLBACK_SCORE_UNIT = "score";

const extractKey = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const firstToken = trimmed.split(/\s|\(/)[0].toLowerCase();
  if (HEART_MEASUREMENT_SCHEMA[firstToken]) return firstToken;
  return null;
};

export const getHeartMeasurementSchema = (value?: string | null) => {
  const key = extractKey(value);
  return key ? { key, schema: HEART_MEASUREMENT_SCHEMA[key] } : null;
};

export const resolveHeartMeasurementDefaults = (value?: string | null) => {
  const match = getHeartMeasurementSchema(value);
  if (!match) return null;
  const unit = match.schema.unit?.trim() ? match.schema.unit : FALLBACK_SCORE_UNIT;
  return {
    key: match.key,
    schema: match.schema,
    unit,
    referenceRange: match.schema.referenceRange,
    statusMode: match.schema.statusMode ?? "range",
  };
};
