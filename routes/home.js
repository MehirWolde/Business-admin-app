const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const Worker = require('../models/workers');
const Admin = require('../models/admin');

//GET route för home och förstör alla session cookies vid ingång till hemsidan
router.get('/', (req, res) => {
    req.session.destroy();
    res.render('homepage')
})

router.post('/', async (req, res) => {
    //let { username, password } = req.body;
    const worker = await Worker.findOne({ username: req.body.username });
    var check = true;

    if (worker) {
        const isMatch = await Worker.findOne({ username: req.body.username});
        if (!isMatch) {
            res.status(400).send({ message: "The username does not exist" });
            return res.render('homepage', {check});
        }

        if (!bcrypt.compareSync(req.body.password, worker.password)) {
            //return res.status(400).send({ message: "The password is invalid" });
            return res.render('homepage', {check});
        }

        req.session.isWorkerAuth = true;
        req.session.username = worker.username; 
        req.session.name = worker.name;

        return res.redirect("/worker");
    }

    const admin = await Admin.findOne({ username: req.body.username });
    if(admin) {
        const isMatch = await bcrypt.compare(req.body.password, admin.password);
        
        if(!isMatch) {
            return res.render("homepage", {check});
        }

        // ongoing session attribut i db för Admin
        req.session.isAdminAuth = true;
        req.session.username = admin.username; 
        req.session.name = admin.name;

        // MASTER ADMIN
        /*if(admin.username === "ADMIN"){
            req.session.isMaster = true;
        }*/
        return res.redirect("/admin"); 

    }
    // catch all case
    return res.render("homepage", {check});

});

module.exports = router;
