import { GameContractReadHelper } from "src/models/GameContractReadHelper";
import { GameStateInfo } from "src/models/models";
import { Web3Helper } from "src/models/web3Helper";
import { GameSliceState, updateGameStateData } from "src/store/slices/game-slice";
import { fetchResourcesAsPromise } from "./ipfsAssetsHelper";

export class GameHelper {
    private readonly gameContractReadHelper: GameContractReadHelper
    private isFetchGameInfoOngoing: boolean

    constructor(web3Helper: Web3Helper) {
        this.gameContractReadHelper = new GameContractReadHelper(web3Helper)
        this.isFetchGameInfoOngoing = false
    }

    async fetchGamesInfoIfChanged(gameInfo: GameSliceState| undefined): Promise<GameSliceState> {
        if (this.isFetchGameInfoOngoing) {
            throw('isFetchGameInfoOngoing')
        }
        this.isFetchGameInfoOngoing = true;
        let info
        try {
            info = await this.fetchGamesInfo()
            if (info == undefined) {
                info = await this.fetchGamesInfo()
            }
            if (info && (gameInfo == undefined || this._isDifferent(gameInfo, info))) {

            } else {
                info = undefined
            }
        } catch(e) {
            console.log('refreshStateIfNeeded failed: ',e)
        }
        this.isFetchGameInfoOngoing = false
        if (info) {
            return info
        }
        throw('no new info')
    }

    async fetchGamesInfo(): Promise<GameSliceState | undefined> {
        const ccnt = await this.gameContractReadHelper.fetchGamesCount()
        const gameCount = ccnt.toNumber()
        const gamePromises = [];
        var baseGameId = gameCount - 5 /* we will iterate only through last 5 games to find valid one*/
        if (baseGameId < 0) {
            baseGameId = 0
        }
        for (let gameId = gameCount - 1; gameId >= baseGameId; gameId--) {
            gamePromises.push(this.gameContractReadHelper.fetchGamesState(gameId));
        }
        const gameStatesInfo = await Promise.all(gamePromises)
        let gameID = -1;
        for (let i = 0; i < gameStatesInfo.length; i++) {
            var info = gameStatesInfo[i];
            if (info.gameState === 'VOTING_STARTED') {
                gameID = gameCount - 1 - i
                const gameInfo = await this.fetchInfoForGame(gameID, info)
                return gameInfo
            }
        }
        return undefined
    }

    async fetchInfoForGame(gameID: number, gameStateInfo: GameStateInfo): Promise<GameSliceState | undefined> {
        if (gameID >= 0) {
                const staticInfoPromise = this.gameContractReadHelper.fetchGameStaticInfo(gameID)
                const totalVotesPromise = this.gameContractReadHelper.fetchTotalVotesCasted(gameID)

                const staticInfo = await staticInfoPromise;
                const totalVotes = await totalVotesPromise;

                if (staticInfo.assetsCID != undefined) {
                    const assets = await fetchResourcesAsPromise(staticInfo.assetsCID)
                    return {
                        gameID: gameID,
                        gameStateInfo: gameStateInfo,
                        gameStaticInfo: staticInfo,
                        assets: assets,
                        totalVotes: totalVotes.toNumber()
                    }
                }
        }
        return undefined
    }

    _isDifferent(a: GameSliceState , b: GameSliceState): boolean {
        return (a.gameID != b.gameID || 
            a.gameStateInfo?.gameState != b.gameStateInfo?.gameState ||
            a.totalVotes != b.totalVotes)
    }
}