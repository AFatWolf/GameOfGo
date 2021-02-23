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
} from "@material-ui/core";

export default class SpectateGame extends Component {
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

  render() {
    return (
      <Grid container spacing={0}>
        <Grid item xs={12} align="left">
          Spectate game
        </Grid>
        <Grid item xs={12} align="left">
          <FormControl component="fieldset">
            <InputLabel>Room name</InputLabel>
            <Input
              placeholder="Type your room name"
              required
              name="roomName"
              onChange={(e) => this.changeInputField(e)}
            ></Input>
          </FormControl>
        </Grid>
        <Grid item xs={12} align="left">
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
        </Grid>
      </Grid>
    );
  }
}
