import { ethers } from 'ethers';

export const alchemyWsProvider = new ethers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/AReVco-h9y_kzlU5T_frj`
);

alchemyWsProvider.websocket.onopen = () => {
  console.log('✅ Alchemy WS connected');
};

alchemyWsProvider.websocket.onerror = (event: Event) => {
  console.error('❌ Alchemy WS error', event);
};