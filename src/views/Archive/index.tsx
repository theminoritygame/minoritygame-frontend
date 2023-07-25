import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Grid, Zoom } from "@material-ui/core";
import "./archive.scss";
import { useHistory } from "react-router-dom";
import { usePathForNetwork } from "../../hooks";
import LiquidityBanner from "../../components/LiquidityBanner";
import {GameAssets, GameStaticInfo, GameStateInfo, GameResultInfo} from "../../models/models"
import { store } from "src/store/appStore";
import { GameContractReadHelper } from "src/models/GameContractReadHelper";
import { fetchResources, getGameAssetUrls } from "src/helpers/ipfsAssetsHelper";
import { setupGameListDropDown } from "src/helpers/viewsHelper";
import { Skeleton } from "@material-ui/lab";
import { claimPrize, fetchGameResults } from "src/helpers/gameOperationsHelper";
import { getGameStateDesc1, getGameStateDesc2AndSetTimer } from "src/helpers/TimeAndStateHelpers";
import GameDialog from "src/components/GameDialog/GameDialog";
import { BigNumber } from "ethers";
import { warning } from "src/store/slices/messages-slice";
import { messages } from "src/constants/messages";
import { convertToBNBFromWei } from "src/helpers/price-helper";

interface ArchiveSlice {
    readonly selectedGameId: number | undefined,
    readonly gameStaticInfo: GameStaticInfo | undefined,
    readonly gameStateInfo: GameStateInfo | undefined,
    readonly gameResultInfo: GameResultInfo | undefined,
    readonly assets: GameAssets | undefined
}

const defaultArchiveSlice: ArchiveSlice = {
    selectedGameId : undefined,
    gameStaticInfo : undefined,
    gameStateInfo : undefined,
    gameResultInfo : undefined,
    assets : undefined
}

interface ClaimDialogInfo {
    readonly showDialog: boolean,
    readonly gameId: number,
    readonly winningVotes: [BigNumber, boolean][],
    readonly unclaimedVotes: BigNumber[],
    readonly burnPrice: BigNumber
}

