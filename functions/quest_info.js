'use strict';
// quest_id : String
// request_person_id : Number,
//     title : String,
//     context : String,
//     purpose : String,
//     location : String,
//     difficulty : Boolean, //0 쉬움 1 어려움
//     reward : String


//title, context, purpose, location, difficulty, reward
//는 quest_info 에 저장

//의뢰인 이름, 전화번호는 선배 db 에서 불러오기. request_person_Id 로 불러옴.
const quest_info = require('../models/quest_info');
const bcrypt = require('bcryptjs');
const db = require('mongodb');
const fs = require('fs');

exports.create_quest = (wallet_name, server_wallet, server_private_key, server_mnemonic, selected_person, members, random_extracted_seed) =>
    new Promise(((resolve, reject) => {
        console.log('DEBUG', wallet_name, server_wallet, server_private_key, server_mnemonic, selected_person, members, random_extracted_seed)
        const new_quest_info = new quest_info({
            wallet_name : wallet_name,
            server_wallet : server_wallet,
            server_private_key : server_private_key,
            server_mnemonic : server_mnemonic,
            selected_person : selected_person,
            members : members,
            random_extracted_seed : random_extracted_seed
        });
        new_quest_info.save().then(() => resolve({
            status : 200,
            message : 'Sucessfully register quest'
        })).catch(err =>{
            if(err.code == 11000){
                reject({ status: 409, message: 'User Already Registered !'});
            }else{
                reject({ status: 500, message: 'Inasdfasfahohohohohohohohoternal Server Error !' });
            }
        });
    }));

exports.get_all_quest = () =>
    new Promise((resolve, reject) => {
        quest_info.find().then(results =>
            resolve(results)
        ).catch(err => {
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.get_one_quest = server_wallet =>
    new Promise((resolve, reject) => {
        quest_info.find({server_wallet : server_wallet}).then(results =>{
            resolve(results[0]);
        }).catch(err => {
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.push_user = (user_json, server_wallet) =>
    new Promise((resolve, reject) => {
        quest_info.find({server_wallet:server_wallet}).then(results =>{
            var result = results[0];
            console.log('result', result)
            result.members.push(user_json);
            result.save();
            return result;
        }).then(result => resolve(result))
            .catch(err => {
            reject({ status: 500, message: 'Internal Server Error !' })
        })});

exports.get_random = (server_wallet) =>
    new Promise((resolve, reject) => {
        quest_info.find({server_wallet:server_wallet}).then(results =>{
            var result = results[0];
            if(result.selected_person.length === 0){

                if(result.random_extracted_seed.length === result.members.length){
                    result.random_extracted_seed = []
                }

                result.random_extracted_seed.sort();
                var random = JSON.parse(JSON.stringify(result.members));
                for(var i = 0; i<result.random_extracted_seed.length; i++){
                    random.splice(result.random_extracted_seed[i]-i,1);
                }
                var random_item = random[Math.floor(Math.random() * random.length)];
                var random_item_index = result.members.findIndex((item, i) => {
                    return item.wallet === random_item.wallet
                });

                result.random_extracted_seed.push(random_item_index);
                result.selected_person = random_item.wallet;
                result.selected_person_name = random_item.name;
                result.save();
                return {wallet : result.selected_person, name : result.selected_person_name, members : result.members};
            }else {
                return {wallet : result.selected_person, name : result.selected_person_name, members : result.members};
            }
            return result;
        }).then(result => resolve(result))
            .catch(err => {
                reject({ status: 500, message: 'Internal Server Error !' })
            })});

exports.remove_random = (server_wallet) =>
    new Promise((resolve, reject) => {
        quest_info.find({server_wallet:server_wallet}).then(results =>{
            var result = results[0];
            if(result.selected_person.length === 0){
                reject({ status: 500, message: 'Internal Server Error !' })
            }else {
                result.selected_person = "";
                result.selected_person_name = "";
                result.save();
                return result;
            }
            return result;
        }).then(result => resolve(result))
            .catch(err => {
                reject({ status: 500, message: 'Internal Server Error !' })
            })});


exports.update_current_coin = (server_wallet, user_wallet) =>
    new Promise((resolve, reject) => {
        quest_info.find({server_wallet : server_wallet})
            .then(results =>{
                var result = results[0];

                for(var i =0; i<result.members.length; i++){
                    if(result.members[i].wallet === user_wallet){
                        console.log(__dirname);
                        var coin = parseFloat(fs.readFileSync('coin', 'utf-8'));
                        result.members[i].coin = coin;
                    }
                }
                result.save();
                return result;
            })
            .then(result => {
                resolve(result)
            })
            .catch(err => {
            reject({ status: 500, message: 'Internal Server Error !', err : err})
        })});