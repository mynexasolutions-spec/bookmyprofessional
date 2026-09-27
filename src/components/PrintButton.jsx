"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center justify-center rounded-xl bg-primary-500 px-5 py-2.5 text-xs font-semibold text-white shadow-button transition-colors hover:bg-primary-600"
    >
      Print Receipt
    </button>
  );
}
