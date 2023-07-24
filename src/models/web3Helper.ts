import { providers, Contract } from "ethers";
import { useWeb3Context } from "../hooks";
import { getAddresses } from "../constants/addresses";
import { MinorityGameContract } from "../abi";

export class Web3Helper {

    // provider, providerChainID, address, connect, connected, chainID, checkWrongNetwork
    provider: providers.JsonRpcProvider;
    providerChainID: number;
    address: string;
    connect: () => Promise<providers.Web3Provider>;
    connected: Boolean;
    chainID: number;
    checkWrongNetwork: () => Promise<boolean>;

    private _gameContract: Contract | undefined;
    private  _gameContractWithSigner: Contract | undefined;

    constructor() {
        const { provider, providerChainID, address, connect, connected, chainID, checkWrongNetwork } = useWeb3Context();
        this.provider = provider;
        this.providerChainID = providerChainID;
        this.address = address;
        this.connect = connect;
        this.connected = connected;
        this.chainID = chainID;
        this.checkWrongNetwork = checkWrongNetwork;
    }

    getMinorityContract() {
        if(this._gameContract == undefined ) {
            const addresses = getAddresses(this.chainID);
            this._gameContract =  new Contract(addresses.MINORITY_GAME_CONTRACT, MinorityGameContract, this.provider);
        }
        return this._gameContract;
    }
    getMinorityContractWithSigner() {
        if(this._gameContractWithSigner == undefined ) {
            const addresses = getAddresses(this.chainID);
            this._gameContractWithSigner =  new Contract(addresses.MINORITY_GAME_CONTRACT, MinorityGameContract, this.provider.getSigner());
        }
        return this._gameContractWithSigner;
    }
}