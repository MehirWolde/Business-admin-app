const express = require('express');
const router = express.Router();
const Jobs = require('../models/job');
const Workers = require('../models/workers');
const Admins = require('../models/admin');
const Fuel = require('../models/fuels');
const Events = require('../models/event');
const Equipment = require('../models/equipment');
const Counter = require('../models/counter');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const { post } = require('./admin');

///-----------------------------------------------------Contains routes on the worker page---------------------------------------------- 

router.get('/',(req, res)=> {
    res.render('worker', {title: "worker", username: req.session.name});  
});

router.get('/jobs', async (req, res)=> {
    
    const s = req.session.username;
    const regex = RegExp(s, 'i')    

    await Jobs.find(
        {$and: [
            {workers: {$regex: regex}}, 
            {isCompleted: false}
            ]
        }
    )
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
        res.render('worker-jobs', {saveResult});
    })
    .catch((err) =>{
        console.log(err);
    }) 
});

router.get('/jobs-item', async (req, res)=> {
    let id= req.query.id;

    await Jobs.find({idNumber: id})
    .then((result) => {

        var saveResult = {
                name: result[0].name,
                idNumber: result[0].idNumber,
                description: result[0].description,
                location: result[0].location,
                address: result[0].address,
                workers: result[0].workers,
                client: result[0].client,
                equipment: result[0].equipment,
                hectares: result[0].hectares
        }
        res.render('worker-jobs-item', {saveResult});

    })
    .catch((err) =>{
        console.log(err);
    }); 

});

router.get('/jobs-item-report', async (req, res)=> {
    await increment();
    
    var equipmentStr = "";
    var equipmentResult = [];

    await Jobs.find({idNumber: req.query.id})
    .then((result) => {
        equipmentStr = result[0].equipment
    })
    .catch((error) => {console.log(error)});


    var equipmentResult = equipmentStr.split(", ");


    await Counter.find()
    .then((result) => {
    var newID = result[0].idNumber;
    res.render('worker-jobs-item-report', {id: req.query.id, idNumber: newID, name: req.session.username, equipment: equipmentResult});
    })
    .catch((error) => {console.log(error)});
    
    
});

router.post('/jobs-item-report', async (req, res) => {

    var name;
    var str = ""
    for (var i in req.body.equipment){
        if (req.body.equipment[i]){
            if(i > 0) {str = str + ", "}
            str = str + req.body.equipment[i];
        }
    }

    await Jobs.find({idNumber: req.query.id})
    .then((result) => {
        name = result[0].name
    })
    .catch((error) => {console.log(error)});
        
    req.body.worker = req.session.username;
    try {
        var event = new Events(req.body);
        event.job = req.query.id;
        event.equipment = str;
        event.worker = req.session.username;
        event.jobName = name;
        var result = await event.save();
        res.redirect('/worker/jobs-item?id='+req.query.id);
    } catch (error) {
        res.status(500).send(error);
    }
  });

router.get('/jobs-item-worklog', async (req, res) => {
    await Events.find({job: req.query.id, worker: req.session.username}).
    then((result)=>{
        var saveResult = [];
        for (var i in result){
            saveResult.push({
                date: result[i].date.getDate() + "-" + (result[i].date.getMonth() + 1) + "-" + result[i].date.getFullYear(), 
                id: result[i].idNumber, 
                notes: result[i].notes,
                hours: result[i].hours
            });
        }
        saveResult = saveResult.reverse();
        res.render('worker-jobs-item-worklog', {saveResult, idNumber: req.query.id});
    })
    .catch((err) =>{
        console.log(err);
    }) 
})

router.get('/jobs-item/single-log', async (req, res) =>{
    await Events.find({idNumber: req.query.id}).
    then((result) => {
        var saveResult = {
            id: result[0].idNumber,
            job: result[0].job,
            start: result[0].startTime,
            end: result[0].endTime,
            hours: result[0].hours,
            date: result[0].date.getDate() + "-" + (result[0].date.getMonth() + 1) + "-" + result[0].date.getFullYear(),
            equipment: result[0].equipment,
            hectares: result[0].hectares,
            items: result[0].items,
            notes: result[0].notes
        }
        res.render('worker-jobs-item-worklog-single', {saveResult});
    }).catch((err)=>{
        console.log(err)
    })
})


router.get('/fuel-log', async (req, res)=> {
    await increment();

    var i = await Counter.find()
    .then((result) => { return result});

    var newID= i[0].idNumber
    var tankers = [];
    
    await Equipment.find({isTanker: true})
    .then((result) => {  
        for (var i in result){
            tankers.push({
                name: result[i].name
            });
        }
    })
    .catch((err) =>{
        console.log(err);
    })

    await Equipment.find()
    .then((result) => {
        var equipmentResults = [];
        
        for(var i in result){
            equipmentResults.push({ 
                name: result[i].name, 
                serialNumber: result[i].serialNumber 
            }); 
        }
    res.render('worker-fuel-log', {name: req.session.username, type: "Diesel", equipmentResults, tankers, idNumber: newID});
})});

router.post('/fuel-report', async (req, res) => { 
    try {
        var fuel = new Fuel(req.body);
        fuel.worker = req.session.username;
        var result = await fuel.save();
        res.redirect('/worker')
    } catch (error) {
        res.status(500).send(error);
    }
  });

  router.get('/time-report', async (req, res)=>{
      await Events.find({worker: req.session.username})
      .then((result)=>{
          var saveResult = [];
    
        for(var i in result){
                saveResult.push({
                jobName: result[i].jobName, 
                date: result[i].date.getDate() + "-" + (result[i].date.getMonth() + 1) + "-" + result[i].date.getFullYear(), 
                id: result[i].idNumber, 
                notes: result[i].notes,
                job: result[i].job
            });
          }
          saveResult = saveResult.reverse();
          res.render('worker-time-report', {saveResult});
      }).catch((err)=>{
          console.log(err);
      })
  })

  router.get('/time-report/search', async (req, res)=>{
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
            {'jobName':{$regex: regex}}, 
            {'idNumber':(searchParamInt)},
            {'startTime': {$regex: regex}}, 
            {'endTime': {$regex: regex}},
            {'equipment': {$regex: regex}},
            {'notes': {$regex: regex}}
            ]
        },
        {date: { $gte : searchDate1,  $lte : searchDate2}}
        ]
    })
    .then((result) =>{
        var saveResult = [];
        
        for (var i in result){
            saveResult.push({
                jobName: result[i].jobName, 
                idNumber: result[i].idNumber,
                date: result[i].date,
                notes: result[i].notes
                
            });
        }
        res.render('worker-time-report-search', {saveResult});
    })
    .catch((err) => {
        console.log(err);
    })
}
});            
               

//--------------------------------NUMBERIID COUNTER BELLOW-----------------------

async function increment(){
    try {
        var i = await Counter.updateOne({$inc: {idNumber: 1}});
    } catch (error) {
        console.log(error);
    }
}

router.get('/statistics/total', async (req, res)=> { 
    let workerParam = req.session.username;
    let option = req.query.option;
    var sum = 0;
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
    
    var searchParams = []
    if (workerParam) {searchParams.push({'worker':workerParam})}    
    if ( option==1 && searchDate1 && searchDate2) {searchParams.push({date: { $gte: searchDate1,  $lte: searchDate2}})}
    if ( option==0 && searchDate1 && searchDate2) {searchParams.push({createdAt: { $gte: searchDate1,  $lte: searchDate2}})}

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
            res.render('admin-statistics-total', {sum, unit:'litres', period});
        })
        .catch((err) => {
            console.log(err);
        })
    }
}
    );

module.exports = router;