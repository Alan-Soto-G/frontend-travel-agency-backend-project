export interface FormField {
  name: string;                    // Nombre del campo
  label: string;                   // Etiqueta a mostrar
  type: 'text' | 'number' | 'email' | 'password' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'tel' | 'url'; // Tipo de input
  required?: boolean;              // ¿Es obligatorio?
  pattern?: string;                // Patrón de validación (regex)
  placeholder?: string;            // Texto placeholder
  min?: number;                    // Valor mínimo (para number, date)
  max?: number;                    // Valor máximo (para number, date)
  minLength?: number;              // Longitud mínima (para text, textarea)
  maxLength?: number;              // Longitud máxima (para text, textarea)
  options?: SelectOption[];        // Opciones para campos select
}

/**
 * Interfaz para las opciones de un campo select
 */
export interface SelectOption {
  value: any;                      // Valor del option (puede ser number, string, etc.)
  label: string;                   // Texto a mostrar en el option
}