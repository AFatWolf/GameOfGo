import React, { Component } from "react";
import { getCookie } from "../helper";

import {
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  Grid,
  Button,
  FormHelperText,
  Typography, Box,
} from "@material-ui/core";
import { Link } from "react-router-dom";

export default class Login extends Component {
  constructor(props) {
    super(props);
  }

  changeInputField(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  signup() {
    if (this.state.rePassword != this.state.password) {
      alert("Passwords do not match.");
      return;
    }
    const csrftoken = getCookie("csrftoken");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        username: this.state.username,
        password1: this.state.password,
        password2: this.state.rePassword,
      }),
    };
    fetch("/rest-auth/registration/", requestOptions)
      .then((res) => {
        if (res.ok == false) {
          return res.json();
        } else return res.json();
      })
      .then((data) => {
        if (data.username) alert(data.username);
        else if (data.password1) alert(data.password1);
        else if (data.password2) alert(data.password1);
        else this.props.history.push("/login");
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
        bgcolor="white"
        boxShadow={"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}
      >
        <Grid container spacing={1} align="center">
          <Grid item xs={12}>
            <Typography variant="h4">Sign up</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input
                name="username"
                id="username"
                onChange={(e) => this.changeInputField(e)}
              ></Input>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                name="password"
                id="password"
                type="password"
                onChange={(e) => this.changeInputField(e)}
              ></Input>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <InputLabel htmlFor="rePassword">Re-confirm Password</InputLabel>
              <Input
                name="rePassword"
                id="rePassword"
                type="password"
                onChange={(e) => this.changeInputField(e)}
              ></Input>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="secondary"
              onClick={() => this.signup()}
            >
              Sign up
            </Button>
          </Grid>
          <Grid item xs={12} align="left">
          <Link to="/login">Already have an account? Log in.</Link>
        </Grid>
        </Grid>
      </Box>
    );
  }
}
