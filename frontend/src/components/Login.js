import React, { Component } from "react";
import { getCookie } from "../helper";
import { Link } from "react-router-dom";

import {
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  Grid,
  Button,
  FormHelperText,
  Typography,
  Box,
} from "@material-ui/core";

export default class Login extends Component {
  constructor(props) {
    super(props);
  }

  changeInputField(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  onKeyDown(e) {
    console.log(e.keyCode);
    if (e.keyCode == 13)
      // if ENTER key is pressed
      this.login();
  }

  login() {
    const csrftoken = getCookie("csrftoken");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    };
    fetch("/rest-auth/login/", requestOptions)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data["non_field_errors"]) alert(data["non_field_errors"]);
        else {
          this.props.onLogin(data.key);
          this.props.history.push("/");
        }
      });
  }

  render() {
    return (
      <Box
        border={1}
        borderColor="grey.500"
        borderRadius={10}
        padding={5}
        marginTop={5}
        marginLeft={"auto"}
        marginRight={"auto"}
        display={"block"}
        width={"20%"}
        bgcolor={"white"}
        boxShadow={"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}
      >
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Typography variant="h4">Log in</Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <FormControl>
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input
                name="username"
                id="username"
                onChange={(e) => this.changeInputField(e)}
              ></Input>
            </FormControl>
          </Grid>
          <Grid item xs={12} align="center">
            <FormControl>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                name="password"
                id="password"
                type="password"
                onChange={(e) => this.changeInputField(e)}
                onKeyDown={(e) => this.onKeyDown(e)}
              ></Input>
            </FormControl>
          </Grid>
          <Grid item xs={12} align="center">
            <Button color="primary" onClick={() => this.login()}>
              Login
            </Button>
          </Grid>
          <Grid item xs={12} align="left">
            <Link to="/signup">Don't have account? Sign up</Link>
          </Grid>
        </Grid>
      </Box>
    );
  }
}
