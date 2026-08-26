import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'pink' | 'amber' | 'emerald' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className,
  dot = false,
}) => {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-mono',
    md: 'text-xs px-2.5 py-1 font-mono',
  };

  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
    pink: 'bg-pink-500/10 text-pink-300 border border-pink-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  const dotColors = {
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide uppercase',
          sizes[size],
          variants[variant],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
};
