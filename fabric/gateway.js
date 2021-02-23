const fs = require('fs')
const yaml = require('js-yaml')

const { Gateway, FileSystemWallet, DefaultEventHandlerStrategies, Transaction } = require('fabric-network');

const CONNECTION_PROFILE_PATH = "/home/samarth/Blockchain/Fabric/login-otp-database/dev-connection.yaml"
const FILESYSTEM_WALLET_PATH = "/home/samarth/Blockchain/Fabric/app/sdk/gateway/user-wallet"

const USER_ID = "Admin@acme.com"
const NETWORK_NAME = 'airlinechannel'
const CONTRACT_ID = "erc20"

const gateway = new Gateway();

async function queryContract(contract){
    try{
        // Query the chaincode
        let response = await contract.evaluateTransaction('balanceOf', 'john')
        console.log(`Query Response=${response.toString()}`)
    } catch(e){
        console.log(e)
    }
}

async function submitTransaction(variant, amount) {

    await setupGateway()
    let network = await gateway.getNetwork(NETWORK_NAME)
    let contract = await network.getContract(CONTRACT_ID)

    try {
        // Submit the transaction
        let response = await contract.submitTransaction('transfer', 'john', 'sam', `${amount}`)
        console.log("Submit Response=", response.toString())
        queryContract(contract)
    } catch (e) {
        // fabric-network.TimeoutError
        console.log(e)
    }
}

async function setupGateway() {

    // 2.1 load the connection profile into a JS object
    let connectionProfile = yaml.load(fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));

    // 2.2 Need to setup the user credentials from wallet
    const wallet = new FileSystemWallet(FILESYSTEM_WALLET_PATH)

    // 2.3 Set up the connection options
    let connectionOptions = {
        identity: USER_ID,
        wallet: wallet,
        discovery: { enabled: false, asLocalhost: true }
        /*** Uncomment lines below to disable commit listener on submit ****/
        , eventHandlerOptions: {
            strategy: null
        }
    }

    // 2.4 Connect gateway to the network
    await gateway.connect(connectionProfile, connectionOptions)
    // console.log( gateway)
}

module.exports = {setupGateway, submitTransaction, queryContract}