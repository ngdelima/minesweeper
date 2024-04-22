import { useState } from 'react';
import { MouseEvent } from 'react';

import tileNotSelected from "./img/tile_not_selected.png";
import tileFlag from "./img/tile_flag.png";
import tileQuestion from "./img/tile_question_mark.png";
import tileMine from "./img/tile_mine.png";
import tileMineOff from "./img/tile_mine_off.png";
import tileShade from "./img/tile_shade.png";
import tile1 from "./img/tile_1.png";
import tile2 from "./img/tile_2.png";
import tile3 from "./img/tile_3.png";
import tile4 from "./img/tile_4.png";
import tile5 from "./img/tile_5.png";
import tile6 from "./img/tile_6.png";
import tile7 from "./img/tile_7.png";
import tile8 from "./img/tile_8.png";

const tiles = [tileShade, tile1, tile2, tile3, tile4, tile5, tile6, tile7, tile8, tileMine, tileMineOff];

type Props = {
    tile: number,
    index: number,
    isRevealed: boolean,
    onTileRevealed: (index: number) => void
    onFlagSet: () => void
    onFlagUnset: () => void
};

function Cell(props: Props)
{
    const [state, setState] = useState("blank");
    
    function getImageSrcForTile()
    {
        if(props.isRevealed)
            return tiles[props.tile];
        else
        {
            if(state === "blank")
            {
                return tileNotSelected;
            }
            else if(state === "flag")
            {
                return tileFlag;
            }
            else if(state === "question")
            {
                return tileQuestion;
            }
        }
            
    }

    function clickHandler(e: MouseEvent)
    {
        if(state === "blank")
        {
            props.onTileRevealed(props.index);
        }
    }

    function contextMenuHandler(e: MouseEvent)
    {
        e.preventDefault();

        if(state === "blank")
        {
            setState("flag");
            props.onFlagSet();
        }
        else if(state === "flag")
        {
            setState("question");
            props.onFlagUnset();
        }
        else if(state === "question")
        {
            setState("blank");
        }
    }

    return (
    <img
        alt=""
        key={props.index}
        data-id={props.index}
        src={getImageSrcForTile()}
        onClick={clickHandler}
        onContextMenu={contextMenuHandler}
        draggable="false"
    />);
}

export default Cell;