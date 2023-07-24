import { useEffect, useState} from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useWeb3Context } from "../hooks";
import Loading from "../components/Loader";
import ViewBase from "../components/ViewBase";
import { ClaimPrize, Challenge, Game, Rules, FAQ, DecryptVotes, Archive, NotFound} from "../views";
import "./style.scss";
import { waitForPromise } from "src/helpers/promiseHelpers";
import { store } from "src/store/appStore";
import { useDispatch, useSelector } from "react-redux";
import { refreshGameData } from "src/store/slices/game-slice";
import { RootState } from "src/store/store";

function App() {
    const { connect, hasCachedProvider } = useWeb3Context();
    store.refreshWeb3Helper()

    const isAppLoading = !useSelector((state: RootState) => state.appInfo.isLoaded)
    const gameHelper = store.getGameHelper()
    const dispatch = useDispatch()

    useEffect(() => {
        const checkWallet = async () => {
            let metamaskUnlocked = true
            // special handling for metamask to skip showing wallet connect prompt without user action
            // On broswer restart, metamask gets locked, that leads to web3Modal attempting to show connect prompt.
            if (window.ethereum) {
                metamaskUnlocked = await waitForPromise(window.ethereum._metamask.isUnlocked(), false, 5000);
            }
            if (!metamaskUnlocked) {
                // setWalletChecked(true);
            } else if (hasCachedProvider()) {
                connect().then(() => {
                    // setWalletChecked(true);
            });
            } else {
                // setWalletChecked(true);
            }
        };
        checkWallet();

        if (isAppLoading) {
            dispatch(refreshGameData(gameHelper))
        }
      }, []);      

    if (isAppLoading) return <Loading />;

    return (
        <ViewBase>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/game" />
                </Route>

                <Route path="/claimPrize">
                    <ClaimPrize />
                </Route>

                <Route path="/challenge">
                    <Challenge />
                </Route>

                <Route path="/game">
                    <Game />
                </Route>

                <Route path="/rules">
                    <Rules />
                </Route>

                <Route path="/FAQ">
                    <FAQ />
                </Route>

                <Route path="/decryptVotes">
                    <DecryptVotes />
                </Route>

                <Route path="/archive">
                    <Archive />
                </Route>

                <Route component={NotFound} />
            </Switch>
        </ViewBase>
    );
}

export default App;
