import React, { Component } from "react";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Logout from "./Logout";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  toolBar: {
    background: "#FFFFFF",
  },
  brand: {
    flexGrow: 1,
    color: "black",
  },
  text: {
    color: "black",
  },
});

export default function NavBar(props) {
  const classes = useStyles();

  return (
    <AppBar position="sticky" className={classes.root}>
      <Toolbar className={classes.toolBar}>
        <Typography
          variant="h4"
          className={classes.brand}
        >
          Go
        </Typography>
        <Typography className={classes.text}>{props.username}</Typography>
        <Logout {...props} className={classes.text} onLogout={() => props.onLogout()} />
      </Toolbar>
    </AppBar>
  );
}
