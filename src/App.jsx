import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { GameProvider, useGame } from "./context/GameContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainMenu from "./screens/MainMenu";
import GameLobby from "./screens/GameLobby";
import GamePlay from "./screens/GamePlay";
import GameFinished from "./screens/GameFinished";
import Countdown from "./components/Countdown";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";
import "./styles/DarkMode.css";

function NavigationHandler() {
  const navigate = useNavigate();
  const { gameState } = useGame();

  useEffect(() => {
    if (!gameState) return;

    try {
      switch (gameState) {
        case "MENU":
          navigate("/");
          break;
        case "LOBBY":
          navigate("/lobby");
          break;
        case "PLAYING":
          navigate("/play");
          break;
        case "FINISHED":
          navigate("/finished");
          break;
        default:
          break;
      }
    } catch (error) {
      console.log("Navigation error:", error);
    }
  }, [gameState, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/lobby" element={<GameLobby />} />
        <Route path="/play" element={<GamePlay />} />
        <Route path="/finished" element={<GameFinished />} />
      </Routes>
      <NavigationHandler />
      <Countdown />
      <ThemeToggle />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
