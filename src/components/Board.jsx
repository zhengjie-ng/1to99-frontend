import "../styles/Board.css";

function Board({ children, style }) {
  return <div className="game-board" style={style}>{children}</div>;
}

export default Board;
