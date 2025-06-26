import React from 'react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';
import { BlockData } from '../types/block';
import { formatNumber, formatBlockNumber } from '../lib/format';

interface BaseFeeChartProps {
  data: BlockData[];
}

const BaseFeeChart: React.FC<BaseFeeChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <XAxis dataKey="number" label={{ value: 'Block Number', position: 'insideBottom', offset: -5, dy: 10 }} tickFormatter={formatBlockNumber} />
      <YAxis tickFormatter={formatNumber} />
      <Tooltip />
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <Line type="monotone" dataKey="baseFeePerGas" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);

export default BaseFeeChart; 