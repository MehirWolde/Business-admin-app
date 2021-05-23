//documento do Ahmad
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Worker = require('../models/workers');
const Counter = require('../models/counter');
const Admin = require('../models/admin');

router.get('/', async (req, res) => {
    increment();
    await Counter.find()
    .then((result) => {
    var newID = result[0].idNumber;

    res.render('registration', {idNumber: newID})})
    .catch((error) => {console.log(error)});
})

router.post('/', async (req, res) => {
    let accountType = req.body.account;

    if (accountType == "worker") {
        try {
            req.body.password = bcrypt.hashSync(req.body.password, 10);
            var worker = new Worker(req.body);
            var result = await worker.save();
            res.send();
        } catch (error) {
            console.log(error);
        }
    } if (accountType == "admin") {
        try {
            req.body.password = bcrypt.hashSync(req.body.password, 10);
            var admin = new Admin(req.body);
            var result = await admin.save();
            res.send();
        } catch (error) {
            console.log(error);
        }
    }
});

async function increment(){
    try {
        var i = await Counter.updateOne({$inc: {idNumber: 1}});
    } catch (error) {
        console.log(error);
    }
}

module.exports = router;