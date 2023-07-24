import { RootState } from "src/store/store";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { GameSliceState } from "src/store/slices/game-slice";


function Root() {
    const gameInfo: GameSliceState = useSelector((state: RootState) => state.gameInfo);
    return (
        <HashRouter>
            <App />
        </HashRouter>
    );
}

export default Root;
