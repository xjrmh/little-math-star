
import React from 'react';
import { playSound } from '../services/sound';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false 
}) => {
  const baseStyles = "transform transition-all duration-200 hover:scale-105 active:scale-95 font-bold rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1";
  
  const variants = {
    primary: "bg-blue-400 hover:bg-blue-500 text-white border-b-4 border-blue-600",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border-b-4 border-gray-200",
    success: "bg-green-400 hover:bg-green-500 text-white border-b-4 border-green-600",
    danger: "bg-red-400 hover:bg-red-500 text-white border-b-4 border-red-600",
    warning: "bg-yellow-400 hover:bg-yellow-500 text-white border-b-4 border-yellow-600",
  };

  const handleClick = () => {
    if (!disabled) {
      playSound('click');
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
