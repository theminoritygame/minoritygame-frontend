import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Zoom } from "@material-ui/core";
import * as elliptic from 'elliptic';
import "./decryptVotes.scss";
import { usePathForNetwork } from "../../hooks";
import { Skeleton } from "@material-ui/lab";
import {GameAssets, GameStaticInfo} from "../../models/models"
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import { useHistory } from "react-router-dom";
import { BigNumber } from "ethers";
import { store } from "src/store/appStore";
import { GameContractReadHelper } from "src/models/GameContractReadHelper";
import { fetchResources } from "src/helpers/ipfsAssetsHelper";
import LiquidityBanner from "src/components/InfoBanner";

type SecretDerivedInfo = {
    readonly secret: BigNumber;
    readonly x: string;
    readonly y: string;
    readonly voteValue: number;  //0 or 1
};

interface DecryptVotesSlice {
    readonly selectedGameId: number | undefined,
    readonly gameStaticInfo: GameStaticInfo | undefined,
    readonly secretsInfo: SecretDerivedInfo[] | undefined,
    readonly voteCnts: [number, number, number] | undefined,
}

const defaultDecryptVotesSlice: DecryptVotesSlice = {
    selectedGameId : undefined,
    gameStaticInfo : undefined,
    secretsInfo : undefined,
    voteCnts : undefined
}

