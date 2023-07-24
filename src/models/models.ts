import { BigNumber } from "ethers";

export const GameStateMap : {[key: number]: GameState} = {
    0: "INITIAL",
    1: "VOTING_STARTED",
    2: "VOTING_ENDED",
    3: "RESULT_PUBLISHED",
    4: "RESULT_LOCKED",
    5: "FUCKED_UP",
  }

export type GameState = 'INITIAL' | 'VOTING_STARTED' | 'VOTING_ENDED' | 'RESULT_PUBLISHED' | 'RESULT_LOCKED' | 'FUCKED_UP';

export type GameStaticInfo = {
    host: string;
    assetsCID: string;
    publicKey: [BigNumber, BigNumber]
    mintPrice: BigNumber;
    initialPot: BigNumber;
    challengeReward: BigNumber;
    maxAllowedVotes: number;
    durationVoting: number;
    durationResultPublish: number;
    durationChallenge: number;
};

export type GameStateInfo = {
    gameState: GameState,
    currentStateStartedTime: number
}

export type GameAssets = {
    readonly imgSrc0: string,
    readonly imgSrc1: string,
    readonly info: GameDecription
}

export type GameDecription = {
    readonly question: string,
    readonly option0: string,
    readonly option1: string
}

export interface ActiveVoteInfo {
    readonly gameId: number,
    readonly cnt: number,
    readonly secret: string,
    readonly choiceIndex: number,
    readonly choiceName: string;
    readonly state: boolean;        /* 0: ongoing, 1: done*/
    readonly voteTimeStatement: string;
}

export type GameResultInfo = {
    winningChoice: BigNumber;
    totalVotes: BigNumber;
    winningVotes: BigNumber;
    losingVotes: BigNumber;
    myTotalVotes: BigNumber[] | undefined;
    myWinningVotes: [BigNumber, boolean][] | undefined;
    myLosingVotes: number | undefined;
};