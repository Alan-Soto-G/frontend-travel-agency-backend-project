export interface FormField {
  name: string;       // Field name
  label: string;      // Display label
  type: string;       // Input type (text, number, email, select, etc.)
  required?: boolean; // Is field required?
  pattern?: string;   // Validation pattern
  placeholder?: string; // Placeholder text
  min?: number;       // Min value
  max?: number;       // Max value
  options?: { value: string; text: string }[]; // Options for select fields
}
