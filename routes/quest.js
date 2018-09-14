var express = require('express');
const router = express.Router();

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const register = require('../functions/register');
const login = require('../functions/login');
const user_quest_bool = require('../functions/user_quest_bool');
const elder_user_quest_accept_list= require('../functions/elder_user_quest_accept_list');
const profile = require('../functions/profile');
const quest_complete_flow = require('../functions/quest_complete_flow');
const quest_info = require('../functions/quest_info');
const password = require('../functions/password');
const db = require('../util/db');
const config = require('../config/config');
const real_config = require('../config');
const axios = require('axios')


    router.get('/', (req, res) => res.end('I choose you! (Server)\nMade by ssu.software.17.Wonjun Jang\nquest routes'));


router.post('/create', (req, res) => {
        var wallet_name = req.body.wallet_name;
        // var server_wallet = req.body.server_wallet;
        // var server_private_key = req.body.server_private_key;
        // var server_mnemonic = req.body.server_mnemonic;

        var selected_person = "";
        var opener_name = req.body.opener_name;
        var opener_wallet = req.body.opener_wallet;
        var opener = [{name:opener_name, wallet:opener_wallet}];
        var random_extracted_seed = [];

        var server_wallet;
        var server_private_key;
        var server_mnemonic;
            db.connectDB().then(
                axios.post('http://localhost:2442/api/v1/wallet')
                    .then(response => {
                        server_wallet = response.data.address;
                        server_private_key = response.data.privateKey;
                        server_mnemonic = response.data.mnemonic;
                        console.log(response)
                        axios.post('http://localhost:2442/api/v1/signedtx', {
                            privateKey : real_config.hycon_config.ADMIN_PRIVATEKEY,
                            from : real_config.hycon_config.ADMIN_ADDRESS,
                            to : server_wallet,
                            amount : 10,
                            fee : 0.0001
                        })
                            .then(response =>
                                quest_info.create_quest(wallet_name, server_wallet, server_private_key,server_mnemonic, selected_person, opener, random_extracted_seed)
                                    .then(result => {
                                        login.PushUser(server_wallet, wallet_name, opener_wallet)
                                            .then(result => res.status(200).json(result));
                                        // res.status(result.status).json({message: result.message});
                                    })
                                    .catch(err => {console.log('err : ' + err);
                                        res.status(err.status).json({message: err.message});
                                    })
                            )
                    })
                    .catch(err => console.log(err))
            );
    });

router.get('/:wallet', (req, res)=>{
   var wallet = req.params.wallet;
   db.connectDB().then(
       quest_info.get_one_quest(wallet)
           .then(result => {
               console.log(result);
               res.status(200).json(result);
           })
           .catch(err => {console.log('err : ' + err);
               res.status(err.status).json({message: err.message});
           })
   )
});
router.post('/enter', (req, res) => {
    var user_name = req.body.name;
    var user_wallet = req.body.wallet;
    var room_wallet = req.body.room_wallet;
    db.connectDB().then(
        quest_info.push_user({name : user_name, wallet : user_wallet}, room_wallet)
            .then(result => {
                var server_wallet = result.server_wallet;
                var server_name = result.wallet_name;
                var User_Wallet = user_wallet;
                login.PushUser(server_wallet, server_name, User_Wallet)
                    .then(result => {
                        res.status(200).json(result);
                    })
                    .catch(err => {console.log('err : ' + err);
                        res.status(err.status).json({message: err.message});
                    })
            })
            .catch(err => {console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    )
});

router.post('/get_min', (req, res) => {
    var room_wallet = req.body.room_wallet;
    db.connectDB().then(
        quest_info.get_one_quest(room_wallet)
            .then(result => {
                var len = Math.min.apply(null, result.members);
                res.status(200).json(len);
            })
            .catch(err => {console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    )
});

router.post('/get_min', (req, res) => {
    var room_wallet = req.body.room_wallet;
    db.connectDB().then(
        quest_info.get_one_quest(room_wallet)
            .then(result => {
                var len = Math.min.apply(null, result.members);
                res.status(200).json(len);
            })
            .catch(err => {console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    )
});

router.post('/send_coin', (req, res) => {
    const privateKey = req.body.privateKey;
    const from = req.body.from;
    const to = req.body.to;
    const amount = req.body.amount;

    axios.post('http://localhost:2442/api/v1/signedtx', {
        privateKey : privateKey,
        from : from,
        to : to,
        amount : amount,
        fee : 0.0001
    })
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => console.log(err))
});

router.post('/receive_coin', (req, res) => {
    // const privateKey = req.body.privateKey;
    // const from = req.body.from;
    const to = req.body.to;
    const amount = req.body.amount;

    axios.post('http://localhost:2442/api/v1/signedtx', {
        privateKey : real_config.hycon_config.ADMIN_PRIVATEKEY,
        from : real_config.hycon_config.ADMIN_ADDRESS,
        to : to,
        amount : amount,
        fee : 0.0001
    })
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => console.log(err))
});

router.post('/get_random', (req, res) => {
    var room_wallet = req.body.room_wallet;
    db.connectDB().then(
        quest_info.get_random(room_wallet)
            .then(result => {
                res.status(200).json(result);
            })
            .catch(err => {console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    )
});

router.post('/remove_random', (req, res) => {
    var room_wallet = req.body.room_wallet;
    db.connectDB().then(
        quest_info.remove_random(room_wallet)
            .then(result => {
                res.status(200).json(result);
            })
            .catch(err => {console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    )
});


module.exports = router;


