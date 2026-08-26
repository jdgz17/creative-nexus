import React from 'react';
import { clsx } from 'clsx';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  accentColor?: 'cyan' | 'purple' | 'pink' | 'amber' | 'emerald';
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  accentColor = 'cyan',
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const trackGradients = {
    cyan: 'from-cyan-500 to-cyan-300',
    purple: 'from-purple-500 to-purple-300',
    pink: 'from-pink-500 to-pink-300',
    amber: 'from-amber-500 to-amber-300',
    emerald: 'from-emerald-500 to-emerald-300',
  };

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">{label}</span>
          <span className="text-cyan-400 font-semibold">
            {typeof value === 'number' && step < 1 ? value.toFixed(2) : value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative flex items-center h-5 select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Track Background */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className={clsx('h-full bg-gradient-to-r transition-all duration-75', trackGradients[accentColor])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Thumb */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)] pointer-events-none -translate-x-1/2 transition-all duration-75"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
