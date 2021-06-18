import React, { Component } from "react";
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom";
import CreateGame from "./CreateGame";
import JoinGame from "./JoinGame";
import SpectateGame from "./SpectateGame";
import BoardGraphic from "./BoardGraphic";
import Logout from "./Logout";
import { getCsrf, waitForSocketConnection } from "../helper";
import {
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Button,
  Box,
} from "@material-ui/core";

class GameInLobby extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const backgroundURI = "../../static/images/goban_bg.png";
    return (
      // <Card >
      //   <CardActionArea>
      //     <CardContent>
      <Box
        boxShadow={
          "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"
        }
        borderColor="grey.500"
        borderRadius={10}
        position="relative"
        overflow="hidden"
        paddingLeft={2}
      >
        <div
          style={{
            overflow: "hidden",
            display: "inline",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <img
            style={{ "margin-left": "150px", "text-align": "right" }}
            src={backgroundURI}
          ></img>
        </div>
        <Typography variant="h5">{this.props.info.name}</Typography>
        <Typography style={{ "font-size": "14px", color: "grey" }}>
          Host: {this.props.info.host}
        </Typography>
        <Button
          size="small"
          color="primary"
          onClick={() =>
            this.props.onJoinGame({
              code: this.props.info.code,
              name: this.props.info.name,
            })
          }
        >
          Join
        </Button>
      </Box>
      //     {/* </CardContent>
      //   </CardActionArea>
      //   <CardActions>

      //   </CardActions>
      // </Card> */}
    );
  }
}

export default class Lobby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
    };
  }

  onCreateGame() {
    if (this.lobbySocket) {
      this.lobbySocket.send(JSON.stringify({ signal: "create-game" }));
    } else {
      console.log("Cannot find lobby socket.");
    }
  }

  onJoinGame(data) {
    let code = data.code;
    let name = data.name;
    console.log("Code and data");
    console.log({ code: code, name: name });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrf() },
      body: JSON.stringify({
        game_name: name,
        code: code,
        password: "",
        can_spectate: true,
      }),
    };
    console.log("Trying to join!");
    fetch("/api/join-game", requestOptions)
      .then((res) => {
        if(!res.ok){
          alert("Cannot join.");
        }
        return res.json()
      })
      .then((data) => {
        if (data["Bad request"]) {
          alert("Cannot join.");
          return;
        }
        // notify the host that i am in
        let urlscheme = window.location.protocol === "https:" ? "wss://" : "ws://";
        let waitURL =
        urlscheme + window.location.host + "/ws/wait/" + data.code + "/";
        this.waitSocket = new WebSocket(waitURL);
        waitForSocketConnection(this.waitSocket, () => {
          this.waitSocket.send(JSON.stringify({ signal: "start-game" }));
          this.waitSocket.close();
        }, "startgame");
        this.props.joinGameCallback(data);
        this.props.history.push(`/game/${data.code}`);
      });
  }

  componentDidMount() {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          games: data,
        });
      });
    if(!this.lobbySocket){
      let urlscheme = window.location.protocol === "https:" ? "wss://" : "ws://";
      const lobbyURL = urlscheme + window.location.host + "/ws/lobby/";
      this.lobbySocket = new WebSocket(lobbyURL);
      waitForSocketConnection(this.lobbySocket, () => console.log("Wait for lobbySocket"));
      this.lobbySocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.message) {
          console.log(data.message);
        } else {
          console.log(data);
          this.setState({
            games: data,
          });
        }
      };
      this.lobbySocket.onclose = (e) => {
        console.log("Lobby socket closed unexpectedly.");
      };
    }
  }

  render() {
    const games = this.state.games.slice();
    // can turn into another react component
    let gamesList =
      games.length > 0 ? (
        games.map((game) => (
          <Grid item xs={12}>
            <GameInLobby
              key={game.id}
              id={game.id}
              info={game}
              onJoinGame={(data) => this.onJoinGame(data)}
            ></GameInLobby>
          </Grid>
        ))
      ) : (
        <Grid item xs={12} align="center">
          <Typography variant="h5" color="grey">
            There is no game at the moment.
          </Typography>
        </Grid>
      );
    gamesList = (
      <Box
        padding={5}
        marginLeft={"auto"}
        marginRight={"auto"}
        display={"block"}
        width={"95%"}
      >
        <Grid container spacing={1}>
          {gamesList}
        </Grid>
      </Box>
    );
    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={7}>
            {gamesList}
          </Grid>
          <Grid item xs={5}>
            <Grid item xs={12}>
              <CreateGame
                {...this.props}
                joinGameCallback={(data) => this.props.joinGameCallback(data)}
                onCreateGame={() => this.onCreateGame()}
              />
            </Grid>
            <Grid item xs={12}>
              <JoinGame
                {...this.props}
                joinGameCallback={(data) => this.onJoinGame(data)}
              />
            </Grid>
            {/* <Router>
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <Link to="/create-game">Create game</Link>
                </Grid>
                <Grid item xs={5}>
                  <Link to="/join-game">Join game</Link>
                </Grid>
              </Grid>
              <Switch>
                <Route
                  path="/create-game"
                  render={() => (
                    <CreateGame
                      {...this.props}
                      joinGameCallback={(data) =>
                        this.props.joinGameCallback(data)
                      }
                    />
                  )}
                ></Route>
                <Route
                  path="/join-game"
                  render={() => (
                    <JoinGame
                      {...this.props}
                      joinGameCallback={(data) =>
                        this.props.joinGameCallback(data)
                      }
                    />
                  )}
                ></Route>
                <Route path="/spectate-game"><SpectateGame/></Route>
              </Switch>
            </Router> */}
          </Grid>
        </Grid>
      </div>
    );
  }
}
