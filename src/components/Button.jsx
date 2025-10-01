import { Colors } from "../styles/colors";
import "../styles/Button.css";

function Button({ children, onClick, style, disabled }) {
  const handleClick = (event) => {
    if (disabled) return;
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={`game-button ${disabled ? "disabled" : ""}`}
      style={style}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
