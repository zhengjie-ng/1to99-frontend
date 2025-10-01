import { useTheme } from "../context/ThemeContext";
import "../styles/ThemeToggle.css";

function ThemeToggle() {
  const { theme, setThemeMode } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setThemeMode("dark");
    } else if (theme === "dark") {
      setThemeMode("system");
    } else {
      setThemeMode("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "light") return "☀️";
    if (theme === "dark") return "🌙";
    return "💻";
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <button
      className="theme-toggle"
      onClick={cycleTheme}
      aria-label={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
      title={`Theme: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
    </button>
  );
}

export default ThemeToggle;
