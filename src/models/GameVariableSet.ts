import {GameStateInfo, GameStaticInfo} from "../models/models";

export class GameVariableSet {
    gameStateInfo: GameStateInfo | undefined;
    gameStaticInfo: GameStaticInfo | undefined;

    resetAll() {
        this.gameStateInfo = undefined;
        this.gameStaticInfo = undefined;
    }
}