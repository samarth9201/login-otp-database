const router = require('express').Router()
const {setupGateway, submitTransaction, queryContract} = require('../fabric/gateway')

router.route('/transact').post(async (req, res) =>{
    try{
        console.log(req.body);
        await submitTransaction(1, Math.floor(req.body.amount))
        res.status(200).json("Transaction Successful")
    }
    catch(error){
        res.status(500).json({
            "error": true,
            "message": error.message
        })
    }
})

module.exports = router