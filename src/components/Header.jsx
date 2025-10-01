import { Colors } from "../styles/colors";
import "../styles/Header.css";

function Header({ children, style }) {
  return <h1 className="game-header" style={style}>{children}</h1>;
}

export default Header;
