export interface FormField {
  name: string;       // Field name
  label: string;      // Display label
  type: string;       // Input type (text, number, email, etc.)
  required?: boolean; // Is field required?
  pattern?: string;   // Validation pattern
  placeholder?: string; // Placeholder text
  min?: number;       // Min value
  max?: number;       // Max value
}
