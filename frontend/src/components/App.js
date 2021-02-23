import React, { Component } from "react";
import { render } from "react-dom";
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { getCookie } from "../helper";
import Game from "./Game";
import Lobby from "./Lobby";
import Login from "./Login";
import Signup from "./Signup";
import NavBar from "./NavBar";
import WaitingRoom from "./WaitingRoom";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: null,
    };
  }

  componentDidMount() {
    const csrftoken = getCookie("csrftoken");
    let isLoggedIn;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
    };

    fetch("/api/is-logged-in", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        console.log("Is logged In");
        console.log(data);
        this.setState({
          isLoggedIn: data.is_logged_in,
          username: data.username,
          code: data.code ? data.code : null,
        });
        console.log(this.state);
      });
  }

  login(token) {
    this.setState({
      token: token,
      isLoggedIn: true,
    });
  }

  logout() {
    this.setState({
      token: "",
      isLoggedIn: false,
    });
  }

  leaveGame() {
    // const csrftoken = getCookie("csrftoken");
    // const requestOptions = {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
    // };
    // fetch("/api/leave-game", requestOptions).then((res) => res.json()).then((data) => {
    //   console.log("leave game: ");
    //   console.log(data);
    //   this.setState({
    //     code: "",
    //   })});
    this.setState({ code: null });
  }

  joinGame(data) {
    this.setState({
      code: data.code,
    });
    // check if game is still up
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            path="/waiting"
            render={(props) => {
              console.log("waiting rendering");
              console.log(this.state.code);
              return this.state.code ? (
                <WaitingRoom {...props} code={this.state.code} />
              ) : (
                <Redirect to="/"></Redirect>
              );
            }}
          ></Route>
          <Route
            path="/game/:code"
            render={(props) => {
              return this.state.code ? (
                <Game {...props} leaveGameCallback={() => this.leaveGame()} />
              ) : (
                <Redirect to="/"></Redirect>
              );
            }}
          ></Route>
          <Route
            exact
            path="/"
            render={(props) => {
              let r =
                this.state.isLoggedIn == true ? (
                  <React.Fragment>
                    <NavBar
                      {...props}
                      username={this.state.username}
                      onLogout={() => this.logout()}
                    ></NavBar>
                    <Lobby
                      {...props}
                      joinGameCallback={(data) => this.joinGame(data)}
                      onLogout={() => this.logout()}
                    />
                  </React.Fragment>
                ) : (
                  <Redirect to="/login"></Redirect>
                );
              r = this.state.code ? (
                <Redirect to={`/game/${this.state.code}`}></Redirect>
              ) : (
                r
              );
              return r;
            }}
          ></Route>
          <Route
            path="/login"
            render={(props) => {
              return this.state.isLoggedIn == true ? (
                <Redirect to="/"></Redirect>
              ) : (
                <Login {...props} onLogin={(token) => this.login(token)} />
              );
            }}
          ></Route>
          <Route
            path="/signup"
            render={(props) => <Signup {...props} />}
          ></Route>
        </Switch>
      </Router>
    );
  }
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
