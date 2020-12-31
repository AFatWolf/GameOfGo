import React, { Component } from "react";
import Chat from "./Chat";
import { GoPieceDef } from "./BoardGraphic";
import {
  FormControl,
  TextField,
  Input,
  InputLabel,
  FormHelperText,
  Grid,
  Button,
} from "@material-ui/core";
import ultilities from "../../static/css/ultilities.module.css";

const imagesPath = "../../static/images/";
const positionConst = {
  UP: 1,
  LEFT: 1 << 1,
  BOTTOM: 1 << 2,
  RIGHT: 1 << 3,
  DOT: 1 << 4,
};
const positionImage = {
  // 1111: have up, left, bottom, right
  [positionConst.LEFT | positionConst.BOTTOM]: "Eul.png",
  [positionConst.LEFT | positionConst.BOTTOM | positionConst.RIGHT]: "Eum.png",
  [positionConst.BOTTOM | positionConst.RIGHT]: "Eur.png",
  [positionConst.UP | positionConst.LEFT | positionConst.BOTTOM]: "Eml.png",
  [positionConst.UP |
  positionConst.LEFT |
  positionConst.BOTTOM |
  positionConst.RIGHT]: "Emm.png",
  [positionConst.UP | positionConst.BOTTOM | positionConst.RIGHT]: "Emr.png",
  [positionConst.UP | positionConst.LEFT | positionConst.RIGHT]: "Ebm.png",
  [positionConst.UP | positionConst.LEFT]: "Ebl.png",
  [positionConst.UP | positionConst.RIGHT]: "Ebr.png",
  [positionConst.DOT]: ",.png",
};

const EMPTY = ".";
const WHITE = "w";
const BLACK = "b";
const WHITE_GHOST = "wg"; // for hover effect
const BLACK_GHOST = "bg"; // for hover effect

function Square(props) {
  const ghostClass =
    props.value == BLACK_GHOST || props.value == WHITE_GHOST
      ? ultilities["ghost"]
      : "";
  const goPiece = (<React.Fragment>
    <GoPieceDef />
    <svg height="23" width="23" className={ghostClass}>
      <circle
        cx="50%"
        cy="50%"
        r="45%"
        fill={`url(${
          props.value.includes(BLACK) ? "#blackPiece" : "#whitePiece"
        })`}
      />
    </svg>
    </React.Fragment>
  );
  let goSquare = props.value == EMPTY ? null : goPiece;
  return (
    <div
      onMouseEnter={() => props.onMouseEnter()}
      // onMouseLeave={() => props.onMouseLeave()}
      onClick={() => props.onClick()}
      className={ultilities["imgOverlayWrap"]}
    >
      <img src={props.srcImg} />
      {goSquare}
    </div>
  );
}

