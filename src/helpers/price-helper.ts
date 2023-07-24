import { BigNumber, utils } from "ethers";

export function convertToUsd(bnbAmount: number, bnbToUsdRate: number| undefined): string | undefined {
    if (bnbToUsdRate == undefined) return
    const usdAmount = bnbAmount * bnbToUsdRate;
    return usdAmount.toFixed(2);
}

export function convertToBNBFromWei(x_wei: BigNumber): string {
    const bnbAmount = utils.formatEther(x_wei);
    if (bnbAmount == '0.0') return'0'
    return bnbAmount;
}