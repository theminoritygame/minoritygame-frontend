import { Networks, NetworksInfo } from "../constants/blockchain";

export const getChainInfo = (chain: Networks) => {
    const info = NetworksInfo[chain];
    if (!info) {
        throw Error("Chain don't support");
    }
    return info;
};
