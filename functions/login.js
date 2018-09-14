'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');

exports.LoginUser = (id, password) =>
    new Promise((resolve, reject) => {
        user.find({auth_id : id}).then(result => {
            if(result.length == 0){
                reject({status: 404, message: 'User Not Found !'});
            }else{
                return result[0];
            }
        }).then(user =>{
            if(bcrypt.compareSync(password, user.hashed_password)){
                resolve({ status: 200, message: id });
            }else{
                reject({ status: 401, message: 'Invalid Credentials !' });
            }
        }).catch(err =>
            reject({ status: 500, message: 'Internal Server Error !' })
        );
    });

exports.PushUser = (server_wallet, server_name, User_Wallet) =>
    new Promise((resolve, reject) => {
        user.find({wallet : User_Wallet}).then(results =>{
            var result = results[0];
            result.entered_wallet.push({
                wallet_name : server_name,
                server_wallet : server_wallet
            });
            result.save();
            return result;
        }).then(result => resolve(result))
            .catch(err => {
                console.log("err : " + err);
                reject({ status: 500, message: 'Internal Server Error !' })
            })});
