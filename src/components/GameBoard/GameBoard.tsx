import { useState, useEffect } from 'react';
import './GameBoard.css';
import Cell from '../Cell/Cell'
import Counter from '../Counter/Counter'

const imgSize = 40;

function GameBoard() 
{
    const [boardColumns, setBoardColumns] = useState(8);
    const [boardRows, setBoardRows] = useState(8);
    const [boardCells, setBoardCells] = useState(boardColumns * boardRows);
    const [boardWidth, setBoardWidth] = useState(boardColumns * imgSize);
    const [boardHeight, setBoardHeight] = useState(boardRows * imgSize);
    const [mines, setMines] = useState(10);
    const [minesPositions, setMinesPositions] = useState(Array<number>);
    const [tiles, setTiles] = useState(Array<number>);
    const [tileRevealed, setTileRevealed] = useState(Array<boolean>);
    const [toReveal, setToReveal] = useState(0);
    const [userMineCounter, setUserMineCounter] = useState(0);
    const [gameState, setGameState] = useState("waiting");
    const [difficulty, setDifficulty] = useState("easy");
    const [timerValue, setTimerValue] = useState(0);

    useEffect(()=>{
        reset();
    }, []);

    useEffect(() => {
        let timerID : NodeJS.Timer;
        if(gameState === "running")
        {
            timerID = setInterval(() => setTimerValue(timerValue+1), 1000); 
        }
        return () => clearInterval(timerID);
    }, [gameState, timerValue]);

    function initializeMines(minesToGenerate: number, cells: number) : number[]
    {
        let generetedMinePositions = Array<number>();
        let mineCount = 0;

        while(mineCount < minesToGenerate)
        {
            let newPosition = Math.floor(Math.random()*cells);
            if(!generetedMinePositions.includes(newPosition))
            {
                generetedMinePositions.push(newPosition);
                mineCount++;
            }
        }

        return generetedMinePositions;
    }

    function initializeGameBoard(mines: number[], rows: number, cols: number) : number[]
    {
        let tiles = Array(rows * cols);
        tiles.fill(0);
    
        for(let i = 0; i < mines.length; i++)
        {
            let minePosition = mines[i];
            let neighbours = getNeighbours(minePosition, rows, cols);
            neighbours.forEach((neighbour) => {
                if(tiles[neighbour] !== 9)
                    {
                        tiles[neighbour]++;
                    }
                });
            tiles[minePosition] = 9; // TODO: Remove magic number, 9 means there's a mine
        }
    
        return tiles;
    }

    function initializeTilesRevealed(cells: number) : boolean[]
    {
        let tiles = Array<boolean>(cells);
        tiles.fill(false);
        return tiles;
    }
    
    function getNeighbours(index: number, rows: number, cols: number): number[]
    {
        let neighbours = Array<number>();
    
        let checkAbove = (index-cols >= 0);
        let checkBellow = (index+cols < rows * cols);
        let checkLeft = ((index) % cols) !== 0;
        let checkRight = ((index+1) % cols) !== 0;
    
        if(checkAbove)
        {
            let cellAbove = index-cols;
            if(checkLeft) neighbours.push(cellAbove-1);
            neighbours.push(cellAbove);
            if(checkRight) neighbours.push(cellAbove+1);
        }
        if(checkLeft) neighbours.push(index-1);
        if(checkRight) neighbours.push(index+1);
        if(checkBellow)
        {
            let checkBellow = index+cols;
            if(checkLeft) neighbours.push(checkBellow-1);
            neighbours.push(checkBellow);
            if(checkRight) neighbours.push(checkBellow+1);
        }
    
        return neighbours;
    }

    function tileRevealedHandler(index: number)
    {
        function revealEmptyTiles(tileToReveal: number, tileMap: boolean[]) : number
        {
            
            let revealedTiles = 1;
            tileMap[tileToReveal] = true;
            if(tiles[tileToReveal] === 0)
            {
                let neighbours = getNeighbours(tileToReveal, boardRows, boardColumns);
                neighbours.forEach((neighbour) => {
                    if(!tileMap[neighbour])
                    {
                        revealedTiles += revealEmptyTiles(neighbour, tileMap);
                    }
                });
            }
            return revealedTiles;
        };

        if(toReveal === boardCells - mines)
        {
            setGameState("running");
        }

        if(tiles[index] === 9)
        {
            // Mine revealed
            let updatedTiles = tiles.slice();
            updatedTiles[index] = 10; // This is meant for the cell to use the mine off image (awful stuff, I know)
            setTiles(updatedTiles);
            
            let updatedTileRevealed = tileRevealed.slice();
            minesPositions.forEach((minePosition) => {
                updatedTileRevealed[minePosition] = true;
            });
            setTileRevealed(updatedTileRevealed);
            setGameState("ended");
        }
        else
        {
            // Must reveal neighbours
            let updatedTileRevealed = tileRevealed.slice();
            let revealedTiles = revealEmptyTiles(index, updatedTileRevealed);
            setTileRevealed(updatedTileRevealed);
            setToReveal(toReveal - revealedTiles);
            if(toReveal - revealedTiles === 0)
            {
                setGameState("ended");
            }
        }
    }

    function flagSetHandler()
    {
        setUserMineCounter(userMineCounter - 1);
    }

    function flagUnsetHandler()
    {
        setUserMineCounter(userMineCounter + 1);
    }

    function reset()
    {
        let rows = 0, cols = 0, cells = 0, minePerDif = 0;

        if(difficulty === "easy")
        {
            rows = 8;
            cols = 8;
            minePerDif = 10;
        }
        else if(difficulty === "intermediate")
        {
            rows = 16;
            cols = 16;
            minePerDif = 40;
        }
        else if(difficulty === "expert")
        {
            rows = 16;
            cols = 30;
            minePerDif = 99;
        }

        cells = rows * cols;

        setBoardColumns(cols);
        setBoardRows(rows);
        setBoardCells(cells);
        setBoardWidth(cols * imgSize);
        setBoardHeight(rows * imgSize);
        setMines(minePerDif);
        let minePositions = initializeMines(minePerDif, cells);
        setMinesPositions(minePositions);
        setTiles(initializeGameBoard(minePositions, rows, cols));
        setTileRevealed(initializeTilesRevealed(cells));
        setToReveal(cells - minePerDif);
        setUserMineCounter(minePerDif);
        setGameState("waiting");
        setTimerValue(0);
    }

    return (
        <div className="Game"
            style={{width: boardWidth}}>
            <select 
                name="difficulty"
                id="dif-select"
                onChange={e => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
            </select>
            <div className="GameInfo">
                <Counter value={userMineCounter}/>
                <button onClick={reset}>New</button>
                <Counter value={timerValue}/>
            </div>
            <div className="GameBoard"
                style={{height: boardHeight}}>
                {tiles.map((tile, index) => (
                    <Cell
                        key={index}
                        tile={tile}
                        index={index}
                        isRevealed={tileRevealed[index]}
                        onTileRevealed={tileRevealedHandler}
                        onFlagSet={flagSetHandler}
                        onFlagUnset={flagUnsetHandler}
                    />
                ))}
            </div>
        </div>
      );
}

export default GameBoard;