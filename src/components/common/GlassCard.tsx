import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glow' | 'interactive' | 'solid';
  glowColor?: 'cyan' | 'purple' | 'pink' | 'amber' | 'emerald';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  glowColor = 'cyan',
  className,
  ...props
}) => {
  const glowBorderMap = {
    cyan: 'border-cyan-500/25 shadow-[0_0_25px_-5px_rgba(0,240,255,0.2)]',
    purple: 'border-purple-500/25 shadow-[0_0_25px_-5px_rgba(157,78,221,0.2)]',
    pink: 'border-pink-500/25 shadow-[0_0_25px_-5px_rgba(255,0,127,0.2)]',
    amber: 'border-amber-500/25 shadow-[0_0_25px_-5px_rgba(255,183,3,0.2)]',
    emerald: 'border-emerald-500/25 shadow-[0_0_25px_-5px_rgba(0,245,155,0.2)]',
  };

  const baseStyles = 'rounded-xl backdrop-blur-xl transition-all duration-200';

  const variants = {
    default: 'bg-nexus-dark-card/75 border border-cyan-500/15',
    glow: clsx('bg-nexus-dark-card/85 border', glowBorderMap[glowColor]),
    interactive: 'bg-nexus-dark-card/60 border border-cyan-500/15 hover:border-cyan-400/50 hover:bg-nexus-dark-card/90 hover:shadow-[0_0_20px_-3px_rgba(0,240,255,0.25)] hover:-translate-y-0.5 cursor-pointer',
    solid: 'bg-nexus-dark-elevated border border-slate-800',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
