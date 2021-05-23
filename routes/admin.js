const express = require('express');
const router = express.Router();
const Jobs = require('../models/job');
const Workers = require('../models/workers');
const Admins = require('../models/admin');
const Fuel = require('../models/fuels');
const Events = require('../models/event');
const Equipment = require('../models/equipment');
const Counter = require('../models/counter');
const Client = require('../models/client');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Clients = require('../models/client');


//-----------------------------------------------------Contains routes on the admin page---------------------------------------------- 

router.get('/', (req, res)=> {
    res.render('admin', {
        title: 'Admin',
        name: req.session.name
    });
    
});

//Route to the admin/jobs page. The Jobs.find() function collects the data from the db through mongoose
//The for loop then pushes the results into an array (saveResult) which is sent with the render
router.get('/jobs', async (req, res)=> { 
    //Only finds jobs which are not completed.
    await Jobs.find({isCompleted: false})
    .then((result) => {
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name, 
                idNumber: result[i].idNumber, 
                desc: result[i].description
            });
        }

        saveResult = saveResult.reverse();
        res.render('admin-jobs', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});

//Route to the single-job page. This the page that pops up when a specific job is clicked. Jobs.find() collects the data form the db
//which is put into a tuple and sent with the render
router.get('/single-job', async (req, res)=>{
    let id= req.query.id;

var clientsResult = [];
    await Clients.find()
    .then((result)=> {
        for (var i in result){
            clientsResult.push({
                name: result[i].name 
            });
        }
    })

    var equipmentResult = [];
    await Equipment.find({isTanker: false})
    .then((result)=> {
        for (var i in result){
            equipmentResult.push({
                name: result[i].name 
            });
        }
    })

     await Jobs.find({idNumber: id})
    .then((result) => {

        if(result[0].isCompleted){var stat= 'done'}
        else{var stat='in progress'};
        
        var equipmentStr = "";
        var equipmentFound = [];
            
            equipmentStr = result[0].equipment
            
        var equipmentFound = equipmentStr.split(", ");

        var saveResult = {
                name: result[0].name,
                idNumber: result[0].idNumber,
                description: result[0].description,
                location: result[0].location,
                address: result[0].address,
                workers: result[0].workers,
                client: result[0].client,
                clientsResult: clientsResult,
                equipmentResult: equipmentResult,
                status: result[0].isCompleted,
                hectares: result[0].hectares
        }
        res.render('admin-single-job', {saveResult, equipmentFound});

    })
    .catch((err) =>{
        console.log( err);
        
    }) 
})
    
router.get('/jobs/events', async (req, res)=>{
    await Events.find({job: req.query.id})
    .then((result)=>{
        var saveResult = [];
        for(var i in result){
            saveResult.push({
                id: result[i].idNumber,
                worker: result[i].worker,
                date: result[i].date.getDate() + "-" + (result[i].date.getMonth() + 1) + "-" + result[i].date.getFullYear(),
                notes: result[i].hours
            })
        }
        res.render('admin-jobs-events', {saveResult})
    })
    .catch((err)=>{
        console.log(err)
    })
})

