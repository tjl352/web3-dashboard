import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from 'recharts';
import { UsdcVolumeData } from '../types/block';
import { formatNumber, formatBlockNumber } from '../lib/format';

interface UsdcVolumeChartProps {
  data: UsdcVolumeData[];
  CustomVolumeTooltip: React.FC<any>;
}

const UsdcVolumeChart: React.FC<UsdcVolumeChartProps> = ({ data, CustomVolumeTooltip }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <CartesianGrid stroke="#f5f5f5" />
      <XAxis dataKey="number" label={{ value: 'Block Number', position: 'insideBottom', offset: -5, dy: 10 }} tickFormatter={formatBlockNumber} />
      <YAxis label={{ angle: -90, position: 'insideLeft' }} tickFormatter={formatNumber} />
      <Tooltip content={<CustomVolumeTooltip />} />
      <Bar dataKey="volume" barSize={20} fill="#8884d8" />
    </ComposedChart>
  </ResponsiveContainer>
);

export default UsdcVolumeChart; 