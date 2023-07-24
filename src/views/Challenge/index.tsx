import { useDispatch } from "react-redux";

import { useState } from "react";
import { Grid, OutlinedInput, Zoom } from "@material-ui/core";
import "./challenge.scss";
import {GameStateInfo, GameState} from "../../models/models"
import { useHistory } from "react-router-dom";
import { usePathForNetwork } from "../../hooks";
import { AVAILABLE_CHAINS } from "../../constants/blockchain";
import { store } from "src/store/appStore";
import { GameContractReadHelper } from "src/models/GameContractReadHelper";
import { setupGameListDropDown } from "src/helpers/viewsHelper";
import { messages } from "src/constants/messages";
import { warning } from "src/store/slices/messages-slice";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";
import { BigNumber } from "ethers";
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";
import GameTooltip from "src/components/Tooltip/GameTooltip";
import LiquidityBanner from "src/components/InfoBanner";

function Challenge() {

    store.refreshWeb3Helper()
    const web3Helper = store.getWeb3Helper()
    const gameContractReadHelper = new GameContractReadHelper(web3Helper)

    const dispatch = useDispatch();
    const history = useHistory();
    const [isConnected] = useState(web3Helper.connected);

    let gameCount: number = -1;
    let selectedGameId: number = -1;

    usePathForNetwork({ pathName: "archive", networkID: web3Helper.chainID, history });

    function challenge(id: number) {
        if(web3Helper.address == null || web3Helper.address.length ==0) {
            web3Helper.connect();
        }
        if (isConnected && !AVAILABLE_CHAINS.includes(web3Helper.providerChainID)) {
            web3Helper.checkWrongNetwork();
        }

        if (false /*game state incoorect*/) {
            console.log("something went wront. Try again")
            dispatch(warning({ text: messages.nothing_to_claim }));
            //toDO: toast
            return
        }

        switch(id) {
            case 0:
                const privKey = (document.getElementById("challengeInput_privateKey") as HTMLInputElement).value
                if(!isBigNumberish(privKey)) {
                    dispatch(warning({ text: messages.invalid_input }));
                    return
                }
                gameContractReadHelper.executeChallengePrivateKeyLeak(selectedGameId, BigNumber.from(privKey), function(err: any) {
                    metamaskErrorWrap(err, dispatch);
                })
                break;
            case 1:
                gameContractReadHelper.executechallengeResultPrivateKey(selectedGameId, function(err: any) {
                    metamaskErrorWrap(err, dispatch);
                })
                break;
            case 2:
                gameContractReadHelper.executeChallengeResultVoteCounting(selectedGameId, function(err: any) {
                    metamaskErrorWrap(err, dispatch);
                })
                break;
            case 3:
                const voteId = parseInt((document.getElementById("challengeInput_voteId") as HTMLInputElement).value)
                if(isNaN(voteId)) {
                    dispatch(warning({ text: messages.invalid_input }));
                    return
                }
                gameContractReadHelper.executechallengeResultDecryption(selectedGameId, voteId, function(err: any) {
                    metamaskErrorWrap(err, dispatch);
                })
                break;
        }
    }

    const challengeHTML = (
        <div className="challenge-view">
            <div className="challenge-infos-wrap">
                <Zoom in={true}>
                    <Grid container spacing={4} id ="challengeCard">
                        <select id="dropdown" className="minimal"></select>
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <div className="challenge-card-desc-top">
                                <p id= "challengeDesc" className="challenge-card-desc-title"></p>
                            </div>
                            <div className="challenge-card-desc">
                                <p id= "challengeDesc2" className="challenge-card-desc-title"></p>
                            </div>
                        </Grid>

                        <Grid item lg={12} md={12} sm={12} xs={12} id= "pre" style={{display:'none'}}>
                            <div className="challenge-card">
                                <p className="card-title">
                                    Challenge Private Key Leak
                                    <GameTooltip title={"Challenge the knowledge of private key during the Voting phase of game."}>
                                    </GameTooltip>
                                </p>

                                <div className="stake-card-action-row">
                                    <OutlinedInput
                                        id="challengeInput_privateKey"
                                        type="BigInt"
                                        placeholder="Private Key Hex"
                                        className="stake-card-action-input"
                                        labelWidth={0}
                                    />

                                    <div className="stake-card-tab-panel">
                                            <div
                                                className="stake-card-tab-panel-btn"
                                                onClick={() => {
                                                    challenge(0)
                                                }}
                                            >
                                            <p>{"Challenge"}</p>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xs={12} id="post1" style={{display:'none'}}>
                            <div className="challenge-card">
                                <p className="card-title">
                                    Private Key
                                    <GameTooltip title={"Challenge if published private key does not corresponds to game public key."}></GameTooltip>
                                </p>

                                <div className="stake-card-action-row">
                                    <div className="stake-card-tab-panel">
                                            <div
                                                className="stake-card-tab-panel-btn"
                                                onClick={() => {
                                                    challenge(1)
                                                }}
                                            >
                                            <p>{"Challenge"}</p>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xs={12} id="post2" style={{display:'none'}}>
                            <div className="challenge-card">
                                <p className="card-title">
                                    Vote Counting
                                    <GameTooltip title={"Challenge if minorityChoice and minorityCount published does not correspond to the published decryptedVotesList."}></GameTooltip>
                                </p>

                                <div className="stake-card-action-row">
                                    <div className="stake-card-tab-panel">
                                            <div
                                                className="stake-card-tab-panel-btn"
                                                onClick={() => {
                                                    challenge(2)
                                                }}
                                            >
                                            <p>{"Challenge"}</p>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </Grid>

                        <Grid item lg={12} md={12} sm={12} xs={12} id="post3" style={{display:'none'}}>
                            <div className="challenge-card">
                                <p className="card-title">
                                    Vote Decryption
                                    <GameTooltip title={"Challenge if vote corresponds to voteId in the published result is not correct."}></GameTooltip>
                                </p>

                                <div className="stake-card-action-row">
                                    <OutlinedInput
                                        id="challengeInput_voteId"
                                        type="number"
                                        placeholder="voteId"
                                        className="stake-card-action-input"
                                        labelWidth={0}
                                    />

                                    <div className="stake-card-tab-panel">
                                            <div
                                                className="stake-card-tab-panel-btn"
                                                onClick={() => {
                                                    challenge(3)
                                                }}
                                            >
                                            <p>{"Challenge"}</p>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </Grid>

                        <LiquidityBanner msg={'Challenge the correctness of the published result for a game by triggering an on-Chain computation.'} />
                    </Grid>
                </Zoom>
            </div>
        </div>
    );

    async function loadDOMForGame() {
        if(gameCount >= 0) {
            selectedGameId = gameCount-1
            
            setupGameListDropDown(document, selectedGameId, function(gameId: number) {
                selectedGameId = gameId
                SetGameDependentResources(selectedGameId)
            })
            SetGameDependentResources(selectedGameId)
        }
    }

    function setupPrePostChallengesAsAvailable(gameState: GameState) {
        var challengeDesc = document.getElementById("challengeDesc")
        var challengeDesc2 = document.getElementById("challengeDesc2")
        var pre = document.getElementById("pre")
        var post1 = document.getElementById("post1")
        var post2 = document.getElementById("post2")
        var post3 = document.getElementById("post3")
        if(gameState == 'VOTING_STARTED'){
            if(challengeDesc != null) {
                challengeDesc.textContent = "Voting is in progress for the game."
            }
            if(challengeDesc2 != null) {
                challengeDesc2.textContent = "Following challenge options are available during the voting phase:"
            }
            if(pre != null) {
                pre.style.display = "block"
            }
            if(post1 != null) {
                post1.style.display = "none"
            }
            if(post2 != null) {
                post2.style.display = "none"
            }
            if(post3 != null) {
                post3.style.display = "none"
            }
        }
        else if (gameState == 'RESULT_PUBLISHED') {
            if(challengeDesc != null) {
                challengeDesc.textContent = "Results have been published for the game."
            }
            if(challengeDesc2 != null) {
                challengeDesc2.textContent = "Following challenge options are available :"
            }
            if(pre != null) {
                pre.style.display = "none"
            }
            if(post1 != null) {
                post1.style.display = "block"
            }
            if(post2 != null) {
                post2.style.display = "block"
            }
            if(post3 != null) {
                post3.style.display = "block"
            }
        }
        else {
            if(challengeDesc != null) {
                challengeDesc.textContent = "No challenges currently active for this game!"
            } 
            if(challengeDesc2 != null) {
                challengeDesc2.textContent = "Checkout other games."
            }
            if(pre != null) {
                pre.style.display = "none"
            }
            if(post1 != null) {
                post1.style.display = "none"
            }
            if(post2 != null) {
                post2.style.display = "none"
            }
            if(post3 != null) {
                post3.style.display = "none"
            }
        }
    }

    function showFishBowl() {
        var challengeCard = document.getElementById("challengeCard")
        if(challengeCard != null) {
            challengeCard.style.display = "none";
        }
    }

    function SetGameDependentResources(gameId : number) {
        gameContractReadHelper.fetchGamesState(gameId).then((info: GameStateInfo) => {
            setupPrePostChallengesAsAvailable(info.gameState)
        }).catch(error => {
            console.log("rejected", error);
        })
    }

    async function runDOMLoadingScript(){
        gameContractReadHelper.fetchGamesCount().then(cnt => {
            gameCount = cnt.toNumber()
            loadDOMForGame()
        }).catch(error => {
            console.log("rejected", error);
        });
    }

    if (document.readyState === "complete") {
        runDOMLoadingScript();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            runDOMLoadingScript();
        });
    }

    return challengeHTML;
}

export default Challenge;