function DecryptVotes() {
    store.refreshWeb3Helper()
    const web3Helper = store.getWeb3Helper()
    const gameContractReadHelper = new GameContractReadHelper(web3Helper)
    
    const dispatch = useDispatch();
    const history = useHistory();

    const ecObject = new elliptic.ec('p256');

    const [decryptVotesSlice, setDecryptVotesSlice] = useState<DecryptVotesSlice>(defaultDecryptVotesSlice)
    const [gameAssets, setGameAssets] = useState<GameAssets | undefined>(undefined)
    const [query, setQuery] = useState<[number, BigNumber[]] | undefined>(undefined) 
   
    usePathForNetwork({ pathName: "archive", networkID: web3Helper.chainID, history });

    const DecryptVotesHtml = (
        <div className="decryptVotes-view">
            <Zoom in={true}>
                <div className="decryptVotes-card">
                    <div className="decryptVotes-card-gameid">
                        <p className="decryptVotes-card-gameid">Enter Game Id</p>
                        <input className="decryptVotes-card-gameid-input" type="number" id="gameId" contentEditable="true" placeholder="game Id"/>
                    </div>

                    <div className="decryptVotes-card-secret">
                        <p className="decryptVotes-card-secret">Enter Secret</p>
                        <input className="decryptVotes-card-secret-input" type="text" id="secrets" contentEditable="true" placeholder="secrets comma separated"/>
                    </div>


                    <div className="fetch-games-submit-btn" onClick= {() => {executeQuery()}}>
                        <p id="fetchMyGamesButton">Submit</p>
                    </div>

                    { decryptVotesSlice.secretsInfo &&
                    (
                    <div>
                        <div className="decryptVotes-card-header">
                            <p className="decryptVotes-card-header-info">Total votes casted by you: &nbsp;{decryptVotesSlice.voteCnts?.[2] ?? ""}</p>
                            <p className="decryptVotes-card-header-info" style={{ color: 'powderblue' }}><br></br><br></br>Decryption Result:</p>
                            <p id = "question" className="decryptVotes-card-header-title">{gameAssets?.info?.question ?? ""} &nbsp;</p>
                        </div>
                        <table id="resultsTable">
                            <tr>
                                <td className="td" id="optionName">Option Name</td>
                                <td className="td" id="optionName0" >{gameAssets?.info?.option0 ||  "Option 0"}</td>
                                <td className="td" id="optionName1" >{gameAssets?.info?.option1 ||  "Option 1"}</td>
                            </tr>
                            <tr>
                                <td className="td" id= "optionImg">Option Image</td>
                                <td className="td">
                                    {gameAssets ? (
                                        <img id= "optionImg0" className = "cell-image" src={gameAssets.imgSrc0}/>
                                    ) : (
                                        <Skeleton variant="rect" className = "cell-image" animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0.2)' }} />
                                    )}
                                </td>
                                <td className="td" >
                                    {gameAssets ? (
                                        <img id= "optionImg1" className = "cell-image" src={gameAssets.imgSrc1}/>
                                    ) : (
                                        <Skeleton variant="rect" className = "cell-image" animation="wave" style={{ backgroundColor: 'rgba(169, 169, 169, 0.2)' }} />
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="td" id="decryptVotes" >My Votes</td>
                                <td className="td" id="myVotes0">{decryptVotesSlice.voteCnts?.[0] ?? ""}</td>
                                <td className="td" id="myVotes1">{decryptVotesSlice.voteCnts?.[1] ?? ""}</td>
                            </tr>
                        </table>
                    </div>
                    )}

                    <LiquidityBanner msg={'You can check your casted vote by providing the unique secret you received upon casting your vote. The decryption process occurs locally, and your secret remains safe.'}/>
                </div>
            </Zoom>
        </div>
    );

    useEffect(()=> {
        if (query != undefined) {
            setDecryptVotesSlice(defaultDecryptVotesSlice)
            setGameAssets(undefined)
            fetchGameStaticInfo(query[0])
        }
    }, [query])

    useEffect(()=> {
        if (decryptVotesSlice.selectedGameId != undefined && query != undefined) {
            processSecretsAndCalculateVoteCounts(decryptVotesSlice, query[1])
        }
    }, [decryptVotesSlice.selectedGameId])

    useEffect(()=> {
        if (decryptVotesSlice.gameStaticInfo?.assetsCID != undefined && gameAssets == undefined) {
            fetchResources(decryptVotesSlice.gameStaticInfo?.assetsCID, (assets: GameAssets)=> {
                setGameAssets(assets)
            })
        }
    }, [decryptVotesSlice.gameStaticInfo?.assetsCID])

    function executeQuery() {
        try {
            const gameIdString = (document.getElementById("gameId") as HTMLInputElement).value
            const gameId = BigNumber.from(gameIdString).toNumber()

            const secretsString = (document.getElementById("secrets") as HTMLInputElement).value
            const secrets = secretsString.split(',').map((value: string) => BigNumber.from(value.trim()));
            
            setQuery([gameId, secrets])
        } catch(err) {
            dispatch(warning({ text: messages.invalid_input }));
        }
    }

    function processSecret(publicX: BigNumber, publicY: BigNumber, secret: BigNumber): SecretDerivedInfo {

        const key = ecObject.keyFromPrivate(secret.toBigInt().toString(16));

        const sharedSecret = BigNumber.from(
            ecObject.keyFromPublic({
                x: publicX.toBigInt().toString(16),
                y: publicY.toBigInt().toString(16)
            }).getPublic().mul(key.getPrivate()).getX().toString()
        );
        const v = sharedSecret.mod(2).toNumber()
        return {
            secret: secret,
            x: key.getPublic().getX().toString(),
            y: key.getPublic().getY().toString(),
            voteValue: v
        }
    }
    
    async function processSecretsAndCalculateVoteCounts(decryptSlice: DecryptVotesSlice, secrets: BigNumber[])  {
        try {
            const gameId = decryptSlice.selectedGameId
            const publicX = decryptSlice.gameStaticInfo?.publicKey?.[0]
            const publicY = decryptSlice.gameStaticInfo?.publicKey?.[1]

            if (gameId == undefined || publicX == undefined || publicY == undefined) {
                return
            }

            const secretInfos : SecretDerivedInfo[] = []
            secrets.forEach(secret => {
                secretInfos.push(processSecret(publicX, publicY, secret))
            });
            setDecryptVotesSlice({...decryptVotesSlice, secretsInfo: secretInfos})

            const voteIds: BigNumber[] = await gameContractReadHelper.fetchVotesCastedBy(gameId, web3Helper.address)
            const eVotePromises: Promise<[BigNumber, BigNumber]>[] = [];
            voteIds.forEach(id => {
                eVotePromises.push(gameContractReadHelper.fetchEncryptedVoteForVoteId(gameId, id.toNumber()))
            });

            const eVotes = await Promise.all(eVotePromises)

            let cnt0 = 0
            let cnt1 = 0
            eVotes.forEach(eVote => {
                const res = secretInfos.find((elem) => elem.x === eVote[0].toString() && elem.y === eVote[1].toString())
                if (res != undefined) {
                    if (res.voteValue ==0) {
                            cnt0++
                    } else {
                        cnt1++
                    }
                }
            });
            setDecryptVotesSlice({...decryptVotesSlice, secretsInfo: secretInfos, voteCnts: [cnt0, cnt1, voteIds.length]})

        } catch (error) {
            console.log(error)
            console.log("failed processSecretsAndCalculateVoteCounts");
        }
    }

    function fetchGameStaticInfo(gameId : number) {
        gameContractReadHelper.fetchGameStaticInfo(gameId).then((info: GameStaticInfo) => {
            setDecryptVotesSlice( {...defaultDecryptVotesSlice, selectedGameId: gameId, gameStaticInfo: info})
        }).catch(error => {
            // invalid gameId?
            console.log("invalid gameId?...rejected", error);
        });
    }

    return DecryptVotesHtml;
}

export default DecryptVotes;
