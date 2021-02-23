import React, { Component } from "react";
import {Typography, Box} from "@material-ui/core";

export default class WaitingRoom extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
        let waitURL = "ws://" + window.location.host + "/ws/wait/" + this.props.code + "/";
        this.waitSocket = new WebSocket(waitURL);
        this.waitSocket.onmessage = (e) => {
            console.log("stop wait")
            console.log(e);
            let data = JSON.parse(e.data);
            if(data.signal && data.signal == "start-game"){
                this.props.history.push(`/game/${this.props.code}`);
            }
            this.waitSocket.close();
        }
        this.waitSocket.onclose = (e) => {
            console.log("Start game.");
        }
    }

    render(){
        return (<Box marginTop={"20%"} margin="auto" align="center"><Typography variant="h3">Waiting for other player ...</Typography></Box>)
    }
}