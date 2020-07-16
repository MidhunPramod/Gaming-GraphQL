const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  gamesPurchased: [
    {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
  gamesCompleted: [
    {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
});

module.exports = mongoose.model("Player", playerSchema);
