const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User;

///////////////////////////////////////////////////

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dbUser:dbUser@senecaweb-xzbln.mongodb.net/test?retryWrites=true&w=majority");
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            let newUser = new User(userData);
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newUser.password, salt, function (err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password");
                    } else {
                        newUser.password = hash;
                        newUser.save((err) => {
                            if (err) {
                                if (err.code == 11000) {
                                    reject("User Name already taken");
                                } else {
                                    reject("There was an error creating the user: " + err);
                                }
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
            .exec()
            .then((user) => {
                if (user.length == 0) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, user[0].password)
                        .then((res) => {
                            if (res === false) {
                                reject("Incorrect Password for user: " + userData.userName);
                            } else {
                                user[0].loginHistory.push({
                                    dateTime: new Date().toString(),
                                    userAgent: userData.userAgent
                                });
                                User.updateOne(
                                    { userName: userData.userName },
                                    { $set: { loginHistory: user[0].loginHistory } }
                                ).exec()
                                    .then(() => { resolve(user[0]); })
                                    .catch((err) => {
                                        reject("There was an error verifying the user: " + err);
                                    });
                            }
                        }).catch((err) => {
                            reject("There was an error when attempting to log in: " + err);
                        });
                }
            }).catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};

///////////////////////////////////////////////////