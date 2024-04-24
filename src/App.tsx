import { produce } from 'immer';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const numRows = 50;
const numCols = 50;

/** neighbors positions of a cell */
const operations = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
];

type Grid = (0 | 1)[][];

const generateEmptyGrid = () => {
  const rows: Grid = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const generateRandomGrid = () => {
  const rows: Grid = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
  }
  return rows;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() => {
    return generateRandomGrid();
  });

  const [running, setRunning] = useState(true);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numRows; k++) {
            //compute numbers of neighbors
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              //check if not outside of grid
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                //increment if a neighbors is found
                neighbors += g[newI][newK];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, 100);
  }, [running]);

  useEffect(() => {
    let isMounted = true;

    if (isMounted && running) {
      runSimulation();
    }

    return () => {
      isMounted = false;
    };
  }, [running]);

  return (
    <>
      <div style={{ display: 'flex', gap: 8, paddingBlock: 8 }}>
        <button
          onClick={() => setRunning(!running)}
          style={{ backgroundColor: running ? 'red' : '#8bc34a' }}
        >
          {running ? 'Stop' : 'Start'}
        </button>

        <button onClick={() => setGrid(generateEmptyGrid())}>Clear grid</button>

        <button onClick={() => setGrid(generateRandomGrid())}>
          Random grid
        </button>

        <span>Click on a cell to toggle it</span>

        <span style={{ marginLeft: 'auto' }}>
          <a href='https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life'>
            Rules
          </a>
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 20px)`,
        }}
      >
        {grid.map((rows, x) =>
          rows.map((column, y) => (
            <div
              key={`${x}-${y}`}
              onClick={() => {
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[x][y] = grid[x][y] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[x][y] ? 'white' : undefined,
                border: 'solid 0.5px grey',
                cursor: 'pointer',
              }}
            ></div>
          ))
        )}
      </div>
    </>
  );
};

export default App;
