import { createContext, useContext, useReducer, useEffect } from "react";
import WebSocketService from "../services/WebSocketService";

const GameContext = createContext();

const initialState = {
  connected: false,
  playerName: "",
  gameRoom: null,
  gameHistory: [],
  currentTurn: null,
  error: null,
  gameState: "MENU", // MENU, LOBBY, PLAYING, FINISHED
  countdown: 0,
  isCountingDown: false,
};

function gameReducer(state, action) {
  console.log("GameReducer - Action:", action.type, action.payload);
  console.log("GameReducer - Current state:", state.gameState);

  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };

    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.payload };

    case "SET_GAME_ROOM":
      return { ...state, gameRoom: action.payload };

    case "SET_GAME_STATE":
      console.log(
        "GameReducer - Setting game state from",
        state.gameState,
        "to",
        action.payload
      );
      return { ...state, gameState: action.payload };

    case "ADD_GAME_TURN":
      return {
        ...state,
        gameHistory: [...state.gameHistory, action.payload],
        currentTurn: action.payload,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "START_COUNTDOWN":
      return {
        ...state,
        countdown: action.payload,
        isCountingDown: true,
      };

    case "UPDATE_COUNTDOWN":
      return {
        ...state,
        countdown: action.payload,
      };

    case "END_COUNTDOWN":
      return {
        ...state,
        countdown: 0,
        isCountingDown: false,
      };

    case "CLEAR_GAME_HISTORY":
      return {
        ...state,
        gameHistory: [],
        currentTurn: null,
      };

    case "RESET_GAME":
      return {
        ...initialState,
        connected: state.connected,
        playerName: state.playerName,
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Helper function to set player name and save to localStorage
  const setPlayerNameWithStorage = (name) => {
    dispatch({ type: "SET_PLAYER_NAME", payload: name });
    try {
      localStorage.setItem("playerName", name);
    } catch (error) {
      console.error("Failed to save player name:", error);
    }
  };

  // Load saved player name on app start
  useEffect(() => {
    const loadSavedPlayerName = () => {
      try {
        const savedPlayerName = localStorage.getItem("playerName");
        if (savedPlayerName) {
          dispatch({ type: "SET_PLAYER_NAME", payload: savedPlayerName });
        }
      } catch (error) {
        console.error("Failed to load saved player name:", error);
      }
    };

    loadSavedPlayerName();
    connectWebSocket();
    return () => WebSocketService.disconnect();
  }, []);

  const connectWebSocket = async () => {
    try {
      await WebSocketService.connect();
      dispatch({ type: "SET_CONNECTED", payload: true });

      // Subscribe to personal queue for game updates
      WebSocketService.subscribe("/user/queue/gameUpdate", handleGameUpdate);
      console.log("Subscribed to /user/queue/gameUpdate");

      // Subscribe to general game response topic
      WebSocketService.subscribe("/topic/gameResponse", handleGameUpdate);
      console.log("Subscribed to /topic/gameResponse");
    } catch (error) {
      console.log(error);
      dispatch({ type: "SET_ERROR", payload: "Failed to connect to server" });
    }
  };

  const handleGameUpdate = (message) => {
    console.log("Game update:", message);

    switch (message.type) {
      case "ROOM_CREATED":
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
        subscribeToRoom(message.gameRoom.roomId);
        subscribeToUserTopic(message.gameRoom.hostId);
        break;

      case "PLAYER_JOINED":
        console.log("Processing PLAYER_JOINED message:", message);
        if (window.joinRoomTimeout) {
          clearTimeout(window.joinRoomTimeout);
          window.joinRoomTimeout = null;
        }
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        if (
          message.gameRoom &&
          (state.gameState === "MENU" || !state.gameRoom)
        ) {
          console.log("Setting game state to LOBBY");
          dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
          const joinedPlayer = message.gameRoom.players.find(
            (p) => p.name === state.playerName
          );
          if (joinedPlayer) {
            subscribeToUserTopic(joinedPlayer.id);
          }
        }
        break;

      case "ROOM_JOINED":
        console.log("Processing ROOM_JOINED message:", message);
        if (window.joinRoomTimeout) {
          clearTimeout(window.joinRoomTimeout);
          window.joinRoomTimeout = null;
        }
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
        const currentPlayer = message.gameRoom.players.find(
          (p) => p.name === state.playerName
        );
        if (currentPlayer) {
          subscribeToUserTopic(currentPlayer.id);
        }
        break;

      case "GAME_STARTING_COUNTDOWN":
        console.log("Game starting countdown...");
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        startCountdown();
        break;

      case "GAME_STARTED":
        console.log("🎯 SECRET NUMBER FOR TESTING:", message.gameRoom.secretNumber);
        dispatch({ type: "END_COUNTDOWN" });
        dispatch({ type: "CLEAR_GAME_HISTORY" });
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "PLAYING" });
        break;

      case "GUESS_MADE":
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "ADD_GAME_TURN", payload: message.lastTurn });

        if (message.gameRoom.state === "FINISHED") {
          dispatch({ type: "SET_GAME_STATE", payload: "FINISHED" });
        } else {
          const { minRange, maxRange } = message.gameRoom;
          if (minRange === maxRange) {
            setTimeout(() => {
              makeGuessInternal(message.gameRoom.roomId, minRange);
            }, 3000);
          }
        }
        break;

      case "PLAYER_QUIT":
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        break;

      case "GAME_RESTARTED":
        console.log("Game restarted, returning to lobby:", message);
        dispatch({ type: "CLEAR_GAME_HISTORY" });
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        dispatch({ type: "SET_GAME_STATE", payload: "LOBBY" });
        break;

      case "PLAYER_KICKED":
        console.log("You have been removed from the game by the host");
        if (state.gameRoom) {
          WebSocketService.unsubscribe(`/topic/room.${state.gameRoom.roomId}`);
          const currentPlayer = state.gameRoom.players?.find(
            (p) => p.name === state.playerName
          );
          if (currentPlayer) {
            WebSocketService.unsubscribe(`/topic/user.${currentPlayer.id}`);
          }
        }
        dispatch({ type: "SET_ERROR", payload: message.message });
        dispatch({ type: "RESET_GAME" });
        break;

      case "PLAYER_REMOVED":
        console.log("Player removed by host:", message);
        dispatch({ type: "SET_GAME_ROOM", payload: message.gameRoom });
        break;

      case "ERROR":
        console.log("Received ERROR message:", message.message);
        dispatch({ type: "SET_ERROR", payload: message.message });
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const subscribeToRoom = (roomId) => {
    console.log("Subscribing to room topic:", `/topic/room.${roomId}`);
    WebSocketService.subscribe(`/topic/room.${roomId}`, (message) => {
      console.log(`Received message on /topic/room.${roomId}:`, message);
      handleGameUpdate(message);
    });
  };

  const subscribeToUserTopic = (playerId) => {
    console.log("Subscribing to user topic:", `/topic/user.${playerId}`);
    WebSocketService.subscribe(`/topic/user.${playerId}`, (message) => {
      console.log(`Received message on /topic/user.${playerId}:`, message);
      handleGameUpdate(message);
    });
  };

  const startCountdown = () => {
    let count = 5;
    dispatch({ type: "START_COUNTDOWN", payload: count });

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        dispatch({ type: "UPDATE_COUNTDOWN", payload: count });
      } else {
        dispatch({ type: "END_COUNTDOWN" });
        clearInterval(interval);
      }
    }, 1000);
  };

  const createRoom = (playerName) => {
    console.log("Creating room for player:", playerName);
    setPlayerNameWithStorage(playerName);

    if (!state.connected) {
      dispatch({
        type: "SET_ERROR",
        payload: "Not connected to server. Please wait and try again.",
      });
      return;
    }

    try {
      const tempPlayerId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log("Subscribing to user-specific topic:", `/topic/user.${tempPlayerId}`);
      WebSocketService.subscribe(`/topic/user.${tempPlayerId}`, (message) => {
        console.log(`Received message on user topic:`, message);
        handleGameUpdate(message);
      });

      WebSocketService.send("/app/createRoom", { playerName, tempPlayerId });
      console.log("Sent createRoom message with tempPlayerId:", tempPlayerId);
    } catch (error) {
      console.error("Failed to send createRoom message:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to create room: " + error.message,
      });
    }
  };

  const joinRoom = (roomId, playerName) => {
    console.log("Joining room:", roomId, "with player:", playerName);
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName });

    if (!state.connected) {
      dispatch({
        type: "SET_ERROR",
        payload: "Not connected to server. Please wait and try again.",
      });
      return;
    }

    try {
      subscribeToRoom(roomId);
      WebSocketService.send("/app/joinRoom", { roomId, playerName });
      console.log("Sent joinRoom message");

      const timeoutId = setTimeout(() => {
        if (state.gameState === "MENU" && !state.gameRoom) {
          dispatch({
            type: "SET_ERROR",
            payload: "Room not found - Please enter an existing Room ID",
          });
        }
      }, 5000);

      window.joinRoomTimeout = timeoutId;
    } catch (error) {
      console.error("Failed to send joinRoom message:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to join room: " + error.message,
      });
    }
  };

  const startGame = () => {
    if (state.gameRoom) {
      WebSocketService.send("/app/startGameCountdown", {
        roomId: state.gameRoom.roomId,
      });
    }
  };

  const makeGuessInternal = (roomId, guess) => {
    WebSocketService.send("/app/makeGuess", {
      roomId: roomId,
      guess: parseInt(guess),
    });
  };

  const makeGuess = (guess) => {
    if (state.gameRoom) {
      makeGuessInternal(state.gameRoom.roomId, guess);
    }
  };

  const quitGame = () => {
    if (state.gameRoom) {
      WebSocketService.send("/app/quitGame", {
        roomId: state.gameRoom.roomId,
        playerName: state.playerName,
      });
      console.log("Sent quitGame message for player:", state.playerName);

      WebSocketService.unsubscribe(`/topic/room.${state.gameRoom.roomId}`);
      const currentPlayer = state.gameRoom.players?.find(
        (p) => p.name === state.playerName
      );
      if (currentPlayer) {
        WebSocketService.unsubscribe(`/topic/user.${currentPlayer.id}`);
      }
    }
    dispatch({ type: "RESET_GAME" });
  };

  const restartGame = () => {
    if (state.gameRoom) {
      WebSocketService.send("/app/restartGame", {
        roomId: state.gameRoom.roomId,
      });
      console.log("Sent restartGame message for room:", state.gameRoom.roomId);
    }
  };

  const removePlayer = (playerName) => {
    if (state.gameRoom) {
      WebSocketService.send("/app/removePlayer", {
        roomId: state.gameRoom.roomId,
        playerName: playerName,
      });
      console.log("Sent removePlayer message for player:", playerName);
    }
  };

  const setPlayerName = (name) => {
    setPlayerNameWithStorage(name);
  };

  const value = {
    ...state,
    createRoom,
    joinRoom,
    startGame,
    makeGuess,
    quitGame,
    restartGame,
    removePlayer,
    setPlayerName,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
