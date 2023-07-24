import { Web3Helper } from "./web3Helper";
import {GameState, GameStateInfo, GameStaticInfo, GameStateMap } from "./models"
import { Result } from "@ethersproject/abi";
import { BigNumber } from "ethers"

export class GameContractReadHelper {
    private readonly _web3Helper: Web3Helper

    constructor(web3Helper: Web3Helper) {
        this._web3Helper = web3Helper
    }

    async fetchTotalVotesCasted(gameId: number): Promise<BigNumber> {
        return this._web3Helper.getMinorityContract().getNumberOfMints(gameId);
    }
 
    async fetchGameBurnPrice(gameId: number): Promise<BigNumber> {
        return this._web3Helper.getMinorityContract().getGameBurnPrice(gameId);
    }
 
    async fetchVotesCastedBy(gameId: number, addr: string): Promise<BigNumber[]> {
        const n = (await this.fetchTotalVotesCasted(gameId)).toNumber()
        if (n <= 0) {
            return []
        }
        const promises = [];

        let start = 0;
        while(start < n) {
            const end = Math.min(start+1000, n);
            promises.push(this._web3Helper.getMinorityContract().getVotesOf(gameId, addr, start, end));
            start = end
        }

        const res: BigNumber[][] = (await Promise.all(promises))

        const fin: BigNumber[] = []
        res.forEach(chunk => {
            for(let i=0; i< chunk.length; i++) {
                fin.push(chunk[i])
            }
        });
        return fin
    }

    async fetchGamesCount(): Promise<BigNumber> {
        return this._web3Helper.getMinorityContract().getGamesCount();
    }

    async fetchEncryptedVoteForVoteId(gameId: number, voteId: number): Promise<[BigNumber, BigNumber]> {
        return this._web3Helper.getMinorityContract().getEncryptedVoteForVoteId(gameId, voteId);
    }

    async fetchWinningVotesOf(gameId: number, addr: string): Promise<[BigNumber, boolean][]> {
        const n = (await this.fetchTotalVotesCasted(gameId)).toNumber()
        if (n <= 0) {
            return []
        }
        const promises = [];

        let start = 0;
        while(start < n) {
            const end = Math.min(start+1000, n);
            promises.push(this._web3Helper.getMinorityContract().getWinningVotesOf(gameId, addr, start, end));
            start = end
        }

        const res: [BigNumber[], boolean[]][] = (await Promise.all(promises))

        const fin: [BigNumber, boolean][] = []
        res.forEach(chunk => {
            for(let i=0; i< chunk[0].length; i++) {
                fin.push([chunk[0][i], chunk[1][i]])
            }
        });
        return fin
    }

    async fetchWinningChoiceAndVotesCasted(gameId: number) {
        return this._web3Helper.getMinorityContract().getWinningChoiceInfo(gameId);
    }

    async fetchGameStaticInfo(gameNumber: number): Promise<GameStaticInfo> {
        const res: Result = await this._web3Helper.getMinorityContract().functions.getGameParams(gameNumber);
        const info: GameStaticInfo = {
            host:res[0],
            assetsCID:res[1],
            publicKey:[res[2][0], res[2][1]], 
            mintPrice:res[3], 
            initialPot:res[4], 
            challengeReward:res[5],
            maxAllowedVotes: res[6].toNumber(),
            durationVoting:res[7].toNumber(),
            durationResultPublish: res[8].toNumber(),
            durationChallenge: res[9].toNumber()
        }
        return info;
    }

    async fetchGamesState(gameId: number): Promise<GameStateInfo> {
        const res: Result = await this._web3Helper.getMinorityContract().functions.getGameStateInfo(gameId)
        const stateInfo: GameStateInfo = {
            gameState: GameStateMap[res[0].toNumber()],
            currentStateStartedTime: res[1].toNumber()
        }
        return stateInfo;
    }

    async executeTxVote(gameID: number, eVote: [string, string], val: BigNumber, onSuccess: ()=>void, onError: (err: any)=> void ) {
        // prevent calling twice, if one is already pending
        try {
            const tx = await this._web3Helper.getMinorityContractWithSigner().vote(gameID, eVote[0], eVote[1], { value: val })
            const receipt = await tx.wait(1);
            onSuccess()
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }

    async executeTxVoteMultiple(gameID: number, eVote: [string, string][], val: BigNumber, onSuccess: ()=>void, onError: (err: any)=> void ) {
        // prevent calling twice, if one is already pending
        try {
            const tx = await this._web3Helper.getMinorityContractWithSigner().voteMultiple(gameID, eVote, { value: val })
            const receipt = await tx.wait(1);
            onSuccess()
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }

    async executeBurnTx(gameID: number, winningVotes: BigNumber[], addr: string, onError: (err: any)=> void) {
        // prevent calling twice, if one is already pending
        try {
            await this._web3Helper.getMinorityContractWithSigner().burnMultiple(gameID, winningVotes, addr) 
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }

    async executeChallengePrivateKeyLeak(gameID: number, privKey: BigNumber, onError: (err: any)=> void) {
        // prevent calling twice, if one is already pending
        try {
            await this._web3Helper.getMinorityContractWithSigner().challengeLeakPrivateKey(gameID, privKey) 
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }

    async executechallengeResultPrivateKey(gameID: number, onError: (err: any)=> void) {
        // prevent calling twice, if one is already pending
        try {
            await this._web3Helper.getMinorityContractWithSigner().challengeResultPrivateKey(gameID) 
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }

    async executeChallengeResultVoteCounting(gameID: number, onError: (err: any)=> void) {
        // prevent calling twice, if one is already pending
        try {
            await this._web3Helper.getMinorityContractWithSigner().challengeResultVoteCounting(gameID) 
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }

    async executechallengeResultDecryption(gameID: number, voteID: number, onError: (err: any)=> void) {
        // prevent calling twice, if one is already pending
        try {
            await this._web3Helper.getMinorityContractWithSigner().challengeResultDecryption(gameID, voteID) 
        } catch (err: any) {
            onError(err)
        } finally {
            // if (redeemTx) {
            //     dispatch(clearPendingTxn(redeemTx.hash));
            // }
        }
    }
}