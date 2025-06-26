export interface BlockData {
  number: number;
  gasUsed: number;
  gasLimit: number;
  baseFeePerGas: number;
  transactions: number;
  gasUsedPercent: number;
}

export interface UsdcVolumeData {
  number: number;
  volume: number;
} 