router.get('/staff', async (req, res)=> { 
    var saveAdmin = [];
    var saveStaff = [];
    let adminExists = false;
    if(req.session.username === "ADMIN"){
        adminExists = true;
        await Admins.find().
        then((result)=>{
            for(var i in result){
                saveAdmin.push({
                    username: result[i].username,
                    name: result[i].name,
                    idNumber: result[i].idNumber,
                    email: result[i].email 
                })
            }
        }).catch((error)=>{
            console.log(error)
        })
    }
    
    await Workers.find()
    .then((result) => {
        for (var i in result){
            saveStaff.push({
                username: result[i].username,
                name: result[i].name,
                idNumber: result[i].idNumber,
                email: result[i].email 
            });
        }
        res.render('admin-staff', {saveAdmin, saveStaff, adminExists});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});

router.get('/single-staff', async (req, res)=>{                                
    let id= req.query.id;

     await Workers.find({idNumber: id})
    .then((result) => {
        var saveResult = {
                name: result[0].name,
                idNumber: result[0].idNumber,
                username: result[0].username,
                phoneNumber: result[0].phoneNumber,
                email: result[0].email,
                notes: result[0].notes,
                type: "staff"
        }
        res.render('admin-single-staff', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
})


router.get('/single-admin', async (req, res)=>{                            
    let id= req.query.id;
    await Admins.find({idNumber: id})
    .then((result) => {

        var saveResult = {
                name: result[0].name,
                idNumber: result[0].idNumber,
                username: result[0].username,
                phoneNumber: result[0].phoneNumber,
                email: result[0].email,
                notes: result[0].notes,
                type: "admin",
        }
        res.render('admin-single-admin', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
})

router.post('/edit-admin', async (req, res) =>{
    let { idNumber, name, username, password, phoneNumber, email, notes } = req.body;
            try {
                var result = await Admins.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    name: name,
                    username: username,
                    password: password,
                    phoneNumber: phoneNumber,
                    email: email,
                    notes: notes
                });
                res.render('admin-changes-submitted');  
            } catch (error) {
                res.status(500).send(error);
            }
})


router.get('/time-reports', async (req, res)=> {
    await Events.find()
    .then((result) => {
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                idNumber: result[i].idNumber, 
                job: result[i].job,
                worker: result[i].worker,
                startTime: result[i].startTime,
                endTime: result[i].endTime,
                jobName: result[i].jobName,
                hours: result[i].hours
            });
        }
        saveResult = saveResult.reverse();
        res.render('admin-events', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    })
});

router.get('/single-event', async (req, res)=>{
    let id= req.query.id;

     await Events.find({idNumber: id})
    .then((result) => {

        var saveResult = {
                idNumber: result[0].idNumber,
                worker: result[0].worker,
                job: result[0].job,
                startTime: result[0].startTime,
                endTime: result[0].endTime,
                hours: result[0].hours,
                date: result[0].date.getDate() + "-" + (result[0].date.getMonth() + 1) + "-" + result[0].date.getFullYear(),
                equipment: result[0].equipment,
                hectares: result[0].hectares,
                items: result[0].items,
                notes: result[0].notes
        }
        res.render('admin-events-item', {saveResult}); 

    })
    .catch((err) =>{
        console.log(err);
    }) 
})

router.get('/equipment', async (req, res)=> {               
    await Equipment.find()
    .then((result) => {
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name,
                idNumber: result[i].idNumber,
                serialNumber: result[i].serialNumber
            });
        }

        res.render('admin-equipment', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});

router.get('/equipment-item', async (req, res)=>{
    let id= req.query.id;

     await Equipment.find({idNumber: id})            
    .then((result) => {   
        var saveResult = {
                idNumber: result[0].idNumber,          
                name: result[0].name,
                serialNumber: result[0].serialNumber,
                status: result[0].isTanker,
                notes: result[0].notes,
        }
        res.render('admin-equipment-item', {saveResult});

    })
    .catch((err) =>{
        console.log(err);
    }) 
})

router.get('/fuel', async (req, res)=> {
    await Fuel.find()
    .then((result) => {
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                idNumber: result[i].idNumber,  
                vehicle: result[i].vehicle,  
                liter: result[i].liter,
                fuelTanker: result[i].fuelTanker
            });
        }
        saveResult = saveResult.reverse();
        res.render('admin-fuel', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});

router.get('/fuel-event', async (req, res)=>{
    let id= req.query.id;
     await Fuel.find({idNumber: id})            
    .then((result) => { 

        var saveResult = {
                idNumber: result[0].idNumber, 
                type: result[0].type,        
                liter: result[0].liter, 
                fuelTanker: result[0].fuelTanker,
                vehicle: result[0].vehicle,
                workers: result[0].worker,
                notes: result[0].notes,
                createdAt: result[0].createdAt.getFullYear()  + "-" +(result[0].createdAt.getMonth() + 1) + "-" +  result[0].createdAt.getDate(),
        }
        res.render('admin-fuel-event', {saveResult});

    })
    .catch((err) =>{
        console.log(err);
    }) 
})

router.get('/completed-jobs', async (req, res)=> { 
    await Jobs.find({isCompleted: true})
    .then((result) => {
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name, 
                idNumber: result[i].idNumber, 
                desc: result[i].description
            });
        }
        saveResult = saveResult.reverse();
        res.render('admin-jobs', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});


router.get('/edit-validation', (req, res)=>{
    let userType = req.query.cas;
    let editThisUserID = req.query.id;
    res.render('admin-edit-validation', {editThisUserID, userType})
})

router.post('/edit-validation', async (req, res)=>{
    let editThisUserID = req.query.id;
    let userType = req.query.cas;
    const admin = await Admins.findOne({username: req.session.username}) 
    const isMatch = bcrypt.compareSync(req.body.password, admin.password);
    let name;
    if(isMatch){
        if(userType==="admin"){
            const admin1 = await Admins.findOne({idNumber: editThisUserID}) 
            name = admin1.username;
            res.render('admin-edit-password',{name, userType})
        }
        if(userType==="staff"){
            const staff1 = await Workers.findOne({idNumber: editThisUserID}) 
            name = staff1.username;
            res.render('admin-edit-password',{name, userType})
        }
    }
    else{
        res.render('admin-edit-validation')
    }
})


router.get('/clients', async (req, res)=> {
    await Clients.find()
    .then((result) => {
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name,
                idNumber: result[i].idNumber 
            });
        }

        res.render('admin-client', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});

router.get('/single-client', async (req, res)=>{                                
    let id= req.query.id;
     await Clients.find({idNumber: id})                                                                //put a pin i problemet: varför hittas inget mha id?
     .then((result) => {
        var saveResult = {
                name: result[0].name,
                idNumber: result[0].idNumber,
                phoneNumber: result[0].phoneNumber,
                email: result[0].email,
                notes: result[0].notes
        }
        res.render('admin-single-client', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
})

router.get('/clients/jobs', async (req, res)=>{
    await Jobs.find({client: req.query.id})
    .then((result)=>{
        var saveResult = [];
        for(var i in result){
            saveResult.push({
                id: result[i].idNumber,
                job: result[i].name,
                date: result[i].description,
                notes: result[i].address
            })
        }
        res.render('admin-clients-jobs', {saveResult})
    })
    .catch((err)=>{
        console.log(err)
    })
})


router.get('/clients-add', async(req, res) => {
    increment();

    var i = await Counter.find()
    .then((result) => { return result});

    var newID= i[0].idNumber

    res.render('admin-clients-add', {idNumber: newID} )
})

router.post('/clients-add', async (req, res) => {
    let { idNumber, name, phoneNumber, notes } = req.body;
    try {
        var client = new Clients(req.body);
        var result = await client.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
  });



//---------------------------------------------------------------------End of Routes------------------------------------------------------------------------
//                                                                     SEARCH FUNCTIONS!

//This is a search function for jobs!
router.get('/jobs/search', async (req, res)=>{
    let searchParam = req.query.searchParam;
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    
    if (searchParam !== ""){

        if(isNaN(searchParam)) {searchParamInt = -1}
        else { searchParamInt = parseInt(searchParam)};

        var searchDate1;
        var searchDate2;

        if(dateFrom && dateTo){
        searchDate1 = new Date(dateFrom);
        searchDate2 = new Date(dateTo);
        } else {
        searchDate1 = new Date('1970-01-01Z00:00:00:000');
        searchDate2 = new Date(3000, 12, 04);
        };
        
        const s = searchParam;
        const regex = RegExp(s, 'i')

    await Jobs.find({$and: [
        {$or:[
            {'name':{$regex: regex}}, 
            {'idNumber':(searchParamInt)},
            {'description': {$regex: regex}}, 
            {'workers': {$regex: regex}},
            {'client': {$regex: regex}}
            ]
        },
        {createdAt:{ $gte : searchDate1,  $lte : searchDate2}}
        ]
    })
    .then((result) =>{
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name, 
                idNumber: result[i].idNumber,
                liter: result[i].items,
                type: result[i].equipment,
                fuelTanker: result[i].job,
                worker: result[i].worker,
                
            });
        }
        res.render('admin-jobs-search', {saveResult});
    })
    .catch((err) => {
        console.log(err);
    })
}
})

//This is a search function for staff
router.get('/staff/search', async (req, res)=>{
    let searchParam = req.query.searchParam;
    var searchParamInt;
    if (searchParam !== ""){
    if(isNaN(searchParam)) {searchParamInt = -1}
    else { searchParamInt = parseInt(searchParam)};
    const s = searchParam;
    const regex = RegExp(s, 'i')

    await Workers.find({$or:[{'name':{$regex: regex}}, {'idNumber':(searchParamInt)}] })
    .then((result) =>{
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name, 
                idNumber: result[i].idNumber
            });
        }

        res.render('admin-staff-search', {saveResult});
    })

    .catch((err) => {
        console.log(err);
    })
}
})

//This is a search function for fuel!

router.get('/fuel/search', async (req, res)=>{
    let searchParam = req.query.searchParam;
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    
    if (searchParam !== ""){

        if(isNaN(searchParam)) {searchParamInt = -1}
        else { searchParamInt = parseInt(searchParam)};
        
        var searchDate1;
        var searchDate2;

        if(dateFrom && dateTo){
        searchDate1 = new Date(dateFrom);
        searchDate2 = new Date(dateTo);
        } else {
        searchDate1 = new Date('1970-01-01Z00:00:00:000');
        searchDate2 = new Date(3000, 12, 04);
        };

        const s = searchParam;
        const regex = RegExp(s, 'i')

    await Fuel.find({$and: [
        {$or:[
            {'type':{$regex: regex}}, 
            {'idNumber':(searchParamInt)},
            {'fuelTanker': {$regex: regex}}, 
            {'liter': (searchParamInt)}, 
            {'vehicle': {$regex: regex}}, 
            {'worker': {$regex: regex}},
            {'notes': {$regex: regex}}
            ]
        },
        {createdAt: { $gte : searchDate1,  $lte : searchDate2}}
        ]
    })
    .then((result) =>{
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name, 
                idNumber: result[i].idNumber,
                liter: result[i].liter,
                type: result[i].type,
                fuelTanker: result[i].fuelTanker,
                worker: result[i].worker,
                
            });
        }
        res.render('admin-fuel-search', {saveResult});
    })
    .catch((err) => {
        console.log(err);
    })
}
})


