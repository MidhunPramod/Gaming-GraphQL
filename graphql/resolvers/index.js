const Player = require("../../models/Player");
const Game = require("../../models/Game");
const Request = require("../../models/Request");
const { request } = require("express");

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

transformPlayerId = async (playerId) => {
  const player = await Player.findOne({ _id: playerId });
  return { ...player._doc, _id: player.id };
};

transformGameId = async (gameId) => {
  const game = await Game.findOne({ _id: gameId });
  return { ...game._doc, _id: game.id };
};

module.exports = {
  players: async () => {
    const fetchedPlayers = await Player.find({});
    return fetchedPlayers.map((player) => {
      return {
        ...player._doc,
        _id: player.id,
        gamesPurchased: nestedGamesArray.bind(this, player._doc.gamesPurchased),
        gamesCompleted: nestedGamesArray.bind(this, player._doc.gamesCompleted),
      };
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
  mutualFriends: async (args) => {
    const playerA = await Player.findOne({ name: args.playerA });
    const playerB = await Player.findOne({ name: args.playerB });

    if (!playerA || !playerB) {
      throw new Error("Requested Player invalid");
    }

    const mutual_friends = playerA.friends.filter((friend) =>
      playerB.friends.includes(friend)
    );

    return mutual_friends.length;
  },
  recommendGames: async (args) => {
    const player = await Player.findOne({ name: args.player });

    const tags = [];

    for (let gameId of player.gamesPurchased) {
      const game = await Game.findOne({ _id: gameId });
      game.tags.map((tag) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }

    const recommend = await Game.find({
      tags: { $in: [...tags] },
      _id: { $nin: [...player.gamesPurchased] },
    });

    return recommend.slice(0, 5).map((game) => {
      return {
        ...game._doc,
        prequelGames: nestedGamesArray.bind(this, game.prequelGames),
      };
    });
  },
  rank: async (args) => {
    const top = await Player.find({});
    top.sort(function (a, b) {
      return b.gamesCompleted.length - a.gamesCompleted.length;
    });
    return top.slice(0, 5).map((player) => {
      return {
        ...player._doc,
        _id: player.id,
        gamesPurchased: nestedGamesArray.bind(this, player._doc.gamesPurchased),
        gamesCompleted: nestedGamesArray.bind(this, player._doc.gamesCompleted),
      };
    });
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
          gamesCompleted: nestedGamesArray.bind(
            this,
            player._doc.gamesCompleted
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
        return {
          ...game._doc,
          _id: game.id,
          prequelGames: nestedGamesArray.bind(this, game._doc.prequelGames),
        };
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
        gamesCompleted: nestedGamesArray.bind(this, player._doc.gamesCompleted),
      };
    } catch (error) {
      throw error;
    }
  },
  completedGame: async (args) => {
    const game = await Game.findOne({
      name: args.completedGameInput.game_name,
    });
    if (!game) {
      throw new Error("Game does not exist");
    }

    const player = await Player.findOne({
      name: args.completedGameInput.player_name,
    });
    if (!player) {
      throw new Error("Player does not exist");
    }
    if (!player.gamesPurchased.includes(game.id)) {
      throw new Error("Player has not purchased the game");
    }
    player.gamesCompleted.push(game.id);
    await player.save();

    return {
      ...player._doc,
      _id: player.id,
      gamesPurchased: nestedGamesArray.bind(this, player._doc.gamesPurchased),
      gamesCompleted: nestedGamesArray.bind(this, player._doc.gamesCompleted),
    };
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

    const request = new Request({
      to: to.id,
      from: from.id,
      game: game.id,
    });

    await request.save();

    return {
      ...request._doc,
      to: transformPlayerId.bind(this, to.id),
      from: transformPlayerId.bind(this, from.id),
      game: transformGameId.bind(this, game.id),
    };
  },
};
