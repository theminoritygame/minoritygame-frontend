import { Networks } from "./blockchain";

interface IChainAddresses {
    [key: string]: string;
}

const BSC_MAINNET: IChainAddresses = {
    MINORITY_GAME_CONTRACT: "0xB1A572274e8F00c027e0da622533a8F9d4CFA216",
};


const BSC_TESTNET: IChainAddresses = {
    MINORITY_GAME_CONTRACT: "0xf4B8F50510d48bBF04CAe697c61AbA1F177E489C",
};

export const getAddresses = (networkID: number) => {
    if (networkID === Networks.BSCTest) return BSC_TESTNET;
    if (networkID === Networks.BSC) return BSC_MAINNET;

    throw Error("Network don't support");
};

export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
