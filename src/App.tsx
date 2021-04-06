import React, { useCallback, useRef, useState } from "react";
import { produce } from "immer";

const numRows = 50;
const numCols = 50;

//neighbors postitions of a cell
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

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const generateRandomGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
  }
  return rows;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return generateRandomGrid();
  });

  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numRows; k++) {
            //compute numbers of neigbors
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
  }, []);

  return (
    <>
      <div style={{ display: "flex" }}>
        <button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              runSimulation();
            }
          }}
          style={{ backgroundColor: running ? "red" : "#8bc34a" }}
        >
          {running ? "stop" : "start"}
        </button>

        <button onClick={() => setGrid(generateRandomGrid())}>clear</button>

        <button
          onClick={() => {
            setGrid(generateRandomGrid());
          }}
        >
          random
        </button>

        <span style={{ marginLeft: "auto" }}>
          <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">
            Rules
          </a>
        </span>
      </div>

      <div
        style={{
          display: "grid",
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
                backgroundColor: grid[x][y] ? "pink" : undefined,
                border: "solid 1px grey",
              }}
            ></div>
          ))
        )}
      </div>
    </>
  );
};

export default App;
