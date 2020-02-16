const mongoose = require("mongoose");
var Int32 = require('mongoose-int32');

const rideSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.ObjectId
	},
	waitTimes: {
		type: Int32
	},
	status: {
		type: String
	}
});

//module.exports = mongoose.model('Ride', rideSchema);
module.exports = mongoose.model('Ride', rideSchema, "Rides");