const { buildSchema } = require("graphql");

module.exports = buildSchema(`

    type Player{
        _id:ID!
        name:String!
        friends:[Player!]
        gamesPurchased:[Game!]
    }

    input AddPlayerInput{
        name:String!
    }

    type Game{
        _id:ID!
        name:String!
        tags:[String!]
        prequelGames:[Game!]
    }

    input AddGameInput{
        name:String!
        tags:[String!]
    }

    type RootQuery{
        players:[Player!]!
        games:[Game!]!
        searchPlayer(key:String!):[Player!]
        searchGame(key:String!):[Game!]
    }

    input BuyGameInput{
        player_name:String!
        game_name:String!
    }

    input AddPrequelInput{
        game_name:[String]!
        prequel_array:[String!]
    }

    input AddFriendInput{
        currentPlayer:String!
        addAsFriend:String!
    }

    input SendGameRequestInput{
        from:String!
        to: String!
        game:String!
    }

    type RootMutation{
        addPlayer(addPlayerInput:AddPlayerInput):Player
        addGame(addGameInput:AddGameInput):Game
        buyGame(buyGameInput:BuyGameInput):Player
        addPrequel(addPrequelInput:AddPrequelInput):Game
        addFriend(addFriendInput:AddFriendInput):Player
        sendGameRequest(sendGameRequestInput:SendGameRequestInput):String

    }

    schema{
        query:RootQuery
        mutation:RootMutation
    }

`);
