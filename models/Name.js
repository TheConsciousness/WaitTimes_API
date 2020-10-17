const mongoose = require("mongoose");
var Int32 = require('mongoose-int32');

const rideSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.ObjectId
	},
	name: {
		type: String
	}
});

module.exports = mongoose.model('Name', rideSchema, "Names");