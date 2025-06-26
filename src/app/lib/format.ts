export const formatNumber = (num: number) => {
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

export const formatBlockNumber = (num: number) => `#${num.toString().slice(-4)}`; 