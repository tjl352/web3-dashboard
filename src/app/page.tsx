'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, Area, Bar, Scatter, Legend, ResponsiveContainer } from 'recharts';
import { Alchemy, Network } from 'alchemy-sdk';
import { JsonRpcProvider } from 'ethers';
import TransactionsChart from './components/TransactionsChart';
import UsdcVolumeChart from './components/UsdcVolumeChart';
import BaseFeeChart from './components/BaseFeeChart';
import GasUsedPercentChart from './components/GasUsedPercentChart';

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
  maxRetries: 5,
};

const alchemy = new Alchemy(config);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: 'white', border: '1px solid #ccc', padding: 10 }}>
        <div><strong>Block:</strong> {label}</div>
        <div><strong>Transactions:</strong> {data.transactions}</div>
        <div><strong>Base Fee Per Gas:</strong> {data.baseFeePerGas}</div>
        <div><strong>Gas Limit:</strong> {data.gasLimit}</div>
        <div><strong>Gas Used:</strong> {data.gasUsed}</div>
      </div>
    );
  }
  return null;
};

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const formatNumber = (num: number) => {
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

const formatBlockNumber = (num: number) => `#${num.toString().slice(-4)}`;

export default function Dashboard() {
  const [blockData, setBlockData] = useState<any[]>([]);
  const [usdcVolumeData, setUsdcVolumeData] = useState<any[]>([]);

  useEffect(() => {
    const httpProvider = new JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const fetchInitialBlocks = async () => {
      const latest = await alchemy.core.getBlockNumber();
      const blockPromises = [];
      for (let i = 0; i < 10; i++) {
        blockPromises.push(httpProvider.getBlock(latest - i));
      }
      const blocks = await Promise.all(blockPromises);
      setBlockData(
        blocks.reverse().map(block => {
          if (!block) return null;
          const gasUsed = parseInt(block.gasUsed.toString());
          const gasLimit = parseInt(block.gasLimit.toString());
          return {
            number: block.number,
            gasUsed,
            gasLimit,
            baseFeePerGas: block.baseFeePerGas ? parseInt(block.baseFeePerGas.toString()) : 0,
            transactions: block.transactions.length,
            gasUsedPercent: gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0,
          };
        }).filter(Boolean)
      );
      // Fetch USDC volume for each block (inline logic)
      const usdcVolumePromises = blocks.reverse().map(async block => {
        if (!block) return null;
        try {
          const logs = await httpProvider.getLogs({
            address: USDC_ADDRESS,
            fromBlock: block.number,
            toBlock: block.number,
            topics: [USDC_TRANSFER_TOPIC],
          });
          let volume = BigInt(0);
          for (const log of logs) {
            if (log.data) {
              volume += BigInt(log.data);
            }
          }
          return {
            number: block.number,
            volume: Number(volume) / 1e6,
          };
        } catch (e) {
          return {
            number: block.number,
            volume: 0,
          };
        }
      });
      const usdcVolumes = await Promise.all(usdcVolumePromises);
      setUsdcVolumeData(usdcVolumes.filter(Boolean));
    };

    fetchInitialBlocks();

    const ws = alchemy.ws;
    ws.on('block', async (blockNumber) => {
      const block = await httpProvider.getBlock(blockNumber);
      if (!block) return;
      const newBlock = {
        number: block.number,
        gasUsed: parseInt(block.gasUsed.toString()),
        gasLimit: parseInt(block.gasLimit.toString()),
        baseFeePerGas: block.baseFeePerGas ? parseInt(block.baseFeePerGas.toString()) : 0,
        transactions: block.transactions.length,
        gasUsedPercent: parseInt(block.gasLimit.toString()) > 0 ? (parseInt(block.gasUsed.toString()) / parseInt(block.gasLimit.toString())) * 100 : 0,
      };
      setBlockData(prev => [...prev.slice(-9), newBlock]);
      // Fetch USDC volume for the new block (inline logic)
      try {
        const logs = await httpProvider.getLogs({
          address: USDC_ADDRESS,
          fromBlock: block.number,
          toBlock: block.number,
          topics: [USDC_TRANSFER_TOPIC],
        });
        let volume = BigInt(0);
        for (const log of logs) {
          if (log.data) {
            volume += BigInt(log.data);
          }
        }
        setUsdcVolumeData(prev => [...prev.slice(-9), { number: block.number, volume: Number(volume) / 1e6 }]);
      } catch (e) {
        setUsdcVolumeData(prev => [...prev.slice(-9), { number: block.number, volume: 0 }]);
      }
    });

    return () => {
      ws.removeAllListeners('block');
    };
  }, []);

  const CustomVolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: 'white', border: '1px solid #ccc', padding: 10 }}>
          <div><strong>Block:</strong> {label}</div>
          <div><strong>USDC Volume:</strong> {data.volume}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ethereum Realtime Block Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Transactions Per Block</h2>
        <TransactionsChart data={blockData} CustomTooltip={CustomTooltip} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">USDC Volume Per Block</h2>
        <UsdcVolumeChart data={usdcVolumeData} CustomVolumeTooltip={CustomVolumeTooltip} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Base Fee Per Gas</h2>
        <BaseFeeChart data={blockData} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Gas Used vs Gas Limit (%)</h2>
        <GasUsedPercentChart data={blockData} />
      </div>
    </main>
  );
}
