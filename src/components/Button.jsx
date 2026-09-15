import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-button active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400 shadow-button",
    secondary:
      "bg-dark-100 text-dark-800 hover:bg-dark-200 focus:ring-dark-300",
    outline:
      "border border-border bg-surface text-dark-700 hover:bg-dark-50 hover:border-dark-300 focus:ring-primary-300",
    danger:
      "bg-danger text-white hover:opacity-90 focus:ring-red-400 shadow-sm",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const disabledStyles =
    "opacity-50 cursor-not-allowed hover:bg-inherit active:scale-100 shadow-none pointer-events-none";

  const selectedVariant = variantStyles[variant] || variantStyles.primary;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${selectedVariant}
        ${selectedSize}
        ${disabled || loading ? disabledStyles : ""}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
