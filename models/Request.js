const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const requestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "Player",
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "Player",
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: "Game",
  },
});

module.exports = mongoose.model("Request", requestSchema);
