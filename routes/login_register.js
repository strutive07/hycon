
const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

var express = require('express');
const router = express.Router();

const db = require('../util/db');
const register = require('../functions/register');
const login = require('../functions/login');
const user_quest_bool = require('../functions/user_quest_bool');
const elder_user_quest_accept_list= require('../functions/elder_user_quest_accept_list');
const profile = require('../functions/profile');
const quest_complete_flow = require('../functions/quest_complete_flow');
const password = require('../functions/password');
const config = require('../config/config');
const real_config = require('../config');
const axios = require('axios');



router.get('/', (req, res) => res.end('I choose you! asdfasdfasdf (Server)\nMade by ssu.software.17.Wonjun Jang'));


router.post('/register', (req, res) => {
    const name = req.body.name;
    const wallet = req.body.wallet;
    console.log('name : ' + name);
    console.log('wallet : ' + wallet);
    if (!name || !wallet || !name.trim() || !wallet.trim()) {
        res.status(400).json({message: 'Invalid Request !'});
    } else {
        db.connectDB().then(register.RegisterUser(name, wallet)
            .then(result => {
                console.log('name->' + name);
                console.log('email->' + wallet);
                // res.setHeader('Location', '/users' + id);
                res.status(result.status).json({message: result.message});
            })
            .catch(err => {
                res.status(err.status).json({message: err.message});
            })
        );
    }
});
router.post('/generate_wallet', (req, res) => {
    var server_wallet;
    var server_private_key;
    var server_mnemonic;

    axios.post('http://localhost:2442/api/v1/wallet')
        .then(response => {
            server_wallet = response.data.address;
            server_private_key = response.data.privateKey;
            server_mnemonic = response.data.mnemonic;
            axios.post('http://localhost:2442/api/v1/signedtx', {
                privateKey : real_config.hycon_config.ADMIN_PRIVATEKEY,
                from : real_config.hycon_config.ADMIN_ADDRESS,
                to : server_wallet,
                amount : 10,
                fee : 0.0001
            })
                .then(response =>{
                    console.log(response);
                        res.status(200).json({
                            server_wallet:server_wallet,
                            server_private_key:server_private_key,
                            server_mnemonic:server_mnemonic
                        })
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
});

router.post('/wallet', (req, res) => {
    console.log(req.body.wallet);
    db.connectDB().then(

        profile.GetProfile(req.body.wallet)
            .then(result => {
                axios.get('http://localhost:2442/api/v1/wallet/' + req.body.wallet + '/balance')
                    .then(response => res.json({name : result.name, wallet : result.wallet, balance : response.data.balance, entered_wallet : result.entered_wallet}))
                    .catch(err => console.log(err));
            })
            .catch(err => {console.log('err : ' + err);
                res.status(err.status).json({message: err.message});
            })
    );
});


module.exports = router;


