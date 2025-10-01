import { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import Button from "../components/Button";
import { Colors } from "../styles/colors";
import Background from "../components/Background";
import Header from "../components/Header";
import Board from "../components/Board";
import "../styles/GameFinished.css";

function GameFinished() {
  const { gameHistory, quitGame, restartGame, gameRoom } = useGame();
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const scrollViewRef = useRef(null);

  const lastTurn = gameHistory[gameHistory.length - 1];
  const loser = lastTurn ? lastTurn.playerName : "Unknown";

  // Auto-scroll to the losing player
  useEffect(() => {
    if (gameRoom && scrollViewRef.current && loser) {
      const loserIndex = gameRoom.players.findIndex(
        (player) => player.name === loser
      );
      if (loserIndex !== -1) {
        const scrollPosition = loserIndex * 80 + 50;

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }, 500);
      }
    }
  }, [gameRoom, loser]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);

  // Handle auto-return to lobby when timer reaches 0
  useEffect(() => {
    if (!timerActive && timeLeft === 0) {
      restartGame();
    }
  }, [timerActive, timeLeft, restartGame]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      setTimerActive(false);
    };
  }, []);

  const handleQuitGame = () => {
    setTimerActive(false);
    quitGame();
  };

  const handleRestartGame = () => {
    setTimerActive(false);
    restartGame();
  };

  if (!gameRoom) {
    return (
      <div className="screen-container">
        <Background />
        <div className="finished-content">
          <Header style={{ fontSize: "40px" }}>Game Over!</Header>
          <Board style={{ minHeight: "0", width: "90%", margin: "0" }}>
            <Header style={{ fontSize: "30px", color: Colors.GRAY }}>
              {loser} <span style={{ color: Colors.EXIT }}>Lost!</span>
            </Header>
          </Board>
          <Board style={{ minHeight: "0", width: "90%" }}>
            <Header style={{ fontSize: "20px", color: Colors.GRAY }}>
              Secret Number:
              <span style={{ color: Colors.EXIT }}> {lastTurn?.guess}</span>
            </Header>
            <Header style={{ fontSize: "20px", color: Colors.GRAY }}>
              Total Guesses: {gameHistory.length}
            </Header>
          </Board>
          <div className="finished-button-container">
            <Button onClick={handleQuitGame}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <Background />
      <div className="finished-content">
        <Header style={{ fontSize: "50px" }}>Game Over!</Header>
        <Board style={{ minHeight: "0", width: "90%", margin: "0" }}>
          <Header style={{ fontSize: "40px", color: Colors.GRAY }}>
            {loser} <span style={{ color: Colors.EXIT }}>Lost!</span>
          </Header>
        </Board>

        {timerActive && timeLeft > 0 && (
          <Board style={{ minHeight: "0", width: "90%", marginVertical: "10px" }}>
            <Header style={{ fontSize: "18px", color: Colors.PRIMARY }}>
              Auto return to lobby in:{" "}
              <span style={{ color: Colors.EXIT, fontWeight: "bold" }}>
                {timeLeft}s
              </span>
            </Header>
          </Board>
        )}

        <Board style={{ minHeight: "0", width: "90%" }}>
          <Header style={{ fontSize: "20px", color: Colors.GRAY }}>
            Secret Number:
            <span style={{ color: Colors.EXIT }}> {lastTurn?.guess}</span>
          </Header>
          <Header style={{ fontSize: "20px", color: Colors.GRAY }}>
            Total Guesses: {gameHistory.length}
          </Header>
        </Board>

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
          <div ref={scrollViewRef} className="finished-players-scroll">
            <Header style={{ fontSize: "25px" }}>Players</Header>
            {gameRoom.players.map((player, index) => {
              const isCurrentTurn = index === gameRoom.currentPlayerIndex;
              const playerGuesses = gameHistory.filter(
                (turn) => turn.playerName === player.name
              );
              const lastGuess = playerGuesses[playerGuesses.length - 1];

              return (
                <div
                  key={player.name}
                  className={`finished-player-row ${isCurrentTurn ? "loser" : ""}`}
                >
                  <p
                    className={`finished-player-name ${isCurrentTurn ? "loser-text" : ""}`}
                  >
                    {player.name}
                    {isCurrentTurn && " (Last Turn)"}
                  </p>
                  <p
                    className={`finished-player-guess ${isCurrentTurn ? "loser-text" : ""}`}
                  >
                    {lastGuess
                      ? `Last: ${lastGuess.guess} (${lastGuess.result})`
                      : "No guesses yet"}
                  </p>
                </div>
              );
            })}
          </div>
        </Board>

        <div className="finished-button-container">
          <Button onClick={handleRestartGame}>Back to Lobby</Button>
          <Button
            onClick={handleQuitGame}
            style={{ backgroundColor: Colors.EXIT }}
          >
            Quit Game
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GameFinished;
