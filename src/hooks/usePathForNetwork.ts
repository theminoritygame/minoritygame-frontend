import { useEffect } from "react";
import { History } from "history";
import { Networks, VIEWS_FOR_NETWORK } from "../constants";

/**
 * will redirect from paths that aren't active on a given network yet.
 */
export function usePathForNetwork({ pathName, networkID, history }: { pathName: string; networkID: Networks; history: History }) {
    const handlePathForNetwork = () => {
        switch (pathName) {
            case "claimPrize":
                if (VIEWS_FOR_NETWORK[networkID] && VIEWS_FOR_NETWORK[networkID].claimPrize) {
                    break;
                } else {
                    history.push("/dashboard");
                    break;
                }
            case "challenge":
                if (VIEWS_FOR_NETWORK[networkID] && VIEWS_FOR_NETWORK[networkID].challenge) {
                    break;
                } else {
                    history.push("/dashboard");
                    break;
                }
            case "game":
                if (VIEWS_FOR_NETWORK[networkID] && VIEWS_FOR_NETWORK[networkID].game) {
                    break;
                } else {
                    history.push("/dashboard");
                    break;
                }
            case "rules":
                if (VIEWS_FOR_NETWORK[networkID] && VIEWS_FOR_NETWORK[networkID].rules) {
                    break;
                } else {
                    history.push("/dashboard");
                    break;
                }
            case "decryptVotes":
                if (VIEWS_FOR_NETWORK[networkID] && VIEWS_FOR_NETWORK[networkID].decryptVotes) {
                    break;
                } else {
                    history.push("/dashboard");
                    break;
                }
            case "archive":
                if (VIEWS_FOR_NETWORK[networkID] && VIEWS_FOR_NETWORK[networkID].archive) {
                    break;
                } else {
                    history.push("/dashboard");
                    break;
                }
            default:
                console.log("pathForNetwork ok");
        }
    };

    useEffect(() => {
        handlePathForNetwork();
    }, [networkID]);
}
