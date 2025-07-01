import React, { useState, useEffect } from 'react';
import './App.css';

const CHICKEN_URL = 'https://thumbs.dreamstime.com/z/full-body-brown-chicken-hen-standing-isolated-white-backgroun-background-use-farm-animals-livestock-theme-49741285.jpg?ct=jpeg';
const BANANA_URL = 'https://thumbs.dreamstime.com/b/bunch-bananas-6175887.jpg?w=768';

function App() {
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [winner, setWinner] = useState(null);
  const [selectedTiles, setSelectedTiles] = useState({ chicken: null, banana: null });

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    // Reveal logic after both selected
    if (selectedTiles.chicken !== null && selectedTiles.banana !== null && !winner) {
      const newRevealed = [...revealed];
      newRevealed[selectedTiles.chicken] = true;
      newRevealed[selectedTiles.banana] = true;
      setRevealed(newRevealed);

      const chickenCorrect = grid[selectedTiles.chicken] === CHICKEN_URL;
      const bananaCorrect = grid[selectedTiles.banana] === BANANA_URL;

      if (chickenCorrect && !bananaCorrect) setWinner('chicken');
      else if (!chickenCorrect && bananaCorrect) setWinner('banana');
      else if (!chickenCorrect && !bananaCorrect) setWinner('No one');
      else {
        // Both correct — clear selections, continue
        setTimeout(() => {
          setSelectedTiles({ chicken: null, banana: null });
        }, 500);
      }
    }
  }, [selectedTiles, grid, revealed, winner]);

  const resetGame = () => {
    const newGrid = Array(36).fill().map(() =>
      Math.random() < 0.5 ? CHICKEN_URL : BANANA_URL
    );
    setGrid(newGrid);
    setRevealed(Array(36).fill(false));
    setWinner(null);
    setSelectedTiles({ chicken: null, banana: null });
  };

  const handleTileClick = (player, index) => {
    if (winner || revealed[index]) return;

    setSelectedTiles(prev => {
      if (prev[player] !== null) return prev; // already selected
      return { ...prev, [player]: index };
    });
  };

  return (
    <div className="container">
      <h1>🐔🍌 Chicken Banana Game! 🍌🐔</h1>

      {!winner && (
        <div className="player-select-info">
          <p>Chicken Player: Click your tile</p>
          <p>Banana Player: Click your tile</p>
        </div>
      )}

      {winner && (
        <div className="winner">
          <h2>{winner !== 'No one' ? `${winner.toUpperCase()} Player Wins! 🎉` : 'Both players made a mistake!'}</h2>
          {winner !== 'No one' && <p>+5 bonus grade to the winner!</p>}
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}

      <div className="grid">
        {grid.map((img, index) => (
          <div key={index} className="square">
            {revealed[index] ? (
              <img src={img} alt="tile" />
            ) : (
              <div className="hidden-tile">
                <button onClick={() => handleTileClick('chicken', index)} disabled={selectedTiles.chicken !== null}>
                  🐔
                </button>
                <button onClick={() => handleTileClick('banana', index)} disabled={selectedTiles.banana !== null}>
                  🍌
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
