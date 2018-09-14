'use strict';

const user = require('../models/user');
const elder_user = require('../models/elder_user');

const bcrypt = require('bcryptjs');

exports.RegisterUser = (name, wallet) =>
    new Promise(((resolve, reject) => {
        // const salt = bcrypt.genSaltSync(10);
        // const hashed_password = bcrypt.hashSync(password, salt);
        user.find({wallet : wallet}).then(result => {
            if(result.length == 0){
                return result;
            }else{
                reject({status: 404, message: '이미 존재하는 사용자 입니다.'});
            }
        }).then(result =>{

            const newUser = new user({
                name : name,
                wallet : wallet
            });

            return newUser;
        }).then(newUser => {
            newUser.save();
        }).then(()=> resolve({
            status : 200,
            message : 'Sucessfully register user'
        })).catch(err =>{
            if(err.code == 11000){
                reject({ status: 409, message: 'User Already Registered !'});
            }else{
                reject({ status: 500, message: 'Internal Server Error !' });
            }
        });
    }));