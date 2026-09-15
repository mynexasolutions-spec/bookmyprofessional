import React from "react";

export default function Card({
  children,
  className = "",
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={`
        bg-surface 
        border 
        border-border 
        rounded-card 
        shadow-card 
        p-6 
        transition-all 
        duration-200
        ${hoverable ? "hover:shadow-soft hover:border-primary-200 hover:-translate-y-0.5" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
