import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-brand-border p-6 shadow-subtle transition-all duration-200',
          hoverEffect && 'hover:shadow-hover hover:border-brand-primary/30',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
