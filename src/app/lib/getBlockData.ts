import { alchemyWsProvider } from './provider';
import { ethers, formatUnits } from 'ethers';

interface BlockData {
  blockNumber: number;
  baseFee: number;
  gasRatio: number;
  volume: number;
}

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

export async function getBlockData(blockNumber: number, tokenAddress: string): Promise<BlockData> {
  try {
    // Get block data (throws if block doesn't exist)
    const [block, fullBlock] = await Promise.all([
      alchemyWsProvider.getBlock(blockNumber),
      alchemyWsProvider.getBlock(blockNumber, true)
    ]);

    if (!block || !fullBlock) {
      throw new Error(`Block ${blockNumber} not found`);
    }

    // Process all transactions in parallel
    const transactionReceipts = await Promise.all(
      fullBlock.transactions.map(tx => 
        alchemyWsProvider.getTransactionReceipt(tx).catch(() => null)
      )
    );

    // Calculate total transfer volume
    let volume = BigInt(0);
    for (const receipt of transactionReceipts) {
      if (!receipt?.logs) continue;
      
      for (const log of receipt.logs) {
        if (
          log.address.toLowerCase() === tokenAddress.toLowerCase() &&
          log.topics[0] === TRANSFER_TOPIC
        ) {
          volume += BigInt(log.data);
        }
      }
    }

    return {
      blockNumber,
      baseFee: Number(block.baseFeePerGas ?? BigInt(0)),
      gasRatio: (Number(block.gasUsed) / Number(block.gasLimit)) * 100,
      volume: Number(formatUnits(volume, 18)) // Convert from wei
    };
    
  } catch (error) {
    console.error(`Error processing block ${blockNumber}:`, error);
    throw error;
  }
}