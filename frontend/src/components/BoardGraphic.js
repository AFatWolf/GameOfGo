import React, { Component } from "react";

export function GoPieceDef(props){
    return (<svg height="0" width="0" className={props.className}>
      <defs>
        <radialGradient
          id="blackPiece"
          cx="10%"
          cy="10%"
          r="70%"
          fx="20%"
          fy="20%"
        >
          <stop offset="0%" style={{ "stop-color": "#C0C0C0" }} />
          <stop offset="100%" style={{ "stop-color": "black" }} />
        </radialGradient>
        <radialGradient
          id="whitePiece"
          cx="70%"
          cy="70%"
          r="95%"
          fx="20%"
          fy="20%"
        >
          <stop offset="0%" style={{ "stop-color": "#FFFFFF" }} />
          <stop offset="100%" style={{ "stop-color": "#A9A9A9" }} />
        </radialGradient>
      </defs>
    </svg>);
}

export default class BoardBackground extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (<div>
            <GoPieceDef />
            <svg width={window.outerWidth} height={window.outerHeight} style={{ "background": "#FAAF5B", position: "fixed", left: "0px", top: "0px", "z-index": -1}}>
                
            </svg>
            <div style={{ "z-index": 1 }}>
            {this.props.children}
            </div>
        </div>)
    }
}