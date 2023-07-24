import { Networks } from "./blockchain";

interface IViewsForNetwork {
    claimPrize: boolean;
    challenge: boolean;
    game: boolean;
    rules: boolean;
    decryptVotes: boolean;
    archive: boolean;
}

export const VIEWS_FOR_NETWORK: { [key: number]: IViewsForNetwork } = {
    [Networks.BSC]: {
        claimPrize: true,
        challenge: true,
        game: true,
        rules: true,
        decryptVotes: true,
        archive: true,
    },
    [Networks.BSCTest]: {
        claimPrize: true,
        challenge: true,
        game: true,
        rules: true,
        decryptVotes: true,
        archive: true,
    },
};
