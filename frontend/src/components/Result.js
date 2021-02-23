import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import {Button, Box, Typography} from "@material-ui/core";

export default class Result extends Component {
    constructor(props){
        super(props);
    }

    render(){
        let result;
        if(this.props.result == "draw")
            result = "draw";
        else
            result = "You " + (this.props.result ? "win!" : "lose!");
        return (<Box marginTop={"20%"} margin="auto" align="center">
            <Typography variant="h3">{result}</Typography>
            <Button color="secondary" onClick={() => this.props.leaveGameCallback()}><Link to="/">Leave</Link></Button>
        </Box>)
    }
} 