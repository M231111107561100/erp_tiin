import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-nodeen-secondary focus:ring-offset-2 focus:ring-offset-nodeen-bg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-nodeen-primary text-white hover:bg-opacity-90 active:bg-opacity-80',
    secondary: 'bg-nodeen-secondary text-white hover:bg-opacity-90 active:bg-opacity-80',
    accent: 'bg-nodeen-accent text-white hover:bg-opacity-90 active:bg-opacity-80',
    outline: 'border border-nodeen-primary text-nodeen-primary hover:bg-nodeen-primary hover:bg-opacity-10 active:bg-opacity-20',
    ghost: 'text-nodeen-text hover:bg-nodeen-primary hover:bg-opacity-10 active:bg-opacity-20'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="spinner w-4 h-4 border-2" />
      )}
      {children}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps & { icon: React.ReactNode }> = ({
  icon,
  children,
  ...props
}) => {
  return (
    <Button {...props}>
      {icon}
      {children}
    </Button>
  );
};

export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-2xl overflow-hidden border border-nodeen-primary border-opacity-20 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            // @ts-ignore
            className: `rounded-none border-r border-nodeen-primary border-opacity-20 last:border-r-0 ${
              index === 0 ? 'rounded-l-2xl' : '' 
            } ${
              index === React.Children.count(children) - 1 ? 'rounded-r-2xl' : ''
            } ${child.props.className || ''}`
          });
        }
        return child;
      })}
    </div>
  );
};