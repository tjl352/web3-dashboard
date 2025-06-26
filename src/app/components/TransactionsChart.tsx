import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from 'recharts';
import { BlockData } from '../types/block';
import { formatNumber, formatBlockNumber } from '../lib/format';

interface TransactionsChartProps {
  data: BlockData[];
  CustomTooltip: React.FC<Record<string, unknown>>;
}

const TransactionsChart: React.FC<TransactionsChartProps> = ({ data, CustomTooltip }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey="number" label={{ value: 'Block Number', position: 'insideBottom', offset: -5, dy: 10 }} tickFormatter={formatBlockNumber} />
      <YAxis label={{ angle: -90, position: 'insideLeft' }} tickFormatter={formatNumber} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="transactions" barSize={20} fill="#413ea0" legendType="none" />
    </ComposedChart>
  </ResponsiveContainer>
);

export default TransactionsChart; 