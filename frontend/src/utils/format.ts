export function formatINR(val: number | undefined | null, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  
  // Format with standard en-IN locale for Indian numbering system (Lakhs, Crores)
  const formatted = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${isNeg ? '-' : ''}₹${formatted}`;
}

export function formatCompactINR(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const absVal = Math.abs(val);
  const isNeg = val < 0;
  const sign = isNeg ? '-' : '';

  if (absVal >= 10000000) {
    // 1 Crore = 10,000,000
    return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  } else if (absVal >= 100000) {
    // 1 Lakh = 100,000
    return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
  } else {
    return formatINR(val, 2);
  }
}
