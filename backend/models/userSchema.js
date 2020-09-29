const mongoose = require("mongoose");
var GeoJSON = require("mongoose-geojson-schema");

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  pwd: String,
  perimeter: Number,
  contacts: [{ type: ObjectId, ref: "users" }],
  phone: String,
  messages: [{ type: ObjectId, ref: "messages" }],
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
});

module.exports.users = mongoose.model("users", userSchema);
