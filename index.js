const { stat } = require('fs/promises');
const readline = require('readline'); // import readline package to read user i/o CLI
const rl = readline.createInterface({ // Init interface for readline package
    input: process.stdin,
    output: process.stdout
});

function createBowlingGame() { // Create the game (as an object)
    return {
        players: [],
        currentFrame: 0,
        currentTurn: 0,
        currentPlayer: 0
    }
}

function createPlayer(name) { // Function to create player (as an object too)
    return {
        name: name,
        frames: Array.from({length: 10}, () => []), // Create an array with lengh 10 who corresponds to 10 frames of the game
        total: 0
    }
}

function addNewPlayer(game, name) { // Function to add player into game
    var playerToAdd = createPlayer(name)
    game.players.push(playerToAdd)
}

function addPlayerToGame(actualPlayer, totalNumberOfPlayers) { // Recursive function to add players to the game, and next start the game
    rl.question(`Entrez le nom du joueur numéro ${actualPlayer + 1} : `, (name) => {
        addNewPlayer(game, name) // Call the function above
        actualPlayer++ // Add +1 to actualPlayer to add the new player after
        if (actualPlayer < totalNumberOfPlayers) { // While all players have not been added, the function is re-executed
            addPlayerToGame(actualPlayer, totalNumberOfPlayers)
        } else { // If all players are added, start the game
            playFrame()
        }
    });
}

function nextTurn(game) { // Check if the current turn is ended
    game.currentTurn++
    if (game.currentTurn > 1 || game.players[game.currentPlayer].frames[game.currentFrame][0] === 10) { // Check if the player have knocked over 10 skittles, or if 2nd turn is completed
        game.currentTurn = 0 // Reset value to 0
        game.currentPlayer++ // Switch to next player
        if (game.currentPlayer >= game.players.length) { // Check if all player have played
            game.currentPlayer = 0 // Back to the 1st player
            game.currentFrame++ // Switch to next frame
        }
    }
}

function initGame() { // Function to initialize the game (number of players, name etc.)
    console.log('Début d\'une nouvelle partie de Bowling')
    rl.question('Entrez le nombre de joueurs (de 1 à 6): ', (numberOfPlayers) => {
        numberOfPlayers = parseInt(numberOfPlayers) // Convert str to int
        if (numberOfPlayers < 1 || numberOfPlayers > 6) { // Check min and max of players
            console.log('Le nombre de jouerus est incorrect. Veuillez entrer un nombre entre 1 et 6')
            return initGame()
        }
        
        addPlayerToGame(0, numberOfPlayers)
    });
}

function playFrame() { // Play the turn
    if (game.currentFrame >= 10) { // Check if all frames are completed
        console.log('Partie terminée')
        EndGame(game)
        // Rajouter possibilité de voir l'hitorique du jeu avec un oui/non mais vasi on verra après
        return
    }

    var currentPlayer = game.players[game.currentPlayer]
    console.log(`Frame ${game.currentFrame + 1}, Lancer ${game.currentTurn + 1}.`)
    rl.question(`${currentPlayer.name}, Combien de quilles avez-vous renversé ?`, (skittles) => {
        skittles = parseInt(skittles) // Convert str to int
        if (skittles < 0 || skittles > 10) { // Check value of skittles entered
            console.log('Ce chiffre n\'est pas valide. Il faut un chiffre entre 0 et 10')
            return playFrame()
        }

        currentPlayer.frames[game.currentFrame].push(skittles) // Add results to game history
        nextTurn(game) // Update turn number
        playFrame() // Restart function (recursive)
    });
}

function calculateScore(player) { // Calculate total score of players
    player.total = 0
    for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
        var frame = player.frames[frameIndex]
        if (frame[0] === 10) { // If there is a strike
            player.total += 10 + getStrikeBonus(player, frameIndex)
        } else if (frame[0] + frame[1] === 10) { // If there is a spare
            player.total += 10 + getSpareBonus(player, frameIndex)
        } else {
            player.total += frame[0] + frame[1]
        }
    }
}

function getStrikeBonus(player, frameIndex) { // Add strike bonus to total score
    var nextFrame = player.frames[frameIndex + 1] || [] // init temp next frame
    var secondFrame = player.frames[frameIndex + 2] || [] // init temp next next frame
    var addedStrikeBonus = nextFrame[0] + (nextFrame[1] !== undefined ? nextFrame[1] : secondFrame[0])
    return addedStrikeBonus
}

function getSpareBonus(player, frameIndex) { // Add spare bonus to total score
    var nextFrame = player.frames[frameIndex + 1] || []
    return nextFrame[0]
}

function EndGame(game) { // Function who close the game
    console.log("Scores finaux :")
    game.players.forEach(player => { // Loop for calculate all player's total scores
        calculateScore(player)
    });

    game.players.sort((a, b) => b.total - a.total) // Sort plyers by descending total score
    
    game.players.forEach((player, index) => { // Show podium
        console.log(`${index + 1} - ${player.name} : ${player.total}`)
     });
    console.log(`${game.players[0].name} est le/la gagnant(e) !`) 
    rl.close() // Close readline interface
}

const game = createBowlingGame(); // Create the game object
initGame()
//Ou rajouter ici voir l'historique
