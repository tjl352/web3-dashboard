// import { JsonRpcProvider } from 'ethers';

// // Connect to the Ethereum network
// const provider = new JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/AReVco-h9y_kzlU5T_frj");

// // Get block by number
// const blockNumber = "latest";
// const block = await provider.getBlock(blockNumber);

// console.log(block);

const url = 'wss://eth-mainnet.g.alchemy.com/v2/AReVco-h9y_kzlU5T_frj';

// Create a new WebSocket connection to the server
const socket = new WebSocket(url);

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('Connected to the WebSocket server');

    // Specify the subscription
    const subscriptionMessage = {
        jsonrpc: "2.0",
        method: "eth_subscribe",
        params: [
            "alchemy_minedTransactions",
            {
                addresses: [
                    {to: "0x9f3ce0ad29b767d809642a53c2bccc9a130659d7", from: "0x228f108fd09450d083bb33fe0cc50ae449bc7e11"},
                    {to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}
                ],
                includeRemoved: false,
                hashesOnly: true
            }
        ],
        id: 1
    };

    // Send the subscription message
    socket.send(JSON.stringify(subscriptionMessage));
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});

// Listen for errors
socket.addEventListener('error', function (event) {
    console.error('WebSocket error: ', event);
});

// Listen for connection close
socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed: ', event);
});