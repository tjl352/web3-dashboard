'use client';

import React, { useEffect, useState } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import { JsonRpcProvider } from 'ethers';
import TransactionsChart from './components/TransactionsChart';
import UsdcVolumeChart from './components/UsdcVolumeChart';
import CombinedGasChart from './components/CombinedGasChart';
import { TooltipProps } from 'recharts';
import { BlockData, UsdcVolumeData } from './types/block';

// Check if API key is available
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!apiKey) {
  console.warn('NEXT_PUBLIC_ALCHEMY_API_KEY is not set. Please add your Alchemy API key to .env.local');
}

const config = {
  apiKey: apiKey || 'demo',
  network: Network.ETH_MAINNET,
  maxRetries: 5,
};

const alchemy = new Alchemy(config);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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

export default function Dashboard() {
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [usdcVolumeData, setUsdcVolumeData] = useState<UsdcVolumeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiKey) {
      setError('Alchemy API key is not configured. Please add NEXT_PUBLIC_ALCHEMY_API_KEY to your .env.local file.');
      setIsLoading(false);
      return;
    }

    const httpProvider = new JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${apiKey}`);
    
    const fetchInitialBlocks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const latest = await alchemy.core.getBlockNumber();
        const blockPromises = [];
        for (let i = 0; i < 10; i++) {
          blockPromises.push(httpProvider.getBlock(latest - i));
        }
        const blocks = await Promise.all(blockPromises);
        setBlockData(
          blocks.reverse().reduce<BlockData[]>((acc, block) => {
            if (!block) return acc;
            const gasUsed = parseInt(block.gasUsed.toString());
            const gasLimit = parseInt(block.gasLimit.toString());
            acc.push({
              number: block.number,
              gasUsed,
              gasLimit,
              baseFeePerGas: block.baseFeePerGas ? parseInt(block.baseFeePerGas.toString()) : 0,
              transactions: block.transactions.length,
              gasUsedPercent: gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0,
            });
            return acc;
          }, [])
        );
        
        // Fetch USDC volume for each block (inline logic)
        const usdcVolumePromises = blocks.reverse().map(async block => {
          if (!block) return undefined;
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
          } catch (error) {
            console.warn(`Failed to fetch USDC volume for block ${block.number}:`, error);
            return {
              number: block.number,
              volume: 0,
            };
          }
        });
        const usdcVolumes = (await Promise.all(usdcVolumePromises)).filter((v): v is UsdcVolumeData => v !== undefined);
        setUsdcVolumeData(usdcVolumes);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial blocks:', error);
        setError('Failed to fetch block data. Please check your API key and try again.');
        setIsLoading(false);
      }
    };

    fetchInitialBlocks();

    const ws = alchemy.ws;
    ws.on('block', async (blockNumber) => {
      try {
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
        } catch (error) {
          console.warn(`Failed to fetch USDC volume for new block ${block.number}:`, error);
          setUsdcVolumeData(prev => [...prev.slice(-9), { number: block.number, volume: 0 }]);
        }
      } catch (error) {
        console.error('Failed to fetch new block:', error);
      }
    });

    return () => {
      ws.removeAllListeners('block');
    };
  }, []);

  const CustomVolumeTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ethereum Realtime Block Dashboard</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading block data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ethereum Realtime Block Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-2">To fix this:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Get a free API key from <a href="https://www.alchemy.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Alchemy</a></li>
              <li>Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in your project root</li>
              <li>Add: <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_ALCHEMY_API_KEY=your_api_key_here</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </main>
    );
  }

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
        <h2 className="text-xl mb-2">Gas Metrics (Base Fee & Usage)</h2>
        <CombinedGasChart data={blockData} />
      </div>
    </main>
  );
}
