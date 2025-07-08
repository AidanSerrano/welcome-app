import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const CHICKEN_URL = 'https://thumbs.dreamstime.com/z/full-body-brown-chicken-hen-standing-isolated-white-backgroun-background-use-farm-animals-livestock-theme-49741285.jpg?ct=jpeg';
const BANANA_URL = 'https://thumbs.dreamstime.com/b/bunch-bananas-6175887.jpg?w=768';

const socket = io('http://172.18.0.168:3001'); // your IPv4 here

function App() {
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState({ chicken: null, banana: null });
  const [winner, setWinner] = useState(null);
  const [hasChickenSelected, setHasChickenSelected] = useState(false);
  const [hasBananaSelected, setHasBananaSelected] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    socket.on('stateUpdate', (data) => {
      setGrid(data.grid);
      setRevealed(data.revealed);
      setSelectedTiles(data.selectedTiles);
      setWinner(data.winner);
      setHasChickenSelected(data.hasChickenSelected);
      setHasBananaSelected(data.hasBananaSelected);
    });

    return () => {
      socket.off('stateUpdate');
    };
  }, []);

  const broadcastState = (grid, revealed, selectedTiles, winner, hasChickenSelected, hasBananaSelected) => {
    socket.emit('playerAction', {
      grid,
      revealed,
      selectedTiles,
      winner,
      hasChickenSelected,
      hasBananaSelected,
    });
  };

  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const resetGame = () => {
    const half = 18;
    const shuffled = shuffleArray([
      ...Array(half).fill(CHICKEN_URL),
      ...Array(half).fill(BANANA_URL),
    ]);
    const freshRevealed = Array(36).fill(false);
    setGrid(shuffled);
    setRevealed(freshRevealed);
    setWinner(null);
    setSelectedTiles({ chicken: null, banana: null });
    setHasChickenSelected(false);
    setHasBananaSelected(false);
    broadcastState(shuffled, freshRevealed, { chicken: null, banana: null }, null, false, false);
  };

  const handleTileClick = (index, player) => {
    if (revealed[index] || winner || selectedTiles[player] !== null) return;

    const updatedSelections = { ...selectedTiles, [player]: index };
    setSelectedTiles(updatedSelections);

    const bothSelected = updatedSelections.chicken !== null && updatedSelections.banana !== null;

    if (bothSelected) {
      const chickenCorrect = grid[updatedSelections.chicken] === CHICKEN_URL;
      const bananaCorrect = grid[updatedSelections.banana] === BANANA_URL;

      const newRevealed = [...revealed];
      newRevealed[updatedSelections.chicken] = true;
      newRevealed[updatedSelections.banana] = true;
      setRevealed(newRevealed);

      let roundWinner = null;
      if (!chickenCorrect && bananaCorrect) {
        roundWinner = 'banana';
        setWinner('banana');
      } else if (!bananaCorrect && chickenCorrect) {
        roundWinner = 'chicken';
        setWinner('chicken');
      } else if (!bananaCorrect && !chickenCorrect) {
        roundWinner = 'none';
        setWinner('none');
      } else {
        // continue game
        setHasChickenSelected(false);
        setHasBananaSelected(false);
        setSelectedTiles({ chicken: null, banana: null });
      }

      broadcastState(grid, newRevealed, { chicken: null, banana: null }, roundWinner, false, false);
    } else {
      setSelectedTiles(updatedSelections);
      broadcastState(grid, revealed, updatedSelections, winner, hasChickenSelected, hasBananaSelected);
    }
  };

  const revealAll = () => {
    const allRevealed = Array(36).fill(true);
    setRevealed(allRevealed);
    setWinner('revealed');
    broadcastState(grid, allRevealed, selectedTiles, 'revealed', hasChickenSelected, hasBananaSelected);
  };

  return (
    <div className="container">
      <h1>Chicken Banana Game!</h1>

      {!winner && (
        <div className="choice-buttons">
          {!hasChickenSelected && (
            <button onClick={() => {
              setHasChickenSelected(true);
              broadcastState(grid, revealed, selectedTiles, winner, true, hasBananaSelected);
            }}>
              I am Chicken Player
            </button>
          )}
          {!hasBananaSelected && (
            <button onClick={() => {
              setHasBananaSelected(true);
              broadcastState(grid, revealed, selectedTiles, winner, hasChickenSelected, true);
            }}>
              I am Banana Player
            </button>
          )}
        </div>
      )}

      {!winner && (
        <div className="status">
          {hasChickenSelected && !selectedTiles.chicken && <p>Chicken Player: Pick a tile</p>}
          {hasBananaSelected && !selectedTiles.banana && <p>Banana Player: Pick a tile</p>}
        </div>
      )}

      {winner && winner !== 'revealed' && (
        <div className="winner">
          <h2>{winner.toUpperCase()} Player Wins! 🎉</h2>
        </div>
      )}

      <div className="grid">
        {grid.map((img, index) => (
          <div
            key={index}
            className="square"
            onClick={() => {
              if (hasChickenSelected && selectedTiles.chicken === null) {
                handleTileClick(index, 'chicken');
              } else if (hasBananaSelected && selectedTiles.banana === null) {
                handleTileClick(index, 'banana');
              }
            }}
          >
            {revealed[index] ? (
              <img src={img} alt="tile" />
            ) : (
              <div className="hidden-tile">{index + 1}</div>
            )}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={revealAll}>Reveal All</button>
        {(winner || winner === 'revealed') && <button onClick={resetGame}>Play Again</button>}
      </div>
    </div>
  );
}

export default App;
