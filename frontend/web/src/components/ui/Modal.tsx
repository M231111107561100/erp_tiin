import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-nodeen-surface rounded-2xl shadow-xl w-full ${sizeClasses[size]} slide-up`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nodeen-primary border-opacity-20">
          <h2 className="text-xl font-semibold text-nodeen-text">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-2 hover:bg-nodeen-primary hover:bg-opacity-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-nodeen-primary border-opacity-20">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = 'info',
  loading = false
}) => {
  const variantClasses = {
    info: 'bg-nodeen-primary',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'accent' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className={variant === 'danger' ? '!bg-red-500 hover:!bg-red-600' : ''}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full ${variantClasses[variant]} bg-opacity-20 flex items-center justify-center mx-auto mb-4`}>
          <svg className={`w-8 h-8 ${
            variant === 'danger' ? 'text-red-500' : 
            variant === 'warning' ? 'text-yellow-500' : 
            'text-nodeen-primary'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-nodeen-text text-lg">{message}</p>
      </div>
    </Modal>
  );
};