//This is a search function for events under time report 2021020220210505
router.get('/events/search', async (req, res)=>{
    let searchParam = req.query.searchParam;
    let dateFrom = req.query.dateFrom;
    let dateTo = req.query.dateTo;
    
    if (searchParam !== ""){

        if(isNaN(searchParam)) {searchParamInt = -1}
        else { searchParamInt = parseInt(searchParam)};
        
        var searchDate1;
        var searchDate2;

        if(dateFrom && dateTo){
        searchDate1 = new Date(dateFrom);
        searchDate2 = new Date(dateTo);
        } else {
        searchDate1 = new Date('1970-01-01Z00:00:00:000');
        searchDate2 = new Date(3000, 12, 04);
        };

        const s = searchParam;
        const regex = RegExp(s, 'i')

    await Events.find({$and: [
        {$or:[
            {'name':{$regex: regex}}, 
            {'idNumber':(searchParamInt)},
            {'items': {$regex: regex}}, 
            {'equipment': {$regex: regex}}, 
            {'job': {$regex: regex}}, 
            {'worker': {$regex: regex}}
            ]
        },
        {date :{ $gte : searchDate1,  $lte : searchDate2}}
        ]
    })
    .then((result) =>{
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({ 
                jobName: result[i].jobName, 
                idNumber: result[i].idNumber,
                liter: result[i].items,
                type: result[i].equipment,
                fuelTanker: result[i].job,
                worker: result[i].worker,
                startTime: result[i].startTime,
                endTime: result[i].endTime,
                hours: result[i].hours
                
            });
        }
        res.render('admin-events-search', {saveResult});
    })
    .catch((err) => {
        console.log(err);
    })
}
})