function Archive() {

    store.refreshWeb3Helper()
    const web3Helper = store.getWeb3Helper()
    const gameContractReadHelper = new GameContractReadHelper(web3Helper)

    const dispatch = useDispatch();
    const history = useHistory();
    const [isConnected] = useState(web3Helper.connected);

    const [archiveSlice, setArchiveSlice] = useState<ArchiveSlice>(defaultArchiveSlice)
    const [gameCount, setGameCount] = useState<number| undefined>(undefined)
    const totalVotesLocal = useRef<number| undefined>(undefined)
    const userVotesLocal = useRef<number| undefined>(undefined)

    // const [showClaimPrizeDialog, setShowClaimPrizeDialog] = useState(false)
    const [claimDialogInfo, setClaimDialogInfo] =useState<ClaimDialogInfo | undefined>(undefined)

    usePathForNetwork({ pathName: "archive", networkID: web3Helper.chainID, history });
    const timer = useRef<NodeJS.Timer | undefined>(undefined);

    const ArchiveHtml = (
        <div className="archive-view">
            <Zoom in={true}>
                <div className="archive-card">
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <select id="dropdown" className="minimal" style={{height: 'fit-content'}}></select>
                        <Grid item lg={12} md={12} sm={12} xs={12} className="game-side">
                            <div className="game-card-topbar">
                                {totalVotesLocal.current != undefined && (
                                <p className="game-card-metrics-totalVotesCasted" id="totalVotesCasted">
                                    Total vote count: {totalVotesLocal.current}
                                </p>
                                )}
                                { userVotesLocal.current != undefined && (
                                <p className="game-card-metrics-totalVotesCasted" id="totalVotesCasted">
                                    Your vote count: {userVotesLocal.current}
                                </p>
                                )}
                            </div>
                        </Grid>
                    </div>

                    { (archiveSlice.gameStateInfo && archiveSlice.gameStaticInfo) ? (
                        <div>
                            <div className="challenge-card-desc-top">
                                <p id= "challengeDesc" className="challenge-card-desc-title"> {getGameStateDesc1(archiveSlice.gameStateInfo.gameState)} </p>
                            </div>
                            <div className="challenge-card-desc">
                                <p>
                                    <span id= "challengeDesc2" className="challenge-card-desc-title">{
                                        getTimeStatement(archiveSlice.gameStaticInfo, archiveSlice.gameStateInfo)
                                    }</span>
                                    <span id="countdownArchive" className="challenge-card-desc-title"></span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Skeleton variant="rect" style={{ backgroundColor: 'none', height: "90px" }} />
                    )}
                    <table id="resultsTable" style={{marginTop: "20px"}}>
                        <tr>
                            <td className="td tq" colSpan={3}>{archiveSlice.assets?.info?.question ?? ""}&nbsp;</td>
                        </tr>
                        <tr>
                            <td className="td" id= "optionImg"></td>
                            <td className={getCellClassWithDecoration(0)}>
                                {archiveSlice.assets ? (
                                    <img id= "optionImg0" className = "cell-image" src={archiveSlice.assets.imgSrc0}/>
                                ) : (
                                    <Skeleton variant="rect" className = "cell-image" animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0.2)' }} />
                                )}
                            </td>
                            <td className={getCellClassWithDecoration(1)}>
                                {archiveSlice.assets ? (
                                    <img id= "optionImg1" className = "cell-image"  src={archiveSlice.assets.imgSrc1}/>
                                ) : (
                                    <Skeleton variant="rect" className = "cell-image" animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0.2)' }} />
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td className="td" id="optionName">Options</td>
                            <td className={getCellClassWithDecoration(0)} id="optionName0">{archiveSlice.assets?.info?.option0 ||  "Option 0"}</td>
                            <td className={getCellClassWithDecoration(1)} id="optionName1">{archiveSlice.assets?.info?.option1 ||  "Option 1"}</td>
                        </tr>
                        {archiveSlice.gameResultInfo && (
                        <tr>
                            <td className="td" id="totalVotes">Total Votes</td>
                            <td className={getCellClassWithDecoration(0)} id="totalVotes0">{getTotalVotesValueFor(0)}</td>
                            <td className={getCellClassWithDecoration(1)} id="totalVotes1">{getTotalVotesValueFor(1)}</td>
                        </tr>
                        )}
                        {archiveSlice.gameResultInfo?.myTotalVotes != undefined && archiveSlice.gameResultInfo.winningChoice.toNumber() < 2 && (
                        <tr>
                            <td className="td" id="decryptVotes">My Votes</td>
                            <td className={getCellClassWithDecoration(0)} id="myVotes0">{getMyVotesValueFor(0)}</td>
                            <td className={getCellClassWithDecoration(1)} id="myVotes1">{getMyVotesValueFor(1)}</td>
                        </tr>
                        )}
                    </table>
                    {archiveSlice.gameResultInfo?.myTotalVotes != undefined && archiveSlice.gameResultInfo.winningChoice.toNumber() == 2 && (
                        <div className="archive-card-header">
                            <p className="archive-card-table-text">Game has been tied!
                            <br />your total vote count: {archiveSlice.gameResultInfo?.myTotalVotes.length}</p>
                        </div>
                    )}
                    {((archiveSlice.gameResultInfo?.myWinningVotes?.length && archiveSlice.gameStateInfo?.gameState == 'RESULT_LOCKED') || archiveSlice.gameStateInfo?.gameState == 'FUCKED_UP' && isConnected) && (
                        <div id= "claimPrize" className="claimPrize" onClick= {() => {
                                prepareClaimPrizeDialog()
                            }}>
                            <LiquidityBanner/>
                        </div>
                    )}
                </div>
            </Zoom>
            <GameDialog
                isOpen={claimDialogInfo?.showDialog == true}
                onClose={()=>{setClaimDialogInfo(undefined)}}
                onConfirm={()=>{
                    if (claimDialogInfo != undefined) {
                        setClaimDialogInfo({...claimDialogInfo, showDialog: false})
                        invokeClaimPrize()
                    }
                }}
                title="Claim the Winnings"
                message={<div>{getClaimDialogBody()}</div>}
                isConfirmActionAllowed={anyUnclaimedVote()}
                confirmButtonText="CLAIM"
                dismissButtonText="CANCEL"
            >
            </GameDialog>
        </div>
    );
      
    
    fetchGameCount();

    useEffect(()=> {
        fetchGameInfoIfNeeded()
    }, [gameCount])

    useEffect(()=> {
        if (archiveSlice.gameStaticInfo?.assetsCID != undefined && archiveSlice.assets == undefined) {
            fetchResources(archiveSlice.gameStaticInfo?.assetsCID, (assets: GameAssets)=> {
                setArchiveSlice({...archiveSlice, assets:  assets})
            })
        }
    }, [archiveSlice.gameStaticInfo])

    useEffect(() => {    
        // Cleanup function when the component is unmounted
        return () => {
            if (timer.current != undefined) {
                clearInterval(timer.current)
            }
        };
      }, []);

    async function fetchGameCount() {
        gameContractReadHelper.fetchGamesCount().then(cnt => {
            if (cnt.toNumber() != gameCount)
                setGameCount(cnt.toNumber())
        }).catch(error => {
            console.log("rejected", error);
        });
    }

    function getTimeStatement(gameStaticInfo: GameStaticInfo, gameStateInfo: GameStateInfo): string {
        if (timer.current != undefined) {
            clearInterval(timer.current);
        }
        return getGameStateDesc2AndSetTimer(gameStaticInfo, gameStateInfo, "countdownArchive",
        (x)=> {
            timer.current = x
        }, 
        ()=>{
            timer.current = undefined
            // clear and trigger re-render to fetch latest states
            setArchiveSlice({...defaultArchiveSlice})
        })
    }

    async function fetchGameInfoIfNeeded() {
        if(gameCount != undefined && gameCount >= 0) {
            let selectedGameId = archiveSlice.selectedGameId
            if (selectedGameId == undefined) {
                selectedGameId = gameCount-1
                fetchGameInfo(selectedGameId)
                
                setupGameListDropDown(document, selectedGameId, function(gameId: number) {
                    setArchiveSlice({...defaultArchiveSlice, selectedGameId: gameId})
                    fetchGameInfo(gameId)
                })
            }
            // Todo update list based on latest
        }
    }

    function getCellClassWithDecoration(option: number): string {
        const winningChoice = archiveSlice.gameResultInfo?.winningChoice?.toNumber()
        
        if(winningChoice == undefined || winningChoice < 0 || winningChoice > 1) {
            return "td"
        }
        if (winningChoice == option) {
            return "td win"
        }
        return "td lose"
    }

    function getTotalVotesValueFor(option: number): string {
        const winningChoice = archiveSlice.gameResultInfo?.winningChoice.toNumber()
        if (winningChoice == undefined || winningChoice < 0 || winningChoice > 2) {
            return "NaN"
        }

        if (winningChoice == 2) {
            const totalVotes = archiveSlice.gameResultInfo?.winningVotes?.toNumber()
            return totalVotes != undefined? Math.floor(totalVotes/2).toString() : "NaN"
        }
        let winningVotes = archiveSlice.gameResultInfo?.winningVotes?.toString() ?? "NaN"
        let losingVotes = archiveSlice.gameResultInfo?.losingVotes?.toString() ?? "NaN"
        
        if (winningChoice == option) {
            return winningVotes
        }
        return losingVotes
    }


    function getMyVotesValueFor(option: number): string {
        const winningChoice = archiveSlice.gameResultInfo?.winningChoice.toNumber()
        if (winningChoice == undefined || winningChoice < 0 || winningChoice > 1) {
            return "NaN"
        }

        let myWinningVotes = archiveSlice.gameResultInfo?.myWinningVotes?.length?.toString() ?? "NaN"
        let myLosingVotes = archiveSlice.gameResultInfo?.myLosingVotes?.toString() ?? "NaN"
        
        if (winningChoice == option) {
            return myWinningVotes
        }
        return myLosingVotes
    }

    async function getGameResults(gameId: number): Promise<GameResultInfo> {
        try {
            const result = fetchGameResults(gameContractReadHelper, web3Helper.address, gameId)
            return result
        } catch (error) {
            console.log(error)
            throw new Error("failed fetchGameResults");
        }
    }

    async function fetchGameInfo(gameId : number) {
        try {
            const infoPromise = gameContractReadHelper.fetchGameStaticInfo(gameId)
            const statePromise = gameContractReadHelper.fetchGamesState(gameId)
            const totalVotes = gameContractReadHelper.fetchTotalVotesCasted(gameId)
            
            if (web3Helper.connected) {
                gameContractReadHelper.fetchVotesCastedBy(gameId, web3Helper.address).then( (res)=> {
                    userVotesLocal.current = res.length
                }).catch(err => {
                    console.log('failed getting user vote cnt')
                })
            }

            const info = await infoPromise
            const state = await statePromise
            const tvotes = await totalVotes
            totalVotesLocal.current = tvotes.toNumber()
            

            getGameResults(gameId).then((resultInfo: GameResultInfo) => {
                setArchiveSlice({
                    selectedGameId: gameId,
                    gameStaticInfo: info,
                    gameStateInfo: state,
                    gameResultInfo: resultInfo,
                    assets: undefined
                })
            }).catch(error => {
                console.log("rejected", 'error getting game results');
                setArchiveSlice({
                    ...defaultArchiveSlice,
                    selectedGameId: gameId,
                    gameStaticInfo: info,
                    gameStateInfo: state
                })
            })
        } catch(error) {
            console.log("rejected", error);
        }
    }

    async function invokeClaimPrize() {
        try {
            if (claimDialogInfo == undefined) {
                return
            }
            claimPrize(web3Helper, gameContractReadHelper, dispatch, claimDialogInfo.gameId, claimDialogInfo.winningVotes)
        } catch(err) {
            console.log(err)
            dispatch(warning({ text: messages.something_wrong }));
        }
    }

    async function prepareClaimPrizeDialog() {
        try {
            const gameId = archiveSlice.selectedGameId
            if (gameId == undefined || archiveSlice.gameStateInfo == undefined || archiveSlice.gameStaticInfo ==undefined)
                return
            const winningVotes= (archiveSlice.gameStateInfo.gameState == 'FUCKED_UP') ? (await gameContractReadHelper.fetchWinningVotesOf(gameId, web3Helper.address))
                :archiveSlice.gameResultInfo?.myWinningVotes
            if (winningVotes == undefined)
                return
            const unclaimedVotes = winningVotes.filter((vote) => vote[1] == false).map((vote) => vote[0])
            const burnPrice = await gameContractReadHelper.fetchGameBurnPrice(gameId)
            setClaimDialogInfo({
                showDialog: true,
                gameId: gameId,
                winningVotes: winningVotes,
                unclaimedVotes: unclaimedVotes,
                burnPrice: burnPrice
            })
        } catch(err) {
            console.log(err)
            dispatch(warning({ text: messages.something_wrong }));
        }
    }

    function getClaimDialogBody(): JSX.Element {
        const claimInfo = claimDialogInfo
        if (claimInfo == undefined) {
            return (<div>Amount will be transaferred as BNB to your connected wallet</div>)
        }
        const unclaimedAmount = claimInfo.burnPrice.mul(claimInfo.unclaimedVotes.length)

        return (<div>
            Your Winning Votes: {claimInfo.winningVotes.length}<br></br>
            {claimInfo.winningVotes.length > 0 ? ("Your unclaimed votes: "+ claimInfo.unclaimedVotes.length.toString() + " ("+convertToBNBFromWei(unclaimedAmount).toString()+"BNB)") : "Nothing to claim"} <br></br>
            {claimInfo.winningVotes.length > 0 ? "Amount will be transaferred as BNB to your connected wallet": ""}
        </div>)
    }

    function anyUnclaimedVote(): boolean {
        const claimInfo = claimDialogInfo
        return claimInfo != undefined && claimInfo.unclaimedVotes.length > 0
    }

    return ArchiveHtml;
}

export default Archive;
