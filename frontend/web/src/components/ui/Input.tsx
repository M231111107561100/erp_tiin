import React, { forwardRef, useId } from "react";

/* ===========================
   Types et interfaces
   =========================== */
type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, className = "", disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 " +
      "focus:outline-none focus:ring-2 focus:ring-nodeen-secondary focus:ring-offset-2 focus:ring-offset-nodeen-bg " +
      "disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-nodeen-primary text-white hover:bg-opacity-90 active:bg-opacity-80 shadow-sm",
      secondary: "bg-nodeen-secondary text-white hover:bg-opacity-90 active:bg-opacity-80 shadow-sm",
      accent: "bg-nodeen-accent text-white hover:bg-opacity-90 active:bg-opacity-80 shadow-sm",
      outline:
        "border border-nodeen-primary text-nodeen-primary bg-transparent hover:bg-nodeen-primary/10 active:bg-nodeen-primary/20",
      ghost: "text-nodeen-text hover:bg-nodeen-primary/10 active:bg-nodeen-primary/20 bg-transparent",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm"
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-2.5",
      xl: "px-8 py-4 text-xl gap-3"
    };

    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading && (
          <svg className="animate-spin-slow w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, children, ...props }, ref) => (
    <Button ref={ref} {...props}>
      <span className="flex items-center gap-2">
        {icon}
        {children}
      </span>
    </Button>
  )
);
IconButton.displayName = "IconButton";

interface ButtonGroupProps {
  children?: React.ReactNode;
  className?: string;
  vertical?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = "", vertical = false }) => {
  const count = React.Children.count(children);
  
  return (
    <div 
      className={`inline-flex ${
        vertical ? 'flex-col' : 'flex-row'
      } rounded-2xl overflow-hidden border border-nodeen-primary/20 ${className}`.trim()} 
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const extra = vertical
          ? `rounded-none border-b border-nodeen-primary/20 last:border-b-0 ${
              index === 0 ? "rounded-t-2xl" : ""
            } ${index === count - 1 ? "rounded-b-2xl" : ""}`
          : `rounded-none border-r border-nodeen-primary/20 last:border-r-0 ${
              index === 0 ? "rounded-l-2xl" : ""
            } ${index === count - 1 ? "rounded-r-2xl" : ""}`;
            
        const prev = (child.props as { className?: string }).className ?? "";
        return React.cloneElement(child, { className: `${prev} ${extra}`.trim() });
      })}
    </div>
  );
};

/* ===========================
   Champs de formulaire
   =========================== */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", id, leftIcon, rightIcon, required, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    const base =
      "w-full rounded-2xl border bg-white px-3 py-2.5 outline-none transition-all duration-200 " +
      "focus:ring-2 focus:ring-nodeen-primary/60 focus:border-nodeen-primary/60 shadow-sm " +
      "placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500";
      
    const withIcons = `${leftIcon ? " pl-10" : ""}${rightIcon ? " pr-10" : ""}`;
    const border = error 
      ? " border-red-400 focus:border-red-400 focus:ring-red-200" 
      : " border-nodeen-border hover:border-nodeen-primary/40";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-nodeen-text">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-gray-400" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${base}${withIcons}${border} ${className}`.trim()}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            required={required}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-gray-400" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export type SelectOption = { 
  value: string | number; 
  label: string;
  disabled?: boolean;
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className = "", id, options, children, leftIcon, rightIcon, required, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;

    const base =
      "w-full rounded-2xl border bg-white px-3 py-2.5 outline-none transition-all duration-200 " +
      "focus:ring-2 focus:ring-nodeen-primary/60 focus:border-nodeen-primary/60 shadow-sm " +
      "disabled:bg-gray-50 disabled:text-gray-500 appearance-none cursor-pointer";
      
    const withIcons = `${leftIcon ? " pl-10" : ""}${rightIcon ? " pr-10" : ""}`;
    const border = error 
      ? " border-red-400 focus:border-red-400 focus:ring-red-200" 
      : " border-nodeen-border hover:border-nodeen-primary/40";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-nodeen-text">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-gray-400 pointer-events-none" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`${base}${withIcons}${border} ${className}`.trim()}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            required={required}
            {...props}
          >
            {options
              ? options.map((option) => (
                  <option 
                    key={`${option.label}-${option.value}`} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          {rightIcon && (
            <span className="absolute right-3 text-gray-400 pointer-events-none" aria-hidden="true">
              {rightIcon}
            </span>
          )}
          {/* Chevron icon for select */}
          <div className="absolute right-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

/* ===========================
   Composant Textarea
   =========================== */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = "", id, required, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id ?? autoId;

    const base =
      "w-full rounded-2xl border bg-white px-3 py-2.5 outline-none transition-all duration-200 " +
      "focus:ring-2 focus:ring-nodeen-primary/60 focus:border-nodeen-primary/60 shadow-sm " +
      "placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 resize-vertical min-h-[80px]";
      
    const border = error 
      ? " border-red-400 focus:border-red-400 focus:ring-red-200" 
      : " border-nodeen-border hover:border-nodeen-primary/40";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-nodeen-text">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${base} ${border} ${className}`.trim()}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          required={required}
          {...props}
        />
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";