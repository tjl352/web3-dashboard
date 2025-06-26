# Ethereum Realtime Block Dashboard

A modular, real-time dashboard for visualizing Ethereum block data and USDC token activity, built with Next.js, React, ethers.js, Alchemy SDK, and Recharts.

---

## Project Structure & Separation of Concerns

```
web3-dashboard/
├── src/
│   └── app/
│       ├── components/
│       │   ├── TransactionsChart.tsx
│       │   ├── UsdcVolumeChart.tsx
│       │   ├── BaseFeeChart.tsx
│       │   ├── GasUsedPercentChart.tsx
│       ├── lib/
│       │   ├── format.ts
│       ├── types/
│       │   ├── block.ts
│       ├── page.tsx
│       ├── layout.tsx
│       ├── globals.css
│       └── favicon.ico
├── package.json
├── README.md
└── ...
```

### **Separation of Concerns**

- **components/**: All reusable chart and tooltip components.
- **lib/**: Utility and formatting functions.
- **types/**: TypeScript interfaces for data structures.
- **page.tsx**: Main dashboard page, orchestrates data fetching and passes data to components.

---

## Libraries Used & Why

- **Next.js**: React framework for server-side rendering, routing, and fast development.
- **React**: UI library for building component-based interfaces.
- **ethers.js**: For interacting with Ethereum nodes, fetching block data, and logs.
- **alchemy-sdk**: For real-time block updates and easy access to Ethereum data.
- **Recharts**: Charting library for rendering responsive, customizable charts.
- **TypeScript**: Adds static typing for safer, more maintainable code.

---

## Explanation of Each Function/Component/Module

### **Types**

- `types/block.ts`
  - `BlockData`: Interface for block-level metrics (number, gas, transactions, etc).
  - `UsdcVolumeData`: Interface for USDC volume per block.

### **Formatting Helpers**

- `lib/format.ts`
  - `formatNumber(num: number)`: Shortens large numbers (e.g., 1,200,000 → 1.2M).
  - `formatBlockNumber(num: number)`: Shortens block numbers for axis labels (e.g., #1234).

### **Chart Components**

- `components/TransactionsChart.tsx`: Renders a bar chart of transactions per block.
- `components/UsdcVolumeChart.tsx`: Renders a bar chart of USDC volume per block.
- `components/BaseFeeChart.tsx`: Renders a line chart of base fee per gas per block.
- `components/GasUsedPercentChart.tsx`: Renders a line chart of gas used as a percentage of gas limit per block.

### **Tooltips**

- Custom tooltip components are passed as props to charts for rich, contextual hover info.

### **Main Page**

- `page.tsx`:
  - Fetches the latest 10 blocks and listens for new blocks in real time.
  - For each block, fetches:
    - Block number, gas used, gas limit, base fee per gas, transaction count.
    - USDC transfer volume by querying logs for the USDC contract.
  - Calculates gas used percentage for each block.
  - Passes data to chart components for rendering.

#### **Key Functions in `page.tsx`**

- **Data Fetching**: Uses ethers.js and alchemy-sdk to fetch block data and listen for new blocks.
- **USDC Volume Calculation**: Fetches logs for the USDC contract's Transfer event and sums the values for each block.
- **State Management**: Uses React state to store and update block and volume data.
- **Formatting**: Uses helpers for axis and tooltip formatting.

---

## How to Extend

- Add new chart components to `components/` and pass new data as props.
- Add new data types to `types/` and new helpers to `lib/`.
- Use the modular structure to keep logic, types, and UI concerns separate for maintainability.

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your Alchemy API key in your environment variables.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard.
