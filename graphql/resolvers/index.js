const Player = require("../../models/Player");
const Game = require("../../models/Game");

const transformGame = (game) => {
  return { ...game._doc, _id: game.id };
};

const nestedGamesArray = async (gameIds) => {
  const games = await Game.find({ _id: { $in: gameIds } });
  const result = games.map((game) => {
    return transformGame(game);
  });
  return result;
};

module.exports = {
  players: async () => {
    const fetchedPlayers = await Player.find({});
    return fetchedPlayers.map((player) => {
      return { ...player._doc, _id: player.id };
    });
  },
  addPlayer: async (args) => {
    try {
      const player = new Player({
        name: args.addPlayerInput.name,
      });

      const result = await player.save();
      return { ...result._doc };
    } catch (error) {
      throw error;
    }
  },
  addGame: async (args) => {
    try {
      const game = new Game({
        name: args.addGameInput.name,
        tags: args.addGameInput.tags,
      });

      const result = await game.save();
      return { ...result._doc };
    } catch (error) {
      throw error;
    }
  },
  searchPlayer: async (args) => {
    try {
      const players = await Player.find({ name: { $regex: args.key } });
      return players.map((player) => {
        return {
          ...player._doc,
          _id: player.id,
          gamesPurchased: nestedGamesArray.bind(
            this,
            player._doc.gamesPurchased
          ),
        };
      });
    } catch (error) {
      throw error;
    }
  },
  searchGame: async (args) => {
    try {
      const games = await Game.find({ name: { $regex: args.key } });
      return games.map((game) => {
        return { ...game._doc, _id: game.id };
      });
    } catch (error) {
      throw error;
    }
  },
  buyGame: async (args) => {
    try {
      const game = await Game.findOne({ name: args.buyGameInput.game_name });

      if (!game) {
        throw new Error("Game does not exist");
      }
      const player = await Player.findOne({
        name: args.buyGameInput.player_name,
      });
      if (!player) {
        throw new Error("Player does not exist");
      }

      player.gamesPurchased.push(game.id);
      player.save();

      return {
        ...player._doc,
        _id: player.id,
        gamesPurchased: nestedGamesArray.bind(this, player._doc.gamesPurchased),
      };
    } catch (error) {
      throw error;
    }
  },
  addPrequel: async (args) => {
    try {
      const game = await Game.findOne({ name: args.addPrequelInput.game_name });
      if (!game) {
        throw new Error("Game does not exist");
      }
      let prequel_ids = [];
      for (let prequel of args.addPrequelInput.prequel_array) {
        const preq = await Game.findOne({ name: prequel });
        if (!preq) {
          throw new Error(`${prequel} does not exist`);
        }
        prequel_ids.push(preq.id);
      }
      game.prequelGames.push(...prequel_ids);
      await game.save();

      return {
        ...game._doc,
        prequelGames: nestedGamesArray(game.prequelGames),
      };
    } catch (error) {
      throw error;
    }
  },
  addFriend: async (args) => {
    try {
      const currentPlayer = await Player.findOne({
        name: args.addFriendInput.currentPlayer,
      });

      const addAsFriend = await Player.findOne({
        name: args.addFriendInput.addAsFriend,
      });

      for (let friend of currentPlayer.friends) {
        if (friend == addAsFriend.id) {
          throw new Error("Already a friend!");
        }
      }

      currentPlayer.friends.push(addAsFriend.id);
      await currentPlayer.save();

      return { ...currentPlayer._doc };
    } catch (error) {
      throw error;
    }
  },
  sendGameRequest: async (args) => {
    const to = await Player.findOne({ name: args.sendGameRequestInput.to });
    const from = await Player.findOne({ name: args.sendGameRequestInput.from });
    const game = await Game.findOne({ name: args.sendGameRequestInput.game });

    if (!from || !to) {
      throw new Error("Requested Player invalid");
    }

    const mutual_friends = to.friends.filter((friend) =>
      from.friends.includes(friend)
    );

    if (mutual_friends.length < 1) {
      throw new Error("Should have atleast 1 mutual friend");
    }

    if (
      !to.gamesPurchased.includes(game.id) ||
      !to.gamesPurchased.includes(game.id)
    ) {
      throw new Error("Both Players should have the game");
    }

    game.prequelGames.map((preq) => {
      if (
        !to.gamesPurchased.includes(preq) ||
        !from.gamesPurchased.includes(preq)
      ) {
        throw new Error("All prequel games must be completed first");
      }
    });

    return "Successfully send request!";
  },
};
