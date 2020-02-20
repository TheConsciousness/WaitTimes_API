const express = require("express");
const moment = require("moment");
const router = express.Router();
const Ride = require("../models/Ride");
var ObjectID = require("bson-objectid");
var Int32 = require('mongoose-int32');

/*  Endpoints:
	/ 
    /id/{Mongo ObjectId}/
	/name/{RideName}/
	/days/{Date in YYYY-DD-MM format}/
	/name/{RideName}/between/YYYY-DD-MM/and/YYYY-DD-MM/
*/


// Get one
router.get("/id/:id", async (req, res) => {
	console.log("'/id/' requested");
	
	try {
		const rides = await Ride.find({"_id":req.params.id});
		return res.send(rides);
	}
	catch (err) {
		return res.send("catch: "+err);
	}
});

// Get all by name
router.get("/name/:name", async (req, res) => {
	console.log("'/name/{name}' requested");
	
	try {
		const rides = await Ride.find({"name":req.params.name});
		return res.send(rides);
	}
	catch (err) {
		return res.send("catch: "+err);
	}
});

// Get one day
router.get("/days/:date", async (req, res) => {
	console.log("'/days/{date}' requested");
	
	if (!moment(req.params.date).isValid()) {
		return res.send("Input date not valid");
	}
	
	try {
		const tmpObjId = ObjectID(moment(req.params.date).valueOf());
		const rides = await Ride.find({"_id":{$gt: tmpObjId}});
		return res.send(rides);
	}
	catch (err) {
		//return res.json({message: err.message});
		return res.send("catch: "+err);
	}
});

// Get name between dates
router.get("/name/:name/between/:dayOne/and/:dayTwo", async (req, res) => {

	console.log(`'/name/${req.params.name}/between/${req.params.dayOne}/and/${req.params.dayTwo}' requested`);
	console.log("Using moment of "+moment("2020-02-15").endOf('day').unix());
	
		if (!moment(req.params.dayOne).isValid() || !moment(req.params.dayTwo).isValid()) {
		return res.send("Input dates not valid");
	}
	
	try {
		const tmpObjIdOne = ObjectID.createFromTime(moment(req.params.dayOne).startOf('day').unix());
		const tmpObjIdTwo = ObjectID.createFromTime(moment(req.params.dayTwo).endOf('day').unix());
		//const tmpObjIdOne = ObjectID.createFromTime(moment("2020-02-15").startOf('day').unix());
		//const tmpObjIdTwo = ObjectID.createFromTime(moment("2020-02-16").endOf('day').unix());
		
		const rides = await Ride.find({"_id":{$gt: tmpObjIdOne, $lt: tmpObjIdTwo}, "name":req.params.name});
		
		//rides.forEach((ride,index) => { console.log(ride); console.log('the id: '+ ride._id); console.log('the name: '+ride.name); });
				
		let formattedRides = rides.map((ride) => {
			return { id:ride.toJSON()._id, waitTime:ride.toJSON().waitTime };
		});
				
		return res.send(formattedRides); 
	}
	catch (err) {
		return res.send("catch: "+err);
	}
});

// Get all
router.get("/", async (req, res) => {
	console.log("'/' requested");
	
	try {
		const rides = await Ride.findOne()
		return res.send(rides);
		//return res.send("try");
	}
	catch (err) {
		//return res.json({message: err.message});
		return res.send("catch: "+err);
	}
});

module.exports = router;