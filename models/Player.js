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
  gameRequests: [
    {
      from: {
        type: String,
      },
      game: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("Player", playerSchema);
