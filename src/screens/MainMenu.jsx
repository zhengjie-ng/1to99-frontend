import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { Colors } from "../styles/colors";
import Button from "../components/Button";
import Header from "../components/Header";
import Background from "../components/Background";
import "../styles/MainMenu.css";

function MainMenu() {
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    playerName,
    createRoom,
    joinRoom,
    error,
    clearError,
    // setPlayerName,
  } = useGame();
  const [localPlayerName, setLocalPlayerName] = useState(playerName || "");

  useEffect(() => {
    setLocalPlayerName(playerName || "");
  }, [playerName]);

  useEffect(() => {
    if (error) {
      console.log("MainMenu received error:", error);
      if (error.includes("Room not found")) {
        alert("Room Not Found\nPlease enter an existing Room ID");
      } else {
        alert(`Error\n${error}`);
      }
      clearError();
      setIsSubmitting(false);
    }
  }, [error, clearError]);

  const handleCreate = (e) => {
    e.preventDefault();

    if (!localPlayerName || !localPlayerName.trim()) {
      alert("Invalid Input\nPlease enter a name to proceed");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(() => {
      createRoom(localPlayerName.trim());
    }, 0);

    setTimeout(() => setIsSubmitting(false), 3000);
  };

  const handleJoin = (e) => {
    e.preventDefault();

    if (!localPlayerName || !localPlayerName.trim()) {
      alert("Invalid Input\nPlease enter a name to proceed");
      return;
    }

    setMode("join");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!localPlayerName || !localPlayerName.trim()) {
      alert("Invalid Input\nPlease enter a name to proceed");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    if (mode === "create") {
      createRoom(localPlayerName.trim());
    } else if (mode === "join") {
      if (!roomId.trim()) {
        alert("Invalid Input\nPlease enter Room ID to proceed");
        setIsSubmitting(false);
        return;
      }
      joinRoom(roomId, localPlayerName.trim());
    }

    setTimeout(() => setIsSubmitting(false), 3000);
  };

  return (
    <div className="screen-container">
      <Background />
      <div className="main-menu-content">
        <Header>1 to 99</Header>
        <p className="sub-header">Guess Everything Except the Secret Number</p>

        {!mode && (
          <div className="input-container">
            <label className="input-label">Name:</label>
            <input
              className="text-input"
              type="text"
              value={localPlayerName}
              onChange={(e) => setLocalPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={12}
            />
          </div>
        )}

        {!mode ? (
          <div className="button-container">
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Room"}
            </Button>
            <Button onClick={handleJoin}>Join Room</Button>
          </div>
        ) : (
          <div className="join-mode-container">
            {mode === "join" && (
              <div className="input-container">
                <label className="input-label">Room:</label>
                <input
                  className="text-input"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                />
              </div>
            )}

            <div className="button-container">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {mode === "create" ? "Create Room" : "Join Room"}
              </Button>
              <Button
                onClick={() => setMode("")}
                style={{ backgroundColor: Colors.DISABLE }}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainMenu;
