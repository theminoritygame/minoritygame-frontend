import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import AppLogo from "../../../assets/icons/traingle-logo-with-name.svg";
import ClaimPrizeIcon from "../../../assets/icons/claimPrize.svg";
import ChallengeIcon from "../../../assets/icons/challenge.svg";
import GameIcon from "../../../assets/icons/game.svg";
import RulesIcon from "../../../assets/icons/rules.svg";
import MyVotesIcon from "../../../assets/icons/decryptVotes.svg";
import ArchiveIcon from "../../../assets/icons/archive.svg";
import { shorten } from "../../../helpers";
import { useAddress, useWeb3Context } from "../../../hooks";
import { Link } from "@material-ui/core";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import classnames from "classnames";
import BridgeIcon from "../../../assets/icons/bridge-alt.svg";
import { VIEWS_FOR_NETWORK } from "../../../constants";

function NavContent() {
    const [isActive] = useState();
    const address = useAddress();
    const { chainID } = useWeb3Context();

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
            return true;
        }
        if (currentPath.indexOf("claimPrize") >= 0 && page === "claimPrize") {
            return true;
        }
        if (currentPath.indexOf("challenge") >= 0 && page === "challenge") {
            return true;
        }
        if (currentPath.indexOf("game") >= 0 && page === "game") {
            return true;
        }
        if (currentPath.indexOf("rules") >= 0 && page === "rules") {
            return true;
        }
        if (currentPath.indexOf("FAQ") >= 0 && page === "FAQ") {
            return true;
        }
        if (currentPath.indexOf("decryptVotes") >= 0 && page === "decryptVotes") {
            return true;
        }
        if (currentPath.indexOf("archive") >= 0 && page === "archive") {
            return true;
        }
        return false;
    }, []);

    return (
        <div className="dapp-sidebar">
            <div className="branding-header">
                <Link href="https://theminoritygame.com" target="_blank">
                    <img alt="" src={AppLogo} width="150" />
                </Link>

                {address && (
                    <div className="wallet-link">
                        <Link href={`https://bscscan.com/address/${address}`} target="_blank">
                            <p>{shorten(address)}</p>
                        </Link>
                    </div>
                )}
            </div>

            <div className="dapp-menu-links">
                <div className="dapp-nav">
                    {VIEWS_FOR_NETWORK[chainID].game && (
                        <Link
                            component={NavLink}
                            to="/game"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "game");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={GameIcon} />
                                <p>Play</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID].rules && (
                        <Link
                            component={NavLink}
                            to="/rules"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "rules");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={RulesIcon} />
                                <p>Rules</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID].claimPrize && (
                        <Link
                            component={NavLink}
                            to="/claimPrize"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "claimPrize");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={ClaimPrizeIcon} />
                                <p>Claim Prize</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID].archive && (
                        <Link
                            component={NavLink}
                            to="/archive"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "archive");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={ArchiveIcon} />
                                <p>Past Games</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID].rules && (
                        <Link
                            component={NavLink}
                            to="/FAQ"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "FAQ");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={BridgeIcon} />
                                <p>FAQs</p>
                            </div>
                        </Link>
                    )}

                </div>
            </div>

            <div className="dapp-menu-links" style={{marginTop: '50px'}}>
                <div className="dapp-nav">
                    <div>
                        <p className="heading-style">ADVANCED</p>
                    </div>
                        
                    {VIEWS_FOR_NETWORK[chainID].challenge && (
                        <Link
                            component={NavLink}
                            to="/challenge"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "challenge");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={ChallengeIcon} />
                                <p>Challenge</p>
                            </div>
                        </Link>
                    )}

                    {VIEWS_FOR_NETWORK[chainID].decryptVotes && (
                        <Link
                            component={NavLink}
                            to="/decryptVotes"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "decryptVotes");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <img alt="" src={MyVotesIcon} />
                                <p>Decrypt Votes</p>
                            </div>
                        </Link>
                    )}

                </div>
            </div>


            <div className="dapp-menu-doc-link">
                <Link href="https://docs.theminoritygame.com/" target="_blank">
                    <img alt="" src={DocsIcon} />
                    <p>Whitepaper</p>
                </Link>
            </div>
            <Social />
        </div>
    );
}

export default NavContent;
