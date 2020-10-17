const express = require("express");
const moment = require("moment-timezone");
const router = express.Router();
const Ride = require("../models/Ride");
const Name = require("../models/Name");
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

// Get one day
router.get("/ridenames", async (req, res) => {
	console.log("'/ridenames' requested");
	
	try {
		let plainText = "";
		const names = getAllRideNames().then((names) => {
			names.forEach((name) => {
				plainText += name.name +"\n";
			})
			return res.send(plainText);
		})
	}
	catch (err) {
		//return res.json({message: err.message});
		return res.send("/ridenames catch: "+err);
	}
});

 // Get current conditions
router.get("/test", async (req, res) => {
	console.log("'/test' requested");
	
	try {
		let allRidePromises = [];
		
		//Ride.find({"name":"DINOSAUR"}).sort({"time":-1}).limit(1).catch((err) => console.log("getAllRidesLastEntry error: " + err)).then((doc) => resolve(doc));
		
		
		console.time("DINOSAUR")
		Ride.find({"name":"DINOSAUR"}).sort({"time":-1}).limit(1).stream().on('data', (doc) => { console.log(doc); console.timeEnd("DINOSAUR")});
		Ride.find({"name":"Monsters Inc Laugh Floor"}).sort({"time":-1}).limit(1).stream().on('data', (doc) => { console.log(doc); console.timeEnd("DINOSAUR")});
		Ride.find({"name":"Enchanted Tales with Belle"}).sort({"time":-1}).limit(1).stream().on('data', (doc) => { console.log(doc); console.timeEnd("DINOSAUR")});
		Ride.find({"name":"Meet Ariel at Her Grotto"}).sort({"time":-1}).limit(1).stream().on('data', (doc) => { console.log(doc); console.timeEnd("DINOSAUR")});

		//console.time("DINOSAUR");
		//getRidesLastEntry("DINOSAUR").then((doc) => {res.send(doc); console.timeEnd("DINOSAUR");});
	}
	catch (err) {
		//return res.json({message: err.message});
		return res.send("catch: "+err);
	}
}); 


/* // Get current conditions
router.get("/current", async (req, res) => {
	console.log("'/current' requested");
	
	try {
		const names = getAllRideNames().then((names) => {
			let allRidePromises = [];
			
			names.forEach((name) => {
				allRidePromises.push(getRidesLastEntry(name.name).then((doc) => console.log(doc + " promise resolved"))) 
			})
			
			const resolvedAll = Promise.all(allRidePromises).then(() => res.send("done"));
			
			//return res.send(resolvedAll);
		});
	}
	catch (err) {
		//return res.json({message: err.message});
		return res.send("catch: "+err);
	}
}); */

// Get Ride's most recent entry
const getRidesLastEntry = (name) => {
	return new Promise((resolve, reject) => {
		Ride.find({"name":name}).sort({"time":-1}).limit(1).catch((err) => console.log("getAllRidesLastEntry error: " + err)).then((doc) => resolve(doc));
	})
}

// Get list of all rides by name
const getAllRideNames = async () => {
	try {
		return await Name.find();
	}
	catch (err) {
		console.log(err);
		return;
	}
}

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
	console.log(`'/' requested`);

	try {
		//const tmpObjIdOne = new Date('03/02/2020');
		//const tmpObjIdTwo = new Date('03/04/2020');
		
		var pipeline = [
			//{$match: {time: {$gt: tmpObjIdOne, $lt: tmpObjIdTwo}}},
			{$match: {_id: {$gt: ObjectID.createFromTime(moment(req.params.dayOne).startOf('day').unix()), $lt: ObjectID.createFromTime(moment(req.params.dayOne).endOf('day').unix())}}},
			{$project: {dayOfWeek: {$dayOfWeek: '$time'}, name: "$$ROOT.name", time: "$$ROOT.waitTime", park: "$$ROOT.park"}},
			{$group: {_id: '$$ROOT.name', avgWait: { $avg: "$$ROOT.time" }}}
			//{$match: {dayOfWeek: 3}}
		];
		const rides = await Ride.aggregate(pipeline)

		/*
		const rides = await Ride.find({"_id":{$gt: tmpObjIdOne, $lt: tmpObjIdTwo}, "name":req.params.name});
		let formattedRides = rides.map((ride) => {
			//return { time:moment(ride.toJSON()._id.getTimestamp()).tz('America/Indiana/Indianapolis').format('MM/DD/YYYY h:mm:ss A'), waitTime:ride.toJSON().waitTime };
			return { time:ride.toJSON().time, waitTime:ride.toJSON().waitTime };
		});
		*/		
		return res.send(rides); 
	}
	catch (err) {
		return res.send("catch: "+err);
	}
});

module.exports = router;