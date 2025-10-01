import { useRef, useEffect } from "react";
import { useGame } from "../context/GameContext";
import Button from "../components/Button";
import { Colors } from "../styles/colors";
import Header from "../components/Header";
import Board from "../components/Board";
import QRCode from "react-qr-code";
import Background from "../components/Background";
import "../styles/GameLobby.css";

function GameLobby() {
  const { gameRoom, playerName, startGame, quitGame, removePlayer } = useGame();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  }, [gameRoom?.players]);

  if (!gameRoom) {
    return (
      <div className="screen-container">
        <Background />
        <div className="loading-container">
          <Header style={{ fontSize: "24px" }}>Loading lobby...</Header>
        </div>
      </div>
    );
  }

  const currentPlayer = gameRoom.players.find((p) => p.name === playerName);
  const isHost =
    currentPlayer &&
    (currentPlayer.isHost || currentPlayer.id === gameRoom.hostId);

  return (
    <div className="screen-container">
      <Background />
      <div className="lobby-content">
        <div className="qr-container">
          <p className="qr-label">Scan QR code or enter Room ID to join</p>
          <div className="qr-code-wrapper">
            <QRCode
              value={gameRoom.roomId.toString()}
              size={140}
              bgColor="white"
              fgColor="black"
            />
          </div>
          <p className="room-id-text">{gameRoom.roomId}</p>
        </div>

        <Board style={{ width: "85%", minHeight: "0", flex: "1", marginTop: "0" }}>
          <div ref={scrollViewRef} className="players-scroll">
            <div className="players-content">
              <Header style={{ fontSize: "25px", marginBottom: "12px" }}>
                Players ({gameRoom.players.length})
              </Header>
              {gameRoom.players.map((player, index) => {
                const isPlayerHost =
                  player.isHost || player.id === gameRoom.hostId;
                const canRemove =
                  isHost && !isPlayerHost && player.name !== playerName;
                return (
                  <div key={index} className="player-row">
                    <p className="player-text">
                      {player.name} {isPlayerHost && "(Host)"}
                    </p>
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
          </div>
        </Board>

        <div className="lobby-button-container">
          {!isHost && (
            <p className="waiting-text">
              Waiting for host to start the game...
            </p>
          )}
          {isHost && (
            <Button onClick={startGame} style={{ backgroundColor: Colors.PRIMARY }}>
              Start Game
            </Button>
          )}
          <Button onClick={quitGame} style={{ backgroundColor: Colors.EXIT }}>
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GameLobby;
