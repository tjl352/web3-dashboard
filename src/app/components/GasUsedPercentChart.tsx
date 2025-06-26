import React from 'react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';
import { BlockData } from '../types/block';
import { formatBlockNumber } from '../lib/format';

interface GasUsedPercentChartProps {
  data: BlockData[];
}

const GasUsedPercentChart: React.FC<GasUsedPercentChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <XAxis dataKey="number" label={{ value: 'Block Number', position: 'insideBottom', offset: -5, dy: 10 }} tickFormatter={formatBlockNumber} />
      <YAxis domain={[0, 100]} tickFormatter={tick => `${tick}%`} label={{ angle: -90, position: 'insideLeft' }} />
      <Tooltip formatter={(value, name) => typeof value === 'number' ? `${value.toFixed(2)}%` : value} />
      <CartesianGrid stroke="#ccc" />
      <Line type="monotone" dataKey={d => d.gasLimit > 0 ? (d.gasUsed / d.gasLimit) * 100 : 0} name="gasUsedPercent" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
);

export default GasUsedPercentChart; 