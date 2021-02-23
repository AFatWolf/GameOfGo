import React, { Component } from "react";
import { palette } from '@material-ui/system';
import {
  Grid,
  Input,
  InputLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Checkbox,
  FormGroup,
  Button,
  Box,
  Typography,
} from "@material-ui/core";
import { getCsrf } from "../helper";

export default class JoinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      havePassword: false,
      roomName: "",
    };
  }

  changePasswordOption() {
    this.setState({
      havePassword: this.state.havePassword == false ? true : false,
    });
  }

  /* make sure event has 'name' and 'value' field */
  changeInputField(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  joinGameButtonPressed() {
    this.props.joinGameCallback({code: this.state.gameCode, name: this.state.gameName});
    // const requestOptions = {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrf() },
    //   body: JSON.stringify({
    //     game_name: this.state.gameName,
    //     code: this.state.gameCode,
    //     password: this.state.password,
    //     can_spectate: true,
    //   }),
    // };
    // console.log("Trying to join!");
    // fetch("/api/join-game", requestOptions)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log("Join game");
    //     console.log(data);
    //     // notify the host that i am in
    //     let waitURL = "ws://" + window.location.host + "/ws/wait/" + this.props.code + "/";
    //     this.waitSocket = new WebSocket(waitURL);
    //     this.waitSocket.send(JSON.stringify({'signal': 'start-game'}));
    //     this.waitSocket.close();

    //     this.props.joinGameCallback(data);
    //     this.props.history.push(`/game/${data.code}`);
    //   });
  }

  render() {
    return (
      <Box
        color={"secondary.main"}
        bgcolor={"white"}
        border={1}
        borderColor={"grey.500"}
        borderRadius={10}
        padding={5}
        marginTop={5}
        marginLeft={"auto"}
        marginRight={"auto"}
        display={"block"}
        width={"60%"}
        boxShadow={"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}
      >
        <Grid container spacing={0}>
          <Grid item xs={12} align="center">
            <Typography variant="h5">Join game</Typography>
          </Grid>
          <Grid item xs={12} align="left">
            <FormControl component="fieldset">
              <InputLabel>Room name</InputLabel>
              <Input
                placeholder="Type your game name"
                required
                name="gameName"
                onChange={(e) => this.changeInputField(e)}
              ></Input>
            </FormControl>
          </Grid>
          <Grid item xs={12} align="left">
            <FormControl component="fieldset">
              <InputLabel>Game code</InputLabel>
              <Input
                placeholder="Type your game code"
                required
                name="gameCode"
                onChange={(e) => this.changeInputField(e)}
              ></Input>
            </FormControl>
          </Grid>
          {/* <Grid item xs={12} align="left">
          <Checkbox
            value="havePassword"
            checked={this.state.havePassword}
            onClick={() => this.changePasswordOption()}
          />
          <FormControl component="fieldset">
            <FormLabel label="Password" />
            <Input
              placeholder="Password"
              disabled={!(this.state.havePassword)}
              name="password" 
              onChange={(e) => this.changeInputField(e)}
            ></Input>
          </FormControl>
        </Grid> */}
          <Grid item xs={12} align="center">
            <Button
              color="secondary"
              onClick={() => this.joinGameButtonPressed()}
            >
              Join game
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }
}
