export function formatKES(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return 'KES 0.00';
  }
  
  return `KES ${num.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatKESShort(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return 'KES 0';
  }
  
  if (num >= 1000000) {
    return `KES ${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `KES ${(num / 1000).toFixed(1)}K`;
  }
  
  return `KES ${num.toFixed(0)}`;
}

export function parseKES(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
