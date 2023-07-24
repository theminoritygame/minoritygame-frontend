import BscIcon from "../assets/networks/binance-icon.svg";

export enum Networks {
    BSC = 56,
    BSCTest = 97,
}

export const DEFAULD_NETWORK = Networks.BSC;

export const AVAILABLE_CHAINS = [Networks.BSCTest, Networks.BSC];

export const NetworksInfo = {
    [Networks.BSCTest]: {
        chainId: "0x61",
        chainName: "BNB Smart Chain Testnet",
        shortName: "BscTestnet",
        rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/","https://data-seed-prebsc-2-s3.binance.org:8545/"],
        blockExplorerUrls: ["https://testnet.bscscan.com"],
        nativeCurrency: {
            name: "BinanceCoin",
            symbol: "BNB",
            decimals: 18,
        },
        img: BscIcon,
    },
    [Networks.BSC]: {
        chainId: "0x38",
        chainName: "BNB Smart Chain",
        shortName: "BSC",
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.io"],
        nativeCurrency: {
            name: "BinanceCoin",
            symbol: "BNB",
            decimals: 18,
        },
        img: BscIcon,
    },
};
