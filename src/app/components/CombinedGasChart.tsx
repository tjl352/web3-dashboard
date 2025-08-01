import React from 'react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';
import { BlockData } from '../types/block';
import { formatNumber, formatBlockNumber } from '../lib/format';

interface CombinedGasChartProps {
  data: BlockData[];
}

const CombinedGasChart: React.FC<CombinedGasChartProps> = ({ data }) => {
  console.log('CombinedGasChart data:', data);
  
  // Convert baseFeePerGas from wei to gwei and calculate gas used percentage
  const processedData = data.map(block => ({
    ...block,
    baseFeePerGasGwei: block.baseFeePerGas / 1e9, // Convert wei to gwei
    gasUsedPercent: block.gasUsedPercent
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={processedData} margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
        <XAxis 
          dataKey="number" 
          label={{ value: 'Block Number', position: 'insideBottom', offset: -5, dy: 10 }} 
          tickFormatter={formatBlockNumber}
        />
        
        {/* Left Y-axis for Base Fee Per Gas (Gwei) */}
        <YAxis 
          yAxisId="left"
          orientation="left"
          tickFormatter={formatNumber}
          label={{ value: 'Base Fee Per Gas (Gwei)', angle: -90, position: 'insideLeft', offset: 0, dy: 80 }}
        />
        
        {/* Right Y-axis for Gas Used Percentage */}
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${Math.round(value)}%`}
          label={{ value: 'Gas Used (%)', angle: 90, position: 'insideRight', offset: 0, dy: 20 }}
        />
        
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const baseFeeData = payload.find(p => p.dataKey === 'baseFeePerGasGwei');
              const gasUsedData = payload.find(p => p.dataKey === 'gasUsedPercent');
              
              return (
                <div style={{ background: 'white', border: '1px solid #ccc', padding: 10 }}>
                  <div><strong>Block:</strong> {label}</div>
                  {baseFeeData && (
                    <div style={{ color: baseFeeData.color }}>
                      <strong>Base Fee Per Gas:</strong> {typeof baseFeeData.value === 'number' ? baseFeeData.value.toFixed(2) : baseFeeData.value} Gwei
                    </div>
                  )}
                  {gasUsedData && (
                    <div style={{ color: gasUsedData.color }}>
                      <strong>Gas Used:</strong> {typeof gasUsedData.value === 'number' ? gasUsedData.value.toFixed(1) : gasUsedData.value}%
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        
        {/* Base Fee Per Gas line (left y-axis) */}
        <Line 
          type="monotone" 
          dataKey="baseFeePerGasGwei" 
          stroke="#8884d8" 
          yAxisId="left"
          name="Base Fee Per Gas (Gwei)"
        />
        
        {/* Gas Used Percentage line (right y-axis) */}
        <Line 
          type="monotone" 
          dataKey="gasUsedPercent" 
          stroke="#82ca9d" 
          yAxisId="right"
          name="Gas Used (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CombinedGasChart; 