class Board extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let lineSquares = [];
    const size = Math.sqrt(this.props.boardArray.length);
    for (let i = 0; i < size; i++) {
      let line = this.props.boardArray.slice(i * size, (i + 1) * size);

      line = line.map((value, idx) => {
        let positionFlag = 0;
        let ii = i,
          jj = idx;
        positionFlag |= ii != 0 ? positionConst.UP : 0;
        positionFlag |= ii != size - 1 ? positionConst.BOTTOM : 0;
        positionFlag |= jj != 0 ? positionConst.RIGHT : 0;
        positionFlag |= jj != size - 1 ? positionConst.LEFT : 0;
        if(size == 19){
          const iidx = [3, 9, 15];
          const jjdx = [3, 9, 15];
          if(iidx.includes(ii) && jjdx.includes(jj))
            positionFlag = positionConst.DOT;
        } else if(size == 13){
          const iidx = [3, 9];
          const jjdx = [3, 9];
          if((iidx.includes(ii) && jjdx.includes(jj)) || (jj == 6 && ii == 6))
          positionFlag = positionConst.DOT;
        } else if(size == 9){
          const iidx = [2, 6];
          const jjdx = [2, 6];
          if((iidx.includes(ii) && jjdx.includes(jj)) || (jj == 4 && ii == 4))
          positionFlag = positionConst.DOT;
        }
        return (
          <Square
            key={i * size + idx}
            value={value}
            srcImg={imagesPath + positionImage[String(positionFlag)]}
            onClick={() => this.props.onClick(i * size + idx)}
            onMouseEnter={() => this.props.onMouseEnter(i * size + idx)}
          />
        );
      });

      lineSquares = lineSquares.concat(
        <Grid
          item
          xs={12}
          alignItems={"center"}
          style={{ display: "inline-flex" }}
        >
          {line}
        </Grid>
      );
    }
    return (
      <Grid container justify="center" spacing={0}>
        {lineSquares}
      </Grid>
    );
  }
}

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.gameCode = this.props.match.params.code;
    this.state = {
      boardSize: 19,
      boardArray: Array(19 * 19).fill("."),
      isWhite: true,
      isTurn: true,
      whitePlayer: "game_id1",
      blackPlayer: "game_id2",
      chatLog: [],
      legalMove: true,
    };
    fetch(`/api/get-game?code=${this.gameCode}`)
      .then((res) => res.json())
      .then((data) => {
        // connect chat channel
        // init game websocket
        let gameSocketURL =
          "ws://" + window.location.host + "/ws/" + data.code + "/";
        console.log(gameSocketURL);
        this.gameSocket = new WebSocket(gameSocketURL);
        this.gameSocket.onmessage = (e) => {
          let data = JSON.parse(e.data);
          if(data.message){
            alert(data.message);
          } else{
            let isWhite = this.state.isWhite;
            console.log("Received board state: ");
            console.log(data.board_state);
            this.setState({
              lastHover: null,
              isWhite: isWhite == true ? false : true,
              boardArray: data.board_state != null ? data.board_state.split("") : this.state.boardArray,
            });
            console.log(this.state.boardArray);
          }
        };
        this.gameSocket.onclose = (e) => {
          console.error("Game socket closed unexpectedly");
        };
        /****/
        // init chat websocket
        let chatSocketURL = `ws://${window.location.host}/ws/chat/${data.chat_channel_code}/`;
        console.log(chatSocketURL);
        this.chatSocket = new WebSocket(chatSocketURL);
        this.chatSocket.onmessage = (e) => {
          let data = JSON.parse(e.data);
          let chatLog = this.state.chatLog;
          this.setState({
            chatLog: chatLog.concat({ sender: "thanh", message: data.message }),
          });
        };
        this.chatSocket.onclose = (e) => {
          console.error("Chat socket closed unexpectedly");
        };
        // set value
        this.setState({
          gameChannelCode: data.code,
          chatChannelCode: data.chat_channel_code,
          boardArray: data.board_state.split(""),
          chatLog: data.chat_log,
        });
      });
  }

  onPlayerMove(idx) {
    const isWhite = this.state.isWhite;
    let boardArray = this.state.boardArray.slice();
    if (
      boardArray[idx] == EMPTY ||
      boardArray[idx] == WHITE_GHOST ||
      boardArray[idx] == BLACK_GHOST
    ) {
      let move = isWhite === true ? WHITE : BLACK;
      // send boardArray to channel
      this.gameSocket.send(JSON.stringify({ 'ko': idx, 'color': move }));
    }
  }

  onPlayerHover(idx) {
    const isWhite = this.state.isWhite;
    let boardArray = this.state.boardArray.slice();
    if (this.state.lastHover != null) boardArray[this.state.lastHover] = EMPTY;
    if (boardArray[idx] == WHITE || boardArray[idx] == BLACK) return;
    if (boardArray[idx] == EMPTY) {
      boardArray[idx] = isWhite === true ? WHITE_GHOST : BLACK_GHOST;
      console.log(boardArray[idx]);
      // fetch api here to update board state
    }
    this.setState({
      lastHover: idx,
      isWhite: isWhite,
      boardArray: boardArray,
    });
  }

  onSendingMessage(message) {
    this.chatSocket.send(JSON.stringify({ message: message }));
  }

  leaveGameButtonPressed() {
    this.props.leaveGameCallback();
    this.props.history.push("/");
  }

  render() {
    let crntPlayer =
      "Current player" +
      (this.state.isWhite
        ? `(White): ${this.state.whitePlayer}`
        : `(Black): ${this.state.blackPlayer}`);
    return (
      <div>
        <button onClick={() => this.leaveGameButtonPressed()}>
          Leave game
        </button>
        <div>{crntPlayer}</div>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Board
              boardArray={this.state.boardArray}
              onClick={(idx) => this.onPlayerMove(idx)}
              onMouseEnter={(idx) => this.onPlayerHover(idx)}
            />
          </Grid>
          <Grid item xs={4}>
            <Chat
              chatLog={this.state.chatLog}
              onSendingMessage={(message) => this.onSendingMessage(message)}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}
