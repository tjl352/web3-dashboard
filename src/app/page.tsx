'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Alchemy, Network } from 'alchemy-sdk';

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
  maxRetries: 5,
};

const alchemy = new Alchemy(config);

export default function Dashboard() {
  const [blockData, setBlockData] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialBlocks = async () => {
      const latest = await alchemy.core.getBlockNumber();
      const blockPromises = [];
      for (let i = 0; i < 10; i++) {
        blockPromises.push(alchemy.core.getBlockWithTransactions(latest - i));
      }
      const blocks = await Promise.all(blockPromises);
      setBlockData(
        blocks.reverse().map(block => ({
          number: block.number,
          gasUsed: parseInt(block.gasUsed.toString()),
          gasLimit: parseInt(block.gasLimit.toString()),
          baseFeePerGas: block.baseFeePerGas ? parseInt(block.baseFeePerGas.toString()) : 0,
        }))
      );
    };

    fetchInitialBlocks();

    const ws = alchemy.ws;
    ws.on('block', async (blockNumber) => {
      const block = await alchemy.core.getBlockWithTransactions(blockNumber);
      const newBlock = {
        number: block.number,
        gasUsed: parseInt(block.gasUsed.toString()),
        gasLimit: parseInt(block.gasLimit.toString()),
        baseFeePerGas: block.baseFeePerGas ? parseInt(block.baseFeePerGas.toString()) : 0,
      };
      setBlockData(prev => [...prev.slice(-9), newBlock]);
    });

    return () => {
      ws.removeAllListeners('block');
    };
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ethereum Realtime Block Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Base Fee Per Gas</h2>
        <LineChart width={800} height={300} data={blockData}>
          <XAxis dataKey="number" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="baseFeePerGas" stroke="#8884d8" />
        </LineChart>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Gas Used vs Gas Limit</h2>
        <LineChart width={800} height={300} data={blockData}>
          <XAxis dataKey="number" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="gasUsed" stroke="#82ca9d" />
          <Line type="monotone" dataKey="gasLimit" stroke="#ff7300" />
        </LineChart>
      </div>
    </main>
  );
}
