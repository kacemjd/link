const mongoose = require("mongoose");

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const messageSchema = new mongoose.Schema({
  body: String,
  photo: String,
  author: { type: ObjectId, ref: "users" },
  authorPhone: String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  creation: Date,
  expiration: Date
});

messageSchema.index({ location: "2dsphere" });

module.exports.messages = mongoose.model("messages", messageSchema);
