import fabricNetwork from 'fabric-network'
import yaml from 'js-yaml'
import fs from 'fs'

const gateway = new fabricNetwork.Gateway()

const CONNECTION_PROFILE_PATH = "../../../app/sdk/profiles/dev-connection.yaml"
const FILESYSTEM_WALLET_PATH = "../../../app/sdk/gateway/user-wallet"

const USER_ID = "Admin@acme.com"
const NETWORK_NAME = 'airlinechannel'
const CONTRACT_ID = "erc20"

export default class GatewayOne {

    queryContract = async (contract) => {
        try {
            let response = await contract.evaluateTransaction('balanceOf', 'john')
            console.log(`Query Response=${response.toString()}`)
        }
        catch (error) {
            console.log(error);
        }
    }

    setupGateway = async () => {
        let connectionProfile = yaml.load(fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf-8'))
        const wallet = new fabricNetwork.FileSystemWallet(FILESYSTEM_WALLET_PATH)

        let connectionOptions = {
            identity: USER_ID,
            wallet: wallet,
            discovery: { enabled: false, asLocalhost: true }
            /*** Uncomment lines below to disable commit listener on submit ****/
            , eventHandlerOptions: {
                strategy: null
            }
        }

        await gateway.connect(connectionProfile, connectionOptions)
    }

    submitTansaction = async (variant, amount) => {

        await this.setupGateway()
        let network = await gateway.getNetwork(NETWORK_NAME)
        let contract = await network.getContract(CONTRACT_ID)

        try {
            // Submit the transaction
            let response = await contract.submitTransaction('transfer', 'john', 'sam', `${amount}`)
            console.log("Submit Response=", response.toString())
            this.queryContract(contract)
        } catch (e) {
            // fabric-network.TimeoutError
            console.log(e)
        }
    }
}