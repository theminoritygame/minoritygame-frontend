import { GameAssets } from "src/models/models";

function getBaseIPFSUrl(cid: string): string {
    // return `https://${cid}.ipfs.w3s.link`
    return "https://ipfs.io/ipfs/"+cid
}

export function getGameAssetUrls(cid: string): [string, string, string] {
    return [
        getBaseIPFSUrl(cid)+"/Q.txt",
        getBaseIPFSUrl(cid)+"/0.jpg",
        getBaseIPFSUrl(cid)+"/1.jpg"
    ]
}

export function fetchResources(assetsCID: string, onFetched: (assets: GameAssets)=> void) {
    try {
        fetchResourcesRaw(assetsCID, onFetched)
    } catch(error) {
        console.log("error fetching resources", error)
    }
}

async function fetchResourcesRaw(assetsCID: string, onFetched: (assets: GameAssets)=> void, isRetry = false) {
    let [questionResource, optionResource0, optionResource1] = getGameAssetUrls(assetsCID);

    try {
        const response = await fetch(questionResource)
        const text = await response.text()
        let infoJson = {
            'question': "Choose one of the two options",
            '0': "",
            '1': ""
        }
        try {
            infoJson = JSON.parse(text);
        } catch(err) {
            console.log(err)
        }
        onFetched({imgSrc0: optionResource0, imgSrc1: optionResource1, info: {
            question: infoJson['question'] ?? "Choose one of the two options",
            option0: infoJson['0'] ?? "",
            option1: infoJson['1'] ?? ""
        }})
    } catch (err) {
        if (isRetry == false) {
            fetchResourcesRaw(assetsCID, onFetched, true)
        }
        console.log("error fetchResourcesRaw")
    }
}

export function fetchResourcesAsPromise(assetsCID: string): Promise<GameAssets> {
    const prm = new Promise<GameAssets>((resolve, reject) => {
        try {
            fetchResourcesRaw(assetsCID, (assets)=> {
                resolve(assets)
            })
        } catch(err) {
            reject(err)
        }
      });
      return prm;
} 