"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-muted">{label}</label>
      )}
      <input
        className={`bg-surface-hover border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
