import { useState } from "react";
import { useDispatch } from "react-redux";
import { Grid, OutlinedInput, Zoom } from "@material-ui/core";
import "./claimPrize.scss";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import { useHistory } from "react-router-dom";
import { AVAILABLE_CHAINS } from "../../constants/blockchain";
import { usePathForNetwork } from "../../hooks";
import { BigNumber } from "ethers";
import { store } from "src/store/appStore";
import { GameContractReadHelper } from "src/models/GameContractReadHelper";
import { fetchResourcesAsPromise } from "src/helpers/ipfsAssetsHelper";
import { claimPrize } from "src/helpers/gameOperationsHelper";
import ConnectButton from "../../components/Header/connect-button";
import { convertToBNBFromWei } from "src/helpers/price-helper";
import GameTooltip from "src/components/Tooltip/GameTooltip";
import GameSwitch from "src/components/GameSwitch/GameSwitch";
import LiquidityBanner from "src/components/InfoBanner";

enum GameInfoOrder {
    GameId = 0,
    Question = 1,
    Option1 = 2,
    Option2 = 3,
    MyWinningVotes = 4,
    MyWinnings = 5,
    ClaimStatus = 6
}

function ClaimPrize() {

    store.refreshWeb3Helper()
    const web3Helper = store.getWeb3Helper()
    const gameContractReadHelper = new GameContractReadHelper(web3Helper)

    const dispatch = useDispatch();
    const history = useHistory();

    const [rangeInput, setRangeInput] = useState(false)

    var lastValidGameIdToClaimResults = -1
    var isQueryInProgress = false

    usePathForNetwork({ pathName: "claimPrize", networkID: web3Helper.chainID, history });

    const ClaimPrizeHtml = (
        <div className="claimPrize-view">
            <Zoom in={true}>
                <div className="claimPrize-card">
                    <Grid item lg={12} md={12} sm={12} xs={12} id= "pre">
                        <div className="challenge-card">
                            <p className="card-title">
                                Claim Prize for GameIds
                                <GameTooltip title={"Search the GameIds for which you wish to claim the winnings for. You can find more details on the past concluded games in 'Past Games' section."}>
                                </GameTooltip>
                            </p>

                            <div className="stake-card-action-row">
                                {
                                    !rangeInput &&
                                    (<OutlinedInput
                                        id="gameIdInput"
                                        type="number"
                                        placeholder="GameId"
                                        className="stake-card-action-input"
                                        labelWidth={0}
                                    />
                                )}

                                {
                                    rangeInput &&
                                    (<>
                                    <OutlinedInput
                                        id="gameIdRangeStartInput"
                                        type="number"
                                        placeholder="Start"
                                        className="stake-card-action-input"
                                        labelWidth={0}
                                    />
                                    <OutlinedInput
                                        id="gameIdRangeEndInput"
                                        type="number"
                                        placeholder="End"
                                        className="stake-card-action-input"
                                        labelWidth={0}
                                    />
                                    </>
                                )}
                                <div className="stake-card-tab-panel">
                                    <div
                                        className={`stake-card-tab-panel-btn ${
                                            web3Helper.address && web3Helper.address != "" && AVAILABLE_CHAINS.includes(web3Helper.providerChainID) ? "": "disabledbutton"}`}
                                        onClick={() => {
                                            fetchMyGames()
                                        }}
                                    >
                                        <p>{"Search"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="switch-style">
                                <GameSwitch
                                    label="search in range"
                                    defaultValue={false}
                                    onChange={(value: boolean)=>{
                                        setRangeInput(value)
                                        }}>
                                    
                                </GameSwitch>
                            </div>
                        </div>
                    </Grid>
                    {web3Helper.address==null || web3Helper.address.length ==0 && (
                    <>
                        <div className="connect-wallet-btn">
                            <ConnectButton />
                        </div>
                    </>
                    )}
                    <table id="claimPrizeTable" className="claim-prize-table">
                        <thead>
                            <tr>
                                <th className="th1" id="optionName">Game Id</th>
                                <th className="tq" id="optionName">Question</th>
                                <th className="to" id="optionName">Option 1</th>
                                <th className="to" id="optionName">Option 2</th>
                                <th className="th1" id="optionName">My Winning Votes</th>
                                <th className="th1" id="optionName">My Winnings (BNB)</th>
                                <th className="to" id="optionName">Status</th>
                            </tr>
                        </thead>
                    </table>
                    <p id = "zeroWonGames" className="zeroWonGames">You have not won any game in the given range!</p>
                    <LiquidityBanner msg="Winnings for a game can be claimed affter the results get published and validated. This can take upto 6 hrs, check the game status under Past Games."/>
                </div>
            </Zoom>
        </div>
    );

    setValidRangeOfGameIdInputs()
     
    function setValidRangeOfGameIdInputs() {
        gameContractReadHelper.fetchGamesCount().then(gameCount => {
            lastValidGameIdToClaimResults = gameCount.toNumber() - 1
        }).catch(error => {
            console.log("rejected", error);
        });
    }

    function setBgColorForResults(row: HTMLTableRowElement, winningChoice: number){
        let option1 = row.cells[GameInfoOrder.Option1]
        let option2 = row.cells[GameInfoOrder.Option2]
        if(winningChoice == 2) {
            if(option1.classList && option1.classList.contains("win")) option1.classList.remove("win");
            if(option1.classList && option1.classList.contains("lose")) option1.classList.remove("lose");
            if(option2.classList && option2.classList.contains("win")) option2.classList.remove("win");
            if(option2.classList && option2.classList.contains("lose")) option2.classList.remove("lose");
        }
        else {
            if(winningChoice == 0) {
                option1.classList.add("win");
                option2.classList.add("lose");
            }
            else if(winningChoice == 1){
                option2.classList.add("win");
                option1.classList.add("lose");
            }
        }
    }

    function resetClaimPrizeTable() {
        let table = document.getElementById("claimPrizeTable") as HTMLTableElement;
        for (let i = table.rows.length - 1; i > 0; i--) {
            table.deleteRow(i);
        }
        if(table != null) {
            table.style.visibility = "hidden"
        }
        showZeroWonGames(false)
    }

    function fetchMyGames() {
        if (isQueryInProgress) {
            return
        }
        resetClaimPrizeTable()

        let gameIdDiv = document.getElementById("gameIdInput") as HTMLInputElement;
        let gameIdStartRangeDiv = document.getElementById("gameIdRangeStartInput") as HTMLInputElement;
        let gameIdEndRangeDiv = document.getElementById("gameIdRangeEndInput") as HTMLInputElement;

        if(gameIdDiv != null && gameIdDiv.value != null && gameIdDiv.value != "") {
            const chosenGameId = parseInt(gameIdDiv.value)
            if( chosenGameId <= lastValidGameIdToClaimResults) {
                fetchInfoForGameRange(chosenGameId, chosenGameId)
            } else {
                dispatch(warning({ text: messages.enter_valid_game }));
            }
        }
        else if(gameIdStartRangeDiv != null && gameIdStartRangeDiv.value != null && gameIdStartRangeDiv.value != ""
            && gameIdEndRangeDiv != null && gameIdEndRangeDiv.value != null && gameIdEndRangeDiv.value != "") {
                const startGameId = parseInt(gameIdStartRangeDiv.value)
                const endGameId = parseInt(gameIdEndRangeDiv.value)
                if(startGameId >=0 && endGameId >=0 && startGameId <= endGameId && startGameId <= lastValidGameIdToClaimResults) {
                    let start = parseInt(gameIdStartRangeDiv.value)
                    let end = endGameId >= lastValidGameIdToClaimResults? lastValidGameIdToClaimResults : endGameId
                    fetchInfoForGameRange(start, end)
                }
                else {
                    dispatch(warning({ text: messages.enter_valid_game }));
                }
        }
    }

    async function fetchInfoForGameRange(start: number, end: number) {
        if (start > end) {
            return
        }
        isQueryInProgress = true
        try {
            const promises: Promise<boolean>[] = []
            for (let i = start; i <= end; i++) {
                promises.push(fetchGameInfo(i))
            }
            const res = await Promise.all(promises)
            if (!res.some( (e)=> e)) {
                showZeroWonGames(true)
            }
        } catch(err) {
            console.log(err)
        }
        isQueryInProgress = false
    }

    function addNewRowInTable() {
        let table = document.getElementById("claimPrizeTable") as HTMLTableElement;
        let newRow = table.insertRow(-1); // -1 to insert at the end
        let firstRow = table.rows[0]; 
        for (let i = 0; i < firstRow.cells.length; i++) {
            let newCell = newRow.insertCell(i);
            newCell.className = firstRow.cells[i].className;
        }
        return newRow
    }

    async function populateRowWithGameResult(row: HTMLTableRowElement, gameId: number, winningVotes: [BigNumber, boolean][], winningChoice: number, burnPrice: BigNumber) {
        row.cells[GameInfoOrder.GameId].innerText = gameId.toString()
        const winCnt = winningVotes.length
        row.cells[GameInfoOrder.MyWinningVotes].innerText = winCnt.toString()
        row.cells[GameInfoOrder.MyWinnings].innerText = (convertToBNBFromWei(burnPrice.mul(winCnt))).toString()
        row.cells[GameInfoOrder.ClaimStatus].innerHTML = '<button id="claimButton"></button>';

        // const jsxElement =         
        //     <GameTooltip title="fddfdn"/*{getPayoutDesciption()}*/ >
        //     </GameTooltip>
    
        // const elementString = ReactDOMServer.renderToString(jsxElement);

        // row.cells[GameInfoOrder.ClaimStatus].innerHTML = elementString
        let claimButton = row.querySelector("#claimButton");
        if(claimButton != null) {
            if (winningVotes.length == 0) {
                claimButton.className = 'noWinnings'
            } else {
                const claimRemaining = winningVotes.some((vote)=> !vote[1])
                claimButton.textContent = claimRemaining? "Claim" : "Claimed"
                claimButton.className = claimRemaining? "claimPrize-card-submit-btn": "prizeClaimed-card-submit-btn"
                claimButton.addEventListener("click", () => invokeClaimPrize(gameId, winningVotes))
            }
        }
        if (winningChoice >=0 && winningChoice<=1)
            setBgColorForResults(row, winningChoice)
    }

    function populateRowWithGameResources(row: HTMLTableRowElement, question:string, option1: string, option2: string) {
        row.cells[GameInfoOrder.Question].innerText = question
        row.cells[GameInfoOrder.Option1].innerText = option1
        row.cells[GameInfoOrder.Option2].innerText = option2
    }

    function toggleTableHeaderVisibility(isVisible: Boolean) {
        let table = document.getElementById("claimPrizeTable") as HTMLTableElement;
        if(table != null) {
            table.style.visibility = isVisible? "visible": "hidden"
        }
    }

    function fetchWinningChoiceOrDefault(gameId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            gameContractReadHelper.fetchWinningChoiceAndVotesCasted(gameId)
              .then( (res)=> resolve(res[0]))
              .catch(() => resolve(-1));
          });
    } 

    async function fetchGameInfo(gameId: number): Promise<boolean> {
        try {
            const [stateInfo, winningVotes, gameStaticInfo, winningChoice, burnPrice] = await Promise.all([
                gameContractReadHelper.fetchGamesState(gameId),
                gameContractReadHelper.fetchWinningVotesOf(gameId, web3Helper.address),
                gameContractReadHelper.fetchGameStaticInfo(gameId),
                fetchWinningChoiceOrDefault(gameId),
                gameContractReadHelper.fetchGameBurnPrice(gameId)
            ]);

            if(stateInfo.gameState != 'RESULT_LOCKED' && stateInfo.gameState != 'FUCKED_UP') {
                return false
            }
            if(winningVotes == null || winningVotes.length == 0) {
                return false
            }
            const assets = await fetchResourcesAsPromise(gameStaticInfo.assetsCID)
            toggleTableHeaderVisibility(true /*isVisible*/)
            let newRow = addNewRowInTable()
            populateRowWithGameResult(newRow, gameId, winningVotes, winningChoice, burnPrice)
            populateRowWithGameResources(newRow, assets.info.question, assets.info.option0, assets.info.option1)
            return true
        } catch(error) {
            console.log("rejected", error);
            return false
        }
    }

    function invokeClaimPrize(gameId: number, winningVotes: [BigNumber, boolean][]) {
        claimPrize(web3Helper, gameContractReadHelper, dispatch, gameId, winningVotes)
    }

    function showZeroWonGames(show: boolean) {
        var zeroWonGames = document.getElementById("zeroWonGames")
        if(zeroWonGames != null){
            zeroWonGames.style.visibility = show? "visible": "hidden"
        }
    }  
    return ClaimPrizeHtml;
}

export default ClaimPrize;
