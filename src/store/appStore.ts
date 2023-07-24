import { Web3Helper } from "src/models/web3Helper"
import { state } from "../store/state"
import { GameHelper } from "src/helpers/gameHelper"

class appStore {
    currState: state
    private _web3Helper: Web3Helper| undefined
    private _gameHelper: GameHelper | undefined

    constructor() {
        this.currState = new state()
    }

    refreshWeb3Helper() {
        this._web3Helper = new Web3Helper()
    }

    getWeb3Helper(): Web3Helper {
        if (this._web3Helper == undefined) {
            this._web3Helper = new Web3Helper()
        }
        return this._web3Helper
    }

    getGameHelper(): GameHelper {
        if (this._gameHelper == undefined) {
            this._gameHelper = new GameHelper(this.getWeb3Helper())
        }
        return this._gameHelper
    }
}

export const store = new appStore()