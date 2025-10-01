import { useGame } from "../context/GameContext";
import { Colors } from "../styles/colors";
import "../styles/Countdown.css";

function Countdown() {
  const { countdown, isCountingDown } = useGame();

  if (!isCountingDown) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        <h2 className="countdown-title">Game Starting!</h2>
        <div className="countdown-number">{countdown}</div>
        <p className="countdown-subtitle">Get ready...</p>
      </div>
    </div>
  );
}

export default Countdown;
