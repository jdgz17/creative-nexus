import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  glow?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
    icon: 'p-2 text-sm',
  };

  const variants = {
    primary: clsx(
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold',
      glow && 'shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:shadow-[0_0_30px_rgba(0,240,255,0.75)]'
    ),
    secondary: 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50',
    outline: 'bg-transparent hover:bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-400/60',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-cyan-400',
  };

  return (
    <button
      className={twMerge(clsx(base, sizes[size], variants[variant], className))}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
