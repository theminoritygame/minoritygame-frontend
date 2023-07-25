import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { usePathForNetwork } from "../../hooks";
import { Grid, Zoom } from "@material-ui/core";
import ConnectButton from "../../components/Header/connect-button";
import FishBowlImage from "../../assets/images/cutecat.png";
import "./game.scss";
import { useHistory } from "react-router-dom";
import { AVAILABLE_CHAINS } from "../../constants/blockchain";
import * as elliptic from 'elliptic';
import { BigNumber } from "ethers";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { ActiveVoteInfo, GameStateInfo, GameStaticInfo } from "../../models/models"
import { GameContractReadHelper } from "../../models/GameContractReadHelper"
import { store } from "src/store/appStore";
import { Skeleton } from "@material-ui/lab";
import VoteSuccessDialog from "./components/VoteSuccessDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { showCountdown } from "src/helpers/TimeAndStateHelpers";
import { fetchBnbToUsdRate } from "src/helpers/gameOperationsHelper";
import { convertToBNBFromWei, convertToUsd } from "src/helpers/price-helper";
import GameTooltip from "src/components/Tooltip/GameTooltip";
import gameSlice, { GameSliceState, refreshGameData, updateTotalVotes } from "src/store/slices/game-slice";
import { RootState } from "src/store/store";

interface GameLocalState {
    readonly selectedOption: number | undefined,
    readonly currentNumberOfVotes: number
}

const defaultGameLocalState: GameLocalState = {
    selectedOption: undefined,
    currentNumberOfVotes: 1
}

var activeVoteInfo: ActiveVoteInfo | undefined = undefined

