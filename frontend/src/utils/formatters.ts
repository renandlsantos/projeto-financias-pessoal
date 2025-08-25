// Formatadores para moeda, data e números
export const formatCurrency = (value: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatDate = (date: string | Date, format = 'short'): string => {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
    long: {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  const options = formatOptions[format] || formatOptions.short;
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObject);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};
