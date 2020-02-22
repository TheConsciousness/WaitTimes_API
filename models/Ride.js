const mongoose = require("mongoose");
var Int32 = require('mongoose-int32');

const rideSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.ObjectId
	},
	name: {
		type: String
	},
	time: {
		type: String
	},
	park: {
		type: String
	},
	status: {
		type: String
	},
	waitTime: {
		type: Int32
	}
});

//module.exports = mongoose.model('Ride', rideSchema);
module.exports = mongoose.model('Ride', rideSchema, "Rides");