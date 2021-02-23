import React, { Component } from "react";
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

export default class CreateGame extends Component {
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

  createGameButtonPressed() {
    if (!this.state.gameName) {
      alert("Game name cannot be empty.");
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrf() },
      body: JSON.stringify({
        name: this.state.gameName,
        have_password: this.state.have_password,
        password: this.state.password,
        board_size: 19,
        can_spectate: true,
      }),
    };
    fetch("/api/create-game", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        console.log("Create game");
        console.log(data);
        this.props.onCreateGame();
        this.props.joinGameCallback(data);
        this.props.history.push(`/waiting`);
        // this.props.history.push(`/game/${data.code}`);
      })
      .catch((e) => {
        console.log("error");
        console.log(e);
      });
      
  }

  render() {
    return (
      <Box
        color={"primary.main"}
        bgcolor={"white"}
        border={1}
        borderColor="grey.500"
        borderRadius={10}
        padding={5}
        marginTop={5}
        marginLeft={"auto"}
        marginRight={"auto"}
        display={"block"}
        width={"60%"}
        boxShadow={"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}
      >
        <Grid container spacing={0} align="center">
          <Grid item xs={12} align="center">
            <Typography variant="h5">Create game</Typography>
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
          {/* <Grid item xs={2} align="left">
          <Checkbox
            value="havePassword"
            checked={this.state.havePassword}
            onClick={() => this.changePasswordOption()}
            style={{display: "inline-flex"}}
          />
        </Grid>
        <Grid item xs={8} align="left">
          <FormControl style={{display: "inline-flex"}}>
            <FormLabel label="Password" />
            <Input
              placeholder="Password"
              disabled={!this.state.havePassword}
              name="password"
              onChange={(e) => this.changeInputField(e)}
            ></Input>
          </FormControl>
        </Grid> */}
          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={() => this.createGameButtonPressed()}
            >
              Create
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }
}