//Search function for equipment
router.get('/equipment/search', async (req, res)=>{
    let searchParam = req.query.searchParam;
    var searchParamInt;
    
    if (searchParam !== ""){

        var searchDate1;
        var searchDate2;

        if(isNaN(searchParam)) {searchParamInt = -1}
        else { searchParamInt = parseInt(searchParam)};

        if(searchParam.length == 16){
       const timeSearch = searchParam.toString();
       let year1 = parseInt(timeSearch.substring(0, 4));
       let month1 = parseInt(timeSearch.substring(4, 6))-1;
       let day1 = parseInt(timeSearch.substring(6, 8))+1;
        searchDate1 = new Date(year1, month1, day1);

       let year2 = parseInt(timeSearch.substring(8, 12));
       let month2 = parseInt(timeSearch.substring(12, 14))-1;
       let day2 = parseInt(timeSearch.substring(14, 16))+1;
        searchDate2 = new Date(year2, month2, day2);
        }
        
        const s = searchParam;
        const regex = RegExp(s, 'i')

    await Equipment.find({$or:[{'name':{$regex: regex}}, {'idNumber':(searchParamInt)},
     {'serialNumber': {$regex: regex}}, {'notes': {$regex: regex}}, {createdAt: { $gte : searchDate1,  $lte : searchDate2}}
    ]})
    .then((result) =>{
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                name: result[i].name, 
                idNumber: result[i].idNumber,
                serialNumber: result[i].serialNumber,
                notes: result[i].notes
            });
        }
        res.render('admin-equipment-search', {saveResult});
    })
    .catch((err) => {
        console.log(err);
    })
}
})
//----------------------------------------------SEARCH FUNCTIONS END!-------------------------------------------------------
//                                                  START ADD FUCTION
router.get('/jobs-add', async(req, res) => {
    increment();

    var equipmentResult = [];
    await Equipment.find({isTanker: false})
    .then((result)=> {
        for (var i in result){
            equipmentResult.push({
                name: result[i].name 
            });
        }
    })
    var i = await Counter.find()
    .then((result) => { return result});

    var newID= i[0].idNumber

    var clientsResult = [];
    await Clients.find()
    .then((result)=> {
        for (var i in result){
            clientsResult.push({
                name: result[i].name 
            });
        }
    })
    res.render('admin-jobs-add', {idNumber: newID, clientsResult, equipmentResult} )
})

