const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tags:[{
      type:String,
  }],
  prequelGames: [
    {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
});

module.exports = mongoose.model("Game", gameSchema);
