import { useState, useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import Header from "../components/Header";
import Board from "../components/Board";
import Button from "../components/Button";
import { Colors } from "../styles/colors";
import Background from "../components/Background";
import "../styles/GamePlay.css";

function GamePlay() {
  const [guess, setGuess] = useState("");
  const scrollViewRef = useRef(null);
  const {
    gameRoom,
    playerName,
    makeGuess,
    gameHistory,
    quitGame,
    removePlayer,
  } = useGame();

  // Auto-scroll to current player when turn changes
  useEffect(() => {
    if (
      gameRoom &&
      scrollViewRef.current &&
      typeof gameRoom.currentPlayerIndex === "number"
    ) {
      const currentPlayerIndex = gameRoom.currentPlayerIndex;
      const scrollPosition = currentPlayerIndex * 80;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [gameRoom?.currentPlayerIndex]);

  if (!gameRoom) {
    return (
      <div className="screen-container">
        <Background />
        <div className="loading-container">
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameRoom.players[gameRoom.currentPlayerIndex];
  const isMyTurn = currentPlayer.name === playerName;
  const isSingleNumberLeft = gameRoom.minRange === gameRoom.maxRange;

  const myPlayer = gameRoom.players.find((p) => p.name === playerName);
  const isHost =
    myPlayer && (myPlayer.isHost || myPlayer.id === gameRoom.hostId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isMyTurn || !guess.trim()) return;

    const guessNum = parseInt(guess);
    if (guessNum < gameRoom.minRange || guessNum > gameRoom.maxRange) {
      alert(
        `Invalid Guess\nGuess must be between ${gameRoom.minRange} and ${gameRoom.maxRange}`
      );
      return;
    }

    makeGuess(guessNum);
    setGuess("");
  };

  const handleLeaveGame = () => {
    if (window.confirm("Are you sure you want to leave the game?")) {
      quitGame();
    }
  };

  return (
    <div className="screen-container">
      <Background />
      <div className="gameplay-content">
        <div className="gameplay-header">
          <Header style={{ fontSize: "50px" }}>Do not pick the</Header>
          <Header style={{ fontSize: "50px" }}>Secret Number!</Header>
        </div>

        <Board
          style={{
            width: "90%",
            minHeight: "100px",
            justifyContent: "center",
            gap: "20px",
            paddingTop: "20px",
            paddingBottom: "20px",
            margin: "0",
          }}
        >
          <Header style={{ fontSize: "25px" }}>
            Current Range:{" "}
            <span style={{ color: Colors.EXIT }}>
              {gameRoom.minRange} - {gameRoom.maxRange}
            </span>
          </Header>
          {isSingleNumberLeft ? (
            <Header style={{ fontSize: "17px", color: Colors.EXIT }}>
              {currentPlayer.name} must pick {gameRoom.minRange} and will lose!
            </Header>
          ) : (
            <Header style={{ fontSize: "17px", color: Colors.GRAY }}>
              Current Turn: {currentPlayer.name}
              {isMyTurn && (
                <span style={{ color: Colors.SECONDARY_DARK }}>
                  {" "}
                  (Your Turn!)
                </span>
              )}
            </Header>
          )}
        </Board>

        {!isSingleNumberLeft && (
          <div className="guess-container">
            <Board
              style={{
                width: "100%",
                minHeight: "0",
                height: "100px",
                justifyContent: "center",
                gap: "2px",
                paddingTop: "20px",
                paddingBottom: "20px",
                flexDirection: "row",
                margin: "0",
              }}
            >
              <input
                className={`guess-input ${!isMyTurn ? "disabled" : ""}`}
                type="number"
                value={guess}
                onChange={(e) => isMyTurn && setGuess(e.target.value)}
                min={gameRoom.minRange}
                max={gameRoom.maxRange}
                placeholder={`Guess (${gameRoom.minRange}-${gameRoom.maxRange})`}
                disabled={!isMyTurn}
              />
              <Button onClick={handleSubmit} disabled={!isMyTurn}>
                Guess
              </Button>
            </Board>
            {!isMyTurn && (
              <div className="not-your-turn-overlay">
                <p className="not-your-turn-text">Not Your Turn Yet</p>
              </div>
            )}
          </div>
        )}

        <Board
          style={{
            width: "90%",
            minHeight: "0",
            flex: "1",
            justifyContent: "flex-start",
            gap: "5px",
            margin: "0",
          }}
        >
          <div ref={scrollViewRef} className="players-scroll-gameplay">
            <Header style={{ fontSize: "25px" }}>Players</Header>
            {gameRoom.players.map((player, index) => {
              const isCurrentTurn = index === gameRoom.currentPlayerIndex;
              const isPlayerHost =
                player.isHost || player.id === gameRoom.hostId;
              const canRemove =
                isHost &&
                !isPlayerHost &&
                player.name !== playerName &&
                !isCurrentTurn;
              const playerGuesses = gameHistory.filter(
                (turn) => turn.playerName === player.name
              );
              const lastGuess = playerGuesses[playerGuesses.length - 1];

              return (
                <div
                  key={player.name}
                  className={`player-row-gameplay ${
                    isCurrentTurn ? "current" : ""
                  }`}
                >
                  <div className="player-info">
                    <p
                      className={`player-name ${
                        isCurrentTurn ? "current-text" : ""
                      }`}
                    >
                      {player.name}
                      {isCurrentTurn && " (Current Turn)"}
                      {isPlayerHost && " (Host)"}
                    </p>
                    <p
                      className={`player-guess ${
                        isCurrentTurn ? "current-text" : ""
                      }`}
                    >
                      {lastGuess
                        ? `Last: ${lastGuess.guess} (${lastGuess.result})`
                        : "No guesses yet"}
                    </p>
                  </div>
                  {canRemove && (
                    <button
                      className="remove-button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to remove ${player.name} from the game?`
                          )
                        ) {
                          removePlayer(player.name);
                        }
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Board>

        <Button
          onClick={handleLeaveGame}
          style={{ backgroundColor: Colors.EXIT, width: "90%" }}
        >
          Leave Game
        </Button>
      </div>
    </div>
  );
}

export default GamePlay;
