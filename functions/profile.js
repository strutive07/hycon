'use strict';

const user = require('../models/user');


exports.GetProfile = wallet =>
    new Promise((resolve, reject) => {
       user.find({wallet : wallet}).then(results =>
           resolve(results[0])
       ).catch(err => {
              console.log("err : " + err);
              reject({ status: 500, message: 'Internal Server Error !' })
       })});

