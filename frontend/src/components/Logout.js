import React, { Component } from "react";
import { Grid, Button } from "@material-ui/core"; 
import { getCookie } from "../helper";
import { Redirect } from "react-router-dom";

export default class Logout extends Component {
    constructor(props){
        super(props);
    }

    onLogout(){
        const csrftoken = getCookie("csrftoken");
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json", "X-CSRFToken": csrftoken},
        };
        fetch("/rest-auth/logout/", requestOptions).then((res) => res.json()).then((data) => {
            console.log(data);
            this.props.onLogout();
            this.props.history.push("/login");
        });
    }

    render(){
        return (<Button color="inherit" className={this.props.className} onClick={() => this.onLogout()}>Logout</Button>)
    }
}