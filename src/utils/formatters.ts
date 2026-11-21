export function formatCurrency(amount: number, currency: string = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${currency}0.00`;
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatKwh(kwh: number): string {
  if (isNaN(kwh) || kwh === null || kwh === undefined) return '0.0 kWh';
  return `${kwh.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} kWh`;
}

export function formatCo2(kg: number): string {
  if (isNaN(kg) || kg === null || kg === undefined) return '0.0 kg CO₂e';
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    })} tonnes CO₂e`;
  }
  return `${kg.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} kg CO₂e`;
}

export function formatPercentage(pct: number): string {
  if (isNaN(pct) || pct === null || pct === undefined) return '0%';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}