router.post('/jobs-add', async (req, res) => {
    
    var str = ""
    for (var i in req.body.equipment){
        if (req.body.equipment[i]){
            if(i > 0) {str = str + ", "}
            str = str + req.body.equipment[i];
        }
    }

    let { idNumber, name, description, location, address, workers, client, hectares } = req.body;
    try {
        if(location === "" || !location.includes("https")){
            req.body.location = "https://www.google.com/maps"
        }
        var job = new Jobs(req.body);
        job.isCompleted=false;
        job.equipment = str;
        var result = await job.save();
        /*res.send();*/
    } catch (error) {
        res.status(500).send(error);
    }
  });


router.get('/equipment-add', async(req, res) => {
    increment();

    var i = await Counter.find()
    .then((result) => { return result});

    var newID= i[0].idNumber
    
    res.render('admin-equipment-add', {idNumber: newID});
})

router.post('/equipment-add', async (req, res) => {
    let { idNumber, name, serialNumber,status, notes } = req.body;
    try {
        var booltanker = false;
                if (status == "true"){
                    booltanker = true;
                }
        var eq = new Equipment({idNumber: idNumber,
            name: name,
            serialNumber: serialNumber,
            isTanker: booltanker,
            notes: notes});
        var result = await eq.save();
        res.send();
    } catch (error) {
        console.log(error);
    }
  });

//----------------------------------------------ADD FUNCTION END!-------------------------------------------------------
//                                             EDIT FUNCTION START
//the universal edit system, the function bellow allows the admin to edit all collections by sending a request query (cas) with the indicated collection
router.post('/edit', async (req, res) => {
      let cas= req.query.cas;
    
      switch(cas){
       case "job":{
            let { idNumber, name, description, location, address, workers, equipment1, status, hectares, clients } = req.body;
            try {
                var boolIsCompleted = false;
                if (status == "true"){
                    boolIsCompleted = true;
                };


                var str = ""
                for (var i in equipment1){
                    if (equipment1[i]){
                        if(i > 0) {str = str + ", "}
                        str = str + equipment1[i];
                    }
                }

                var result = await Jobs.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    name: name,
                    description: description,
                    location: location,
                    address: address,
                    workers: workers,
                    client: clients,
                    equipment: str,
                    isCompleted: boolIsCompleted,
                    hectares: hectares
                    
                });
            } catch (error) {
                res.status(500).send(error);
            }
        }
        case "staff":{
            let { idNumber, name, username, password, phoneNumber, email, notes } = req.body;
            try {
                var result = await Workers.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    name: name,
                    username: username,
                    phoneNumber: phoneNumber,
                    email: email,
                    notes: notes
                });
            } catch (error) {
                res.status(500).send(error);
            }
        }
        case "report":{
            let { idNumber, worker, job, startTime, endTime, hours, date, equipment, hectares, items, notes } = req.body;
            try {
                var result = await Events.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    worker: worker,
                    job: job,
                    startTime: startTime,
                    endTime: endTime,
                    hours: hours,
                    date: date,
                    equipment: equipment, 
                    hectares: hectares,
                    items: items,
                    notes: notes
                });
            } catch (error) {
                res.status(500).send(error);
            }
        }

        case "equipment":{                                                     
            let { idNumber, name, serialNumber, status, notes } = req.body;
            try {
                var booltanker = false;
                if (status == "true"){
                    booltanker = true;
                }
                var result = await Equipment.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    name: name,
                    isTanker: booltanker,
                    serialNumber: serialNumber,
                    notes: notes
                });
            } catch (error) {

                res.status(500).send(error);
            }
        }
        
        case "fuel":{                                                                             
            let { idNumber, type, liter, fuelTanker, vehicle, workers, notes } = req.body;
            try {
                var result = await Fuel.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    type: type,
                    liter: liter,
                    fuelTanker: fuelTanker,
                    vehicle: vehicle,
                    worker: workers,
                    notes: notes
                });
                
            } catch (error) {
                res.status(500).send(error);
            }
        }

        case "client":{
            let { idNumber, name, phoneNumber, email, notes } = req.body;
            try {
                var result = await Client.updateOne({idNumber: idNumber}, {
                    idNumber: idNumber,
                    name: name,
                    phoneNumber: phoneNumber,
                    email: email,
                    notes: notes
                });
            } catch (error) {
                res.status(500).send(error);
            }
        }
        res.render('admin-changes-submitted');

    }
});