function Game() {
    const ecObject = new elliptic.ec('p256');
    const dispatch = useDispatch();
    const history = useHistory();

    store.refreshWeb3Helper()
    const web3Helper = store.getWeb3Helper()
    const gameHelper = store.getGameHelper()
    const gameContractReadHelper = new GameContractReadHelper(web3Helper)

    const [isConnected] = useState(web3Helper.connected);

    const [gameLocalState, setGameLocalState] = useState<GameLocalState>(defaultGameLocalState)
    const [voteSuccessDialogOpen, setVoteSuccessDialogOpen] = useState(false)
    const [isVotingInProgress, setIsVotingInProgress] = useState(false)
    const [bnbToUsdRate, setBnbToUsdRate] = useState<number | undefined>(undefined)
    const timer = useRef<NodeJS.Timer | undefined>(undefined);
    const timerStmt = useRef<string>("")
    
    const gameInfo: GameSliceState = useSelector((state: RootState) => state.gameInfo);

    usePathForNetwork({ pathName: "game", networkID: web3Helper.chainID, history });

    const GameDivHtml = (
        <div className="game-view">
            <Zoom in={true}>
                <div className="game-card" id="gameCardDiv">
                    {(gameInfo.gameID != undefined) ? (
                        <Grid className="game-card-grid" container direction="column" spacing={2} id="validGameCard">
                            <Grid item className="game-card-grid-item">
                                <div className="game-card-info">
                                    <Grid item lg={12} md={12} sm={12} xs={12} className="game-side-gameId">
                                        <p className="game-card-metrics-gameId" id="gameIdDiv">
                                            Game Id: {gameInfo.gameID}
                                        </p>
                                    </Grid>

                                    <Grid item lg={12} md={12} sm={12} xs={12} className="game-title">
                                        {gameInfo.assets?.info ? (
                                            <div className="game-card-topbar">
                                                <p id="question" className="game-card-header-title">{gameInfo.assets.info.question}</p>
                                                <p className="game-card-header-subtitle">[Remember, people who choose what minority chooses win]</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <Skeleton variant="text" width={600} height={100} animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0)' }} />
                                            </div>
                                        )}
                                    </Grid>

                                    <Grid item lg={12} md={12} sm={12} xs={12} className="game-side">
                                        {gameInfo.gameID != undefined && gameInfo.gameStateInfo && gameInfo.gameStaticInfo && gameInfo.totalVotes != undefined && (
                                            <div className="game-card-topbar">
                                                <p className="game-card-metrics-timer-container">
                                                    <span className="game-card-metrics-timer" id="timer">{getTimingStatement(gameInfo.gameID, gameInfo.gameStateInfo, gameInfo.gameStaticInfo)}</span>
                                                    <span className="game-card-countdown" id="countdownGame"></span>
                                                </p>
                                                <p className="game-card-metrics-totalVotesCasted" id="totalVotesCasted">
                                                    Total votes casted: {gameInfo.totalVotes}
                                                </p>
                                            </div>
                                        )}
                                    </Grid>

                                </div>
                                <div className="game-card-metrics">

                                    <Grid item xs={12} sm={12} style={{ display: "flex", alignItems: "center" }}>
                                        {gameInfo.assets ? (
                                            <div id="option0" onClick={() => optionSelected(0)} className="game-card-apy">
                                                <div className={`option-card ${gameLocalState.selectedOption == 0 ? 'selectedOptionCard' : ''}`}>
                                                    <div className="image-container">
                                                        <img id="optionImg0" className="game-card-metrics-option-image" alt="" src={gameInfo.assets.imgSrc0} />
                                                        {gameLocalState.selectedOption == 1 && <div className="overlay"></div>}
                                                        {/* {gameLocalState.selectedOption == 0 && <div id="back-layer" className="back-layer"></div>} */}
                                                    </div>
                                                    <p id="optionName0" className="game-card-metrics-title"> {gameInfo.assets.info.option0} </p>
                                                </div>
                                            </div>

                                        ) : (
                                            <div className="game-card-apy">
                                                <Skeleton variant="rect" width={250} height={250} animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0.2)' }} />
                                            </div>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={12} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Grid container direction="column" spacing={2} id="validGameCard">
                                            <Grid item style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {gameInfo.gameStaticInfo &&
                                                    <div className="game-card-vote-counter" >
                                                        <button id="decrement" className="plusMinus" onClick={() => onCounterUpdated("decrement")}>–</button>
                                                        <input id="currentVotes" className="currentVotes" type="number" value={gameLocalState.currentNumberOfVotes} onChange={onVotesChanged} />
                                                        <button id="increment" className="plusMinus" onClick={() => onCounterUpdated("increment")}>+</button>
                                                    </div>
                                                }
                                            </Grid>
                                            <Grid item >
                                                {gameInfo.gameStaticInfo &&
                                                    <p id="currentVotesValue" className="currentVotesValue" >{`${gameLocalState.currentNumberOfVotes} Vote(s) = ${getCostString(gameInfo.gameStaticInfo?.mintPrice?.mul(gameLocalState.currentNumberOfVotes))}`} </p>
                                                }
                                            </Grid>
                                            <Grid item>
                                                <div className="game-card-wallet-notification">
                                                    {web3Helper.address && web3Helper.address != "" && AVAILABLE_CHAINS.includes(web3Helper.providerChainID) && (
                                                        <>
                                                            <div className="game-card-wallet-submit-btn"
                                                                onClick={() => {
                                                                    submitVotes();
                                                                }}>

                                                                {isVotingInProgress ? (
                                                                    <FontAwesomeIcon icon={faCircleNotch} size="2x" color='white' spin />
                                                                ) : (
                                                                    <p id="submitVotes">Submit</p>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}

                                                    {web3Helper.address == null || web3Helper.address.length == 0 && (
                                                        <>
                                                            <div className="game-card-wallet-connect-btn">
                                                                <ConnectButton />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </Grid>
                                            <Grid item>
                                                {gameInfo.gameID != undefined && gameInfo.gameStaticInfo && (
                                                    <div className="game-card-wallet-desc-text">
                                                        <p id="potentialWin">
                                                            If you win you receive atleast 2x
                                                        </p>
                                                        <GameTooltip title={getPayoutDesciption()}></GameTooltip>
                                                    </div>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12} sm={12} style={{ display: "flex", alignItems: "center" }}>
                                        {gameInfo.assets ? (
                                            <div id="option1" onClick={() => optionSelected(1)} className="game-card-apy">
                                                {/* {gameLocalState.selectedOption == 1 && <div id="back-layer" className="back-layer"></div>} */}
                                                <div className={`option-card ${gameLocalState.selectedOption == 1 ? 'selectedOptionCard' : ''}`}>
                                                    <div className="image-container">
                                                        <img id="optionImg1" className="game-card-metrics-option-image" alt="" src={gameInfo.assets.imgSrc1} />
                                                        {gameLocalState.selectedOption == 0 && <div className="overlay"></div>}
                                                    </div>
                                                    <p id="optionName1" className="game-card-metrics-title"> {gameInfo.assets.info.option1} </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="game-card-apy">
                                                <Skeleton variant="rect" width={250} height={250} animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0.2)' }} />
                                            </div>
                                        )}
                                    </Grid>

                                </div>
                            </Grid>
                        </Grid>
                    ) : (
                        <div id="fishBowlDiv" className="fishbowl-empty">
                            <div className="fishbowl-empty-image-container">
                                <img id="imgFishbowl" className="fishbowl-empty-image" alt="" src={FishBowlImage} />
                                <div className="overlay"></div>
                            </div>
                            <div className="fishbowl-empty-text">
                                <p>Uh-Oh! There are currently no games in voting phase.<br />
                                    We will be back soon with more.<br />
                                    Feel free to check out the archive section meanwhile!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Zoom>
            <VoteSuccessDialog
                open={voteSuccessDialogOpen}
                onClose={() => {
                    activeVoteInfo = undefined
                    setVoteSuccessDialogOpen(false)
                }}
                voteInfo={activeVoteInfo}
            />
        </div>
    );

    
    useEffect(() => {
        dispatch(refreshGameData(gameHelper))

        if (gameLocalState.selectedOption == undefined) {
            optionSelected(0) //selecting option 0 by default
            return
        }

        if (bnbToUsdRate == undefined) {
            fetchBnbToUsdRate().then((rate) => setBnbToUsdRate(rate)).catch((err) => console.log('failed', err))
            return
        }
    })

    useEffect(() => {    
        // Cleanup function when the component is unmounted
        return () => {
            if (timer.current != undefined) {
                clearInterval(timer.current)
            }
        };
      }, []);
      
    async function refreshTotalVotesCnt() {

        const gameId = gameInfo.gameID
        if (gameId != undefined) {
            try {
                const totalVotes = await gameContractReadHelper.fetchTotalVotesCasted(gameId)
                dispatch(updateTotalVotes(totalVotes.toNumber()))
            } catch (err: any) {
                console.log("rejected", err);
            }
        }
    }

    function getTimingStatement(gameID: number, gameStateInfo: GameStateInfo, staticInfo: GameStaticInfo) {
        if (timer.current == undefined) {
            const timerActive = showCountdown(staticInfo, gameStateInfo, "countdownGame",
            (x) => {
                timer.current = x
            },
            () => {
                timer.current = undefined
                // clear and trigger re-render to fetch latest states
                setGameLocalState({ ...defaultGameLocalState })
            })

            let stmt = ""
            switch (gameStateInfo.gameState) {
                case "INITIAL": {
                    stmt = "Voting started"
                    break;
                }
                case "VOTING_STARTED": {
                    stmt = (timerActive) ? "Voting ends in " : "Voting about to end"
                    break;
                }
                case "VOTING_ENDED": {
                    stmt = "Voting ended. Results will be published for Game" + gameID + "in some time"
                    break;
                }
                case "RESULT_PUBLISHED": {
                    stmt = "Results published"
                    break;
                }
                case "RESULT_LOCKED": {
                    stmt = "Challenge phase ended"
                    break;
                }
                case "FUCKED_UP":
                default: {
                    break;
                }
            }
            timerStmt.current = stmt;
        }
        return timerStmt.current;
    }

    function optionSelected(option: number) {
        setGameLocalState({ ...gameLocalState, selectedOption: option })
    }

    function onCounterUpdated(dir: string) {
        let cnt = gameLocalState.currentNumberOfVotes;
        if (dir === "increment") {
            setGameLocalState({ ...gameLocalState, currentNumberOfVotes: cnt + 1 })
        }
        else if (dir === "decrement") {
            if (cnt > 1) {
                setGameLocalState({ ...gameLocalState, currentNumberOfVotes: cnt - 1 })
            }
        }
    }

    function onVotesChanged(event: { target: { value: string; }; }) {
        const newValue = parseInt(event.target.value, 10);
        if (!isNaN(newValue)) {
            setGameLocalState({ ...gameLocalState, currentNumberOfVotes: newValue })
        }
    }

    function getVoteTimeStatement(): string {
        if (gameInfo.gameStateInfo != undefined) {
            var duration = 0
            if (gameInfo.gameStateInfo.gameState == 'VOTING_STARTED' && gameInfo.gameStaticInfo != undefined) {
                duration = gameInfo.gameStaticInfo.durationVoting + gameInfo.gameStaticInfo.durationResultPublish
            } else {
                return ""
            }

            const now: number = Math.floor(Date.now() / 1000); // Unix timestamp in ms
            var distance = gameInfo.gameStateInfo.currentStateStartedTime + duration - now
            if (distance > 0) {
                const hours = Math.floor(distance / 3600);
                const minutes = Math.floor((distance / 60) % 60);
                const seconds = Math.floor(distance % 60);

                return "Results will be published in   " + hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + " hrs!";
            }
        }
        return "Results will be published in a few mins!"
    }

    function submitVotes() {
        if (isVotingInProgress) {
            return
        }
        let gameID = gameInfo.gameID
        let gameStaticInfo = gameInfo.gameStaticInfo
        if (gameID == undefined || !gameStaticInfo) {
            return
        }
        if (web3Helper.address == null || web3Helper.address.length == 0) {
            web3Helper.connect();
        }
        if (isConnected && !AVAILABLE_CHAINS.includes(web3Helper.providerChainID)) {
            web3Helper.checkWrongNetwork();
        }

        const selectedOption = gameLocalState.selectedOption
        const nVotes = gameLocalState.currentNumberOfVotes
        if ((selectedOption != 0 && selectedOption != 1) || nVotes < 1) {
            console.log("invalid option")
            dispatch(warning({ text: messages.nothing_selected }));
            // TODO: show/indicate error
            return
        }

        const encryptedVote = getEncrypedVote(selectedOption, gameStaticInfo.publicKey[0], gameStaticInfo.publicKey[1])
        if (encryptedVote == undefined) {
            console.log("something went wront. Try again")
            dispatch(warning({ text: messages.nothing_to_claim }));
            //toDO: toast
        } else {
            activeVoteInfo = {
                gameId: gameID,
                cnt: nVotes,
                secret: encryptedVote.getPrivate().toString(),
                choiceIndex: selectedOption,
                choiceName: (selectedOption == 0 ? gameInfo.assets?.info?.option0 : gameInfo.assets?.info?.option1) ?? "",
                state: false,
                voteTimeStatement: getVoteTimeStatement()
            }

            const onVoteSuccess = function () {
                if (activeVoteInfo != null) {
                    activeVoteInfo = {
                        ...activeVoteInfo,
                        state: false
                    }
                }
                setIsVotingInProgress(false)
                refreshTotalVotesCnt()
                setVoteSuccessDialogOpen(true)
            }

            const onVoteError = function (err: any) {
                setIsVotingInProgress(false)
                metamaskErrorWrap(err, dispatch);
            }

            setIsVotingInProgress(true)
            if (nVotes > 1) {
                gameContractReadHelper.executeTxVoteMultiple(
                    gameID,
                    Array(nVotes).fill([encryptedVote.getPublic().getX().toString(), encryptedVote.getPublic().getY().toString()]),
                    gameStaticInfo.mintPrice.mul(nVotes),
                    onVoteSuccess,
                    onVoteError
                )
            } else {
                gameContractReadHelper.executeTxVote(
                    gameID,
                    [encryptedVote.getPublic().getX().toString(), encryptedVote.getPublic().getY().toString()],
                    gameStaticInfo.mintPrice,
                    onVoteSuccess,
                    onVoteError
                )
            }
        }
    }

    function getEncrypedVote(v: number, publicKeyX: BigNumber, publicKeyY: BigNumber): elliptic.ec.KeyPair | undefined {
        for (let i = 0; i < 100; i++) {
            const key = ecObject.genKeyPair();
            if (key.getPublic().getX().toString() === '0' || key.getPublic().getY().toString() === '0') {
                continue;
            }
            const sharedSecret = BigNumber.from(
                ecObject.keyFromPublic({
                    x: publicKeyX.toBigInt().toString(16),
                    y: publicKeyY.toBigInt().toString(16)
                }).getPublic().mul(key.getPrivate()).getX().toString()
            );
            if (sharedSecret.mod(2).eq(v)) {
                return key;
            }
        }
        return undefined;
    }

    function getCostString(priceWei: BigNumber): string {
        const bnbAmount = convertToBNBFromWei(priceWei);
        const usdAmount = convertToUsd(parseFloat(bnbAmount), bnbToUsdRate)
        return `${bnbAmount} BNB` + (usdAmount == undefined ? "" : ` ($${usdAmount})`)
    }

    function getPayoutDesciption(): string {
        return "In addition to twice the bet amount, you get a part of initial pot as set by the host."
    }
    return GameDivHtml;
}

export default Game;
