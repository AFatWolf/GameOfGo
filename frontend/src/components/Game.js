import React, { Component } from "react";
import Chat from "./Chat";
import Result from "./Result";
import { GoPieceDef } from "./BoardGraphic";
import {
  FormControl,
  TextField,
  Input,
  InputLabel,
  FormHelperText,
  Grid,
  Button,
  Box,
  Typography,
} from "@material-ui/core";
import ultilities from "../../static/css/ultilities.module.css";
import { waitForSocketConnection } from "../helper";

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
  const goPiece = (
    <React.Fragment>
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
        if (size == 19) {
          const iidx = [3, 9, 15];
          const jjdx = [3, 9, 15];
          if (iidx.includes(ii) && jjdx.includes(jj))
            positionFlag = positionConst.DOT;
        } else if (size == 13) {
          const iidx = [3, 9];
          const jjdx = [3, 9];
          if ((iidx.includes(ii) && jjdx.includes(jj)) || (jj == 6 && ii == 6))
            positionFlag = positionConst.DOT;
        } else if (size == 9) {
          const iidx = [2, 6];
          const jjdx = [2, 6];
          if ((iidx.includes(ii) && jjdx.includes(jj)) || (jj == 4 && ii == 4))
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
          align="center"
          style={{ display: "inline-flex" }}
        >
          {line}
        </Grid>
      );
    }
    return (
      <Grid container spacing={0}>
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
      chatLog: [],
      legalMove: true,
    };
    this.whitePlayer = "game_id1";
    this.blackPlayer = "game_id2";
    fetch(`/api/get-game?code=${this.gameCode}`)
      .then((res) => res.json())
      .then((data) => {
        // connect chat channel
        // init game websocket
        let gameSocketURL =
          "ws://" + window.location.host + "/ws/game/" + data.code + "/";
        this.gameSocket = new WebSocket(gameSocketURL);
        this.gameSocket.onmessage = (e) => {
          let data = JSON.parse(e.data);
          if (data.message) {
            alert("Invalid move!");
          } else if(data.signal == "end_game"){
            alert("End game!");
            let scores = data.scores;
            let win = true;
            if(this.state.isWhite == true) {
              win = data.scores.white > data.scores.black ? true : false;
            } else {
              win = data.scores.black > data.scores.white ? true : false;
            } 
            if(data.scores.black == data.scores.white)
              win = "draw";
            // get out of room
            // this.props.leaveGameCallback();
            console.log("Win or not");
            this.setState({win: win});
          } else {
            this.setState({
              lastHover: null,
              isTurn: this.state.isTurn == true ? false : true,
              boardArray:
                data.board_state != null
                  ? data.board_state.split("")
                  : this.state.boardArray,
            });
          }
        };
        this.gameSocket.onclose = (e) => {
          console.error("Game socket closed unexpectedly");
        };
        /****/
        // init chat websocket
        let chatSocketURL = `ws://${window.location.host}/ws/chat/${data.chat_channel_code}/`;
        this.chatSocket = new WebSocket(chatSocketURL);
        this.chatSocket.onmessage = (e) => {
          let data = JSON.parse(e.data);
          let chatLog = this.state.chatLog;
          this.setState({
            chatLog: chatLog.concat({
              sender: data.sender,
              message: data.message,
            }),
          });
        };
        this.chatSocket.onclose = (e) => {
          console.error("Chat socket closed unexpectedly");
        };
        // set value
        // is the player playing white or black
        const isWhite = data.is_host == data.white_is_host ? true : false;
        let isTurn;
        if (
          (isWhite && data.playing_color == "white") ||
          (!isWhite && data.playing_color == "black")
        )
          isTurn = true;
        else isTurn = false;
        this.setState({
          isTurn: isTurn,
          isWhite: isWhite,
          gameChannelCode: data.code,
          chatChannelCode: data.chat_channel_code,
          boardArray: data.board_state.split(""),
          chatLog: data.chat_log,
        });
      });
  }

  onPlayerMove(idx) {
    if (!this.state.isTurn) {
      alert("Not your turn.");
      return;
    }
    const isWhite = this.state.isWhite;
    let boardArray = this.state.boardArray.slice();
    if (
      boardArray[idx] == EMPTY ||
      boardArray[idx] == WHITE_GHOST ||
      boardArray[idx] == BLACK_GHOST
    ) {
      let move = isWhite === true ? WHITE : BLACK;
      // send boardArray to channel
      this.gameSocket.send(JSON.stringify({ ko: idx, color: move }));
    }
  }

  onPlayerHover(idx) {
    const isWhite = this.state.isWhite;
    let boardArray = this.state.boardArray.slice();
    if (this.state.lastHover != null) boardArray[this.state.lastHover] = EMPTY;
    if (boardArray[idx] == WHITE || boardArray[idx] == BLACK) return;
    if (boardArray[idx] == EMPTY) {
      boardArray[idx] = isWhite === true ? WHITE_GHOST : BLACK_GHOST;
      // fetch api here to update board state
    }
    this.setState({
      lastHover: idx,
      boardArray: boardArray,
    });
  }

  onSendingMessage(message) {
    this.chatSocket.send(JSON.stringify({ message: message }));
  }

  passButtonPressed(){
    if(this.state.isTurn == true){
      alert("You passed your turn.");
      this.gameSocket.send(JSON.stringify({'signal': 'pass'}));
    }
    else
      alert("It is not your turn!");
  }

  leaveGameButtonPressed() {
    // waitForSocketConnection(this.gameSocket, () => this.gameSocket.send(JSON.stringify({'signal': 'end_game'})), "leave");
    this.props.leaveGameCallback();
    this.gameSocket.send(JSON.stringify({'signal': 'end_game'}));
    this.gameSocket.close();
    this.chatSocket.close();
    this.props.history.push("/");
  }

  render() {
    let crntPlayer =
    (<Typography>Current player {
      ((this.state.isTurn == true && this.state.isWhite == true) || (this.state.isTurn == false && this.state.isWhite == false)
        ? <React.Fragment>(White): <b>{this.whitePlayer}</b></React.Fragment>
        :<React.Fragment>(Black): <b>{this.blackPlayer}</b></React.Fragment>)}</Typography>);
    return "win" in this.state ? <Result result={this.state.win} leaveGameCallback={() => this.props.leaveGameCallback()}></Result> : (
      <div>
        <Button onClick={() => this.leaveGameButtonPressed()}>
          Leave game
        </Button>
        {/* {crntPlayer} */}
        <Grid container spacing={4} marginTop={5}>
          <Grid item xs={8}>
            <Box paddingLeft={"25%"}>
              <Board
                boardArray={this.state.boardArray}
                onClick={(idx) => this.onPlayerMove(idx)}
                onMouseEnter={(idx) => this.onPlayerHover(idx)}
              />
            </Box>
          </Grid>

          <Grid item xs={3}>
            <Chat
              chatLog={this.state.chatLog}
              onSendingMessage={(message) => this.onSendingMessage(message)}
            />
          </Grid>
        </Grid>
        <Button onClick={() => this.passButtonPressed()}>
          Pass
        </Button>
      </div>
    );
  }
}
