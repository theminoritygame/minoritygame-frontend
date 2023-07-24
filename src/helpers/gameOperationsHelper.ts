import { BigNumber } from "ethers";
import { useDispatch } from "react-redux";
import { AVAILABLE_CHAINS } from "src/constants";
import { GameContractReadHelper } from "src/models/GameContractReadHelper";
import { Web3Helper } from "src/models/web3Helper";
import { metamaskErrorWrap } from "./metamask-error-wrap";
import { warning } from "../store/slices/messages-slice";
import { messages } from "../constants/messages";
import { Dispatch } from "redux";
import { GameResultInfo } from "src/models/models";

export function claimPrize(web3Helper: Web3Helper, gameContractReadHelper: GameContractReadHelper, dispatch: Dispatch<any>,
    gameId: number| undefined, winningVotes: [BigNumber, boolean][] | undefined) {
    if(web3Helper.address == null || web3Helper.address.length ==0) {
        web3Helper.connect();
    }
    if (web3Helper.connected && !AVAILABLE_CHAINS.includes(web3Helper.providerChainID)) {
        web3Helper.checkWrongNetwork();
    }

    const unclaimedVotes = winningVotes?.filter((vote) => vote[1] == false)?.map((vote) => vote[0])

    if ( gameId == undefined || winningVotes== undefined || winningVotes.length == 0 || unclaimedVotes == undefined || unclaimedVotes.length == 0) {
        console.log("something went wront. Try again")
        if (unclaimedVotes == undefined || unclaimedVotes.length == 0) {
            dispatch(warning({ text: messages.nothing_to_claim_already_claimed }));
        } else {
            dispatch(warning({ text: messages.nothing_to_claim }));
        }
        //toDO: toast
    } else {
        gameContractReadHelper.executeBurnTx(gameId, unclaimedVotes, web3Helper.address, function(err: any) {
            metamaskErrorWrap(err, dispatch);
        })
    }
}

export async function fetchGameResults(gameContractReadHelper: GameContractReadHelper, addr: string, gameId: number): Promise<GameResultInfo> {
    const [res1, res2] = await Promise.all([
        gameContractReadHelper.fetchWinningChoiceAndVotesCasted(gameId),
        gameContractReadHelper.fetchTotalVotesCasted(gameId),
    ]);
    const gameResultInfo: GameResultInfo = {
        winningChoice: res1[0],
        winningVotes: res1[1],
        totalVotes: res2,
        losingVotes: res2.sub(res1[1]),
        myWinningVotes: undefined,
        myTotalVotes: undefined,
        myLosingVotes: undefined
    }

    try {
        const [res3, res4] = await Promise.all([
            gameContractReadHelper.fetchWinningVotesOf(gameId, addr),
            gameContractReadHelper.fetchVotesCastedBy(gameId, addr)
        ]);
        gameResultInfo.myWinningVotes = res3
        gameResultInfo.myTotalVotes = res4
        gameResultInfo.myLosingVotes = res4.length - res3.length
    } catch(err) {
        console.log(err)
    }
    return gameResultInfo
}

export async function fetchBnbToUsdRate(): Promise<number> {
    const binanceApiUrl = "https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT";
    const response = await fetch(binanceApiUrl);
    const data = await response.json();
    return parseFloat(data.price);
}