router.get('/edit-password', (req, res)=>{
    res.render('admin-edit-password');
})

router.post('/edit-password', async (req, res)=>{
    if(req.body.password != req.body.repeatPassword){   //kollar om lösen o repeat är samma
        res.redirect('edit-password')
    }
    if(req.query.cas === "staff"){
        let workerUser = req.query.id;
        let password = bcrypt.hashSync(req.body.password, 10);
        try{
            var result = await Workers.updateOne({username: workerUser}, {
                password: password
            });
            res.render('admin-changes-submitted');
        }
        catch(error){
            res.status(500).send(error);
        }
    }

    if(req.query.cas === "admin"){
        let adminUser = req.query.id;
        let password1 = bcrypt.hashSync(req.body.password, 10);
        try{
            var result = await Admins.updateOne({username: adminUser}, {
                password: password1
            });
            res.render('admin-changes-submitted');
        }
        catch(error){
            res.status(500).send(error);
        }
    }
})


//----------------------------------------------EDIT FUNCTION END!-------------------------------------------------------
//                                             DELETE FUNCTION START
router.get('/delete', async (req, res) =>{ 
    let cas= req.query.cas;
    let id= req.query.id;
    try{
    switch (cas) {
        case "job": 
            await Jobs.deleteOne({idNumber: id})
            .then((result) => {console.log("job deleted")})
            .catch((err) =>{
                console.log(err);
            }); 
        break;
        case "staff":
            await Workers.deleteOne({idNumber: id})
            .then((result) => {console.log("staff deleted")})
            .catch((err) =>{
                console.log(err);
            }); 
            break;
        case "report":
            await Events.deleteOne({idNumber: id})
            .then((result) => {console.log("event deleted")})
            .catch((err) =>{
                console.log(err);
            }); 
            break;
        case "equipment": 
            await Equipment.deleteOne({idNumber: id})
            .then((result) => {console.log("equipment deleted")})
            .catch((err) =>{
                console.log(err);
            }); 
            break;
        case "admin":
            await Admins.deleteOne({idNumber: id})
            .then((result) => {console.log("admin deleted")})
            .catch((err) =>{
                console.log(err);
            }); 
            break;
        case "fuel":
            await Fuel.deleteOne({idNumber: id})
            .then((result) => {console.log("fuel deleted")})
            .catch((err) =>{
                console.log(err);
            });
        }
    }
        catch{
        res.status(500).send(error);
        }

res.render('admin-delete');
});
router.delete('/delete', (req, res)=> {
    res.send(result);
});
//----------------------------------------------DELETE FUNCTION END!-------------------------------------------------------
//                                            NUMBERIID COUNTER START

