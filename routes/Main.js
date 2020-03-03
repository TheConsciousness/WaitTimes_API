const express = require("express");
const moment = require("moment-timezone");
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
router.get("/name/:name/between/days/:dayOne/and/:dayTwo", async (req, res) => {
	console.log(`'/name/${req.params.name}/between/days/${req.params.dayOne}/and/${req.params.dayTwo}' requested`);
	
	if (!moment(req.params.dayOne).isValid() || !moment(req.params.dayTwo).isValid()) {
		return res.send("Input dates not valid");
	}
	
	try {
		// TZ does NOT work in this case...despite my thousand attempts. I believe TZ and .unix() don't play well together.
		// moment(req.params.dayOne).startOf('day').tz('America/Indiana/Indianapolis').unix();
		
		// Not proud of this...
		const tmpObjIdOne = ObjectID.createFromTime(moment(req.params.dayOne).startOf('day').add(5, 'hours').unix());
		const tmpObjIdTwo = ObjectID.createFromTime(moment(req.params.dayTwo).endOf('day').add(5, 'hours').unix());
		
		// tmpObjIdOne.getTimestamp() doesn't reflect how Mongo actually parses the timestamp....
		//console.log(`Searching between ${tmpObjIdOne.getTimestamp()} and ${tmpObjIdTwo.getTimestamp()}`);
		
		const rides = await Ride.find({"_id":{$gt: tmpObjIdOne, $lt: tmpObjIdTwo}, "name":req.params.name});

		let formattedRides = rides.map((ride) => {
			//return { time:moment(ride.toJSON()._id.getTimestamp()).tz('America/Indiana/Indianapolis').format('MM/DD/YYYY h:mm:ss A'), waitTime:ride.toJSON().waitTime };
			return { time:ride.toJSON().time, waitTime:ride.toJSON().waitTime };
		});
				
		return res.send(formattedRides); 
	}
	catch (err) {
		return res.send("catch: "+err);
	}
});

// Get name between times
router.get("/name/:name/between/times/:dayOne/and/:dayTwo", async (req, res) => {

	console.log(`'/name/${req.params.name}/between/${req.params.dayOne}/and/${req.params.dayTwo}' requested`);
	
		if (!moment(req.params.dayOne).isValid() || !moment(req.params.dayTwo).isValid()) {
		return res.send("Input dates not valid");
	}
	
	try {
		const tmpObjIdOne = ObjectID.createFromTime(moment(req.params.dayOne).startOf('day').unix());
		const tmpObjIdTwo = ObjectID.createFromTime(moment(req.params.dayTwo).endOf('day').unix());
		//const tmpObjIdOne = ObjectID.createFromTime(moment("2020-02-15").startOf('day').unix());
		//const tmpObjIdTwo = ObjectID.createFromTime(moment("2020-02-16").endOf('day').unix());
		
		const rides = await Ride.find({"_id":{$gt: tmpObjIdOne, $lt: tmpObjIdTwo}, "name":req.params.name});
		const beforeTime = moment().valueOf();
		
		//rides.forEach((ride,index) => { console.log(ride); console.log('the id: '+ ride._id); console.log('the name: '+ride.name); });
				
		let formattedRides = rides.map((ride) => {
			//console.log("1: "+ moment(ride.toJSON()._id.getTimestamp()).tz('America/Indiana/Indianapolis').format());
			return { time:moment(ride.toJSON()._id.getTimestamp()).tz('America/Indiana/Indianapolis').format('MM/DD/YYYY h:mm:ss A'), waitTime:ride.toJSON().waitTime };
		});
		const afterTime = moment().valueOf();
				
		return res.send(formattedRides); 
	}
	catch (err) {
		return res.send("catch: "+err);
	}
});


// Get one
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