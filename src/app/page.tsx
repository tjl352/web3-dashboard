'use client'

import { useEffect, useState } from 'react';
import { alchemyWsProvider } from './lib/provider';
import { getBlockData } from './lib/getBlockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const TOKEN_ADDRESS = '0xA0b86991c6218B36C1D19D4a2e9Eb0cE3606eB48'; // USDC (USD Coin)

export default function Home() {
  const [blockMetrics, setBlockMetrics] = useState<any[]>([]);

  // Fetch last 10 blocks on initial load
  useEffect(() => {
    const fetchInitial = async () => {
      const latestBlock = await alchemyWsProvider.getBlockNumber();
      const blockData = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          getBlockData(latestBlock - (9 - i), TOKEN_ADDRESS)
        )
      );
      setBlockMetrics(blockData);
    };

    fetchInitial();

    // Subscribe to new blocks in real-time
    const handleNewBlock = async (blockNumber: number) => {
      const data = await getBlockData(blockNumber, TOKEN_ADDRESS);
      setBlockMetrics((prev) => [...prev.slice(-9), data]); // keep only latest 10
    };

    alchemyWsProvider.on('block', handleNewBlock);

    return () => {
      alchemyWsProvider.off('block', handleNewBlock);
    };
  }, []);

  // Setup custom Alchemy WebSocket for minedTransactions
  useEffect(() => {
    const url = 'wss://eth-mainnet.g.alchemy.com/v2/AReVco-h9y_kzlU5T_frj';
    const socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      console.log('✅ Connected to the WebSocket server');

      const subscriptionMessage = {
        jsonrpc: '2.0',
        method: 'eth_subscribe',
        params: [
          'alchemy_minedTransactions',
          {
            addresses: [
              {
                to: '0x9f3ce0ad29b767d809642a53c2bccc9a130659d7',
                from: '0x228f108fd09450d083bb33fe0cc50ae449bc7e11',
              },
              {
                to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              },
            ],
            includeRemoved: false,
            hashesOnly: false,
          },
        ],
        id: 1,
      };

      socket.send(JSON.stringify(subscriptionMessage));
    });

    socket.addEventListener('message', (event) => {
      console.log('📩 Mined Transaction:', JSON.parse(event.data));
    });

    socket.addEventListener('error', (event) => {
      console.error('❌ WebSocket error:', event);
    });

    socket.addEventListener('close', (event) => {
      console.log('🔌 WebSocket connection closed:', event);
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📊 Real-Time Blockchain Dashboard</h1>

      <h2>ERC20 Transfer Volume</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={blockMetrics}>
          <XAxis dataKey="blockNumber" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="volume" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <h2>Base Fee (Gwei)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={blockMetrics}>
          <XAxis dataKey="blockNumber" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="baseFee" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      <h2>Gas Used / Gas Limit (%)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={blockMetrics}>
          <XAxis dataKey="blockNumber" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="gasRatio" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
