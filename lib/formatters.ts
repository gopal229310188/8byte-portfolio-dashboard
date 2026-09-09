export function formatCurrency(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(2)}%`;
}

export function formatNumber(
  value: number | null,
  maximumFractionDigits = 2,
): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(value);
}