async function increment(){
    try {
        var i = await Counter.updateOne({$inc: {idNumber: 1}});
    } catch (error) {
        console.log(error);
    }
}
//----------------------------------------------NUMBERID COUNTER FUNCTION END!-------------------------------------------------------
//                                                     Stats page
router.get('/statistics', async (req, res)=> { 
    //Only finds jobs which are not completed.
    var fuelTankerResult = []
    var workerResult = [];
    var equipmentResult = [];
    var jobsResult = [];

    await Equipment.find({isTanker: true})
    .then((result) => {  
        for (var i in result){
            fuelTankerResult.push({
                name: result[i].name
            });
        }
    })
    .catch((err) =>{
        console.log(err);
    })

    await Workers.find({})
    .then((result) => {  
        for (var i in result){
            workerResult.push({
                name: result[i].name,
                username: result[i].username
            });
        }
    })
    .catch((err) =>{
        console.log(err);
    })
    
    await Equipment.find({})
    .then((result) => {  
        for (var i in result){
            equipmentResult.push({
                name: result[i].name
            });
        }
    })
    .catch((err) =>{
        console.log(err);
    })

    await Jobs.find({})
    .then((result) => {  
        for (var i in result){
            jobsResult.push({
                name: result[i].name,
                idNumber: result[i].idNumber
            });
        }
    })
    .catch((err) =>{
        console.log(err);
    })
    
    res.render('admin-statistics', {fuelTankerResult, workerResult, equipmentResult, jobsResult});
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/statistics/total', async (req, res)=> { 
    let fuelTankerParam = req.query.fuelTanker;
    let workerParam = req.query.worker;
    let equipmentParam = req.query.equipment;
    equipmentParam = equipmentParam
    let jobParam = req.query.job;
    let option = req.query.option;
    var sum = 0;
    var sumHours = 0;
    var sumHectares = 0;
    var searchDate1;
    var searchDate2;
    var period = "";
    if(req.query.dateFrom==7||req.query.dateTo==7){
        searchDate1 = new Date()
        searchDate2 = new Date()
        searchDate1.setDate(searchDate2.getDate()-7);
        period = "for the last 7 days"
    
    }
    else if(req.query.dateFrom==30||req.query.dateTo==30){
        searchDate1 = new Date()
        searchDate2 = new Date()
        searchDate1.setDate(searchDate2.getDate()-30);
        period = "for the last 30 days"
    }
    else {
        searchDate1 = new Date(req.query.dateFrom);
        searchDate2 = new Date(req.query.dateTo);
    }
    const s = equipmentParam;
    const regex = RegExp(s, 'i')

    var searchParams = []
    if (workerParam) {searchParams.push({'worker':workerParam})}
    
    if (fuelTankerParam) {searchParams.push({'fuelTanker': fuelTankerParam})}
    if (jobParam) {searchParams.push({'job': jobParam})}
    
    if ( option==1 && searchDate1 && searchDate2) {searchParams.push({date: { $gte: searchDate1,  $lte: searchDate2}})}
    if ( option==0 && searchDate1 && searchDate2) {searchParams.push({createdAt: { $gte: searchDate1,  $lte: searchDate2}})}

    if (equipmentParam) {searchParams.push({'vehicle': {$regex: regex}})}
    var searchObject = {$and: searchParams}
    
       
    if(option == 1){    //kör hours här vettja    
        await Events.find(searchObject) //EVEYTHING HERE was WRONG FIX IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        .then((result) =>{
            for (var i in result){
                sum = sum + result[i].hours;
            }
            res.render('admin-statistics-total', {sum, unit:'hours', period});
        })
        .catch((err) => {
            console.log(err);
        })
    }
 
    ///////////////////////////////////////////// o---(^.^)---o////////////////////////////////////////
//fuel ---- here is nice it do be working
    else{   
        await Fuel.find(searchObject)
        .then((result) =>{
            for (var i in result){
                sum = sum + result[i].liter
            }
            })
        .catch((err) => {
            console.log(err);
        })

        var searchParams2 = []
    if (workerParam) {searchParams2.push({'worker':workerParam})}
    if (equipmentParam) {searchParams2.push({'equipment': {$regex: regex}})}
    if (jobParam) {searchParams2.push({'job': jobParam})}
    
    if ( option==1 && searchDate1 && searchDate2) {searchParams2.push({date: { $gte: searchDate1,  $lte: searchDate2}})}
    if ( option==0 && searchDate1 && searchDate2) {searchParams2.push({createdAt: { $gte: searchDate1,  $lte: searchDate2}})}

    var searchObject2 = {$and: searchParams2}

        
        await Events.find(searchObject2)
        .then((result) =>{
            for (var i in result){
                sumHours = sumHours + result[i].hours;
                sumHectares = sumHectares + result[i].hectares;
            }
            })
        .catch((err) => {
            console.log(err);
        })

        res.render('admin-statistics-fuel', {sum, unit:'litres', period, sumHours, sumHectares});
    }
}
    );

module.exports = router;