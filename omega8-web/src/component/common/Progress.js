import React, { Component } from 'react';
import PropTypes from 'prop-types';
export default class Progress extends Component {
    static contextTypes = {
        percentageNum: PropTypes.number,
        allNum: PropTypes.number,
        progressName: PropTypes.string,
        height: PropTypes.string,
        color: PropTypes.string,
    }

    render() {
        const { height, color } = this.props
        let percentageNum = parseInt(this.props.percentageNum * 100);
        //这个支持css样式响应式的
        let leftPercentage = this.props.percentageNum > 1 ? 0 : (1 - this.props.percentageNum) * (-100);
        let bgColor = ''
        if (percentageNum > 50 && percentageNum <= 80) {
            bgColor ='#E9730C'
        } else if (percentageNum <= 50){
            bgColor = '#107E3E'
        } else {
            bgColor = '#BB0000'
        }
        let div1 = {
            width: "100%",
            height: height || "6px",
            background: "#E5EAEE",
            position: "relative",
            // margin: "22px auto 0",
            overflow: "hidden",
            marginRight: '5px'
        };
        let div2 = {
            //不支持样式响应式,可以写死
            // width:"450px"
            //这个支持css样式响应式的
            width: "100%",
            height: height || "6px",
            // background: color || bgColor,
            backgroundImage: `linear-gradient(0deg, rgb(78,169,94) 0%,rgb(1,175,151) 100%)`,
            position: "absolute",
            //这个支持css样式响应式的
            left: `${leftPercentage}%`,
        }

        let content = {
            display: 'flex',
            alignItems: 'center',
            width: '100%'
        }
        return (
                this.props.percentageNum !== null && this.props.percentageNum !== undefined ? 
                <div style={content} className="progress-container">
                
                <div style={div1}>
                    <div style={div2}></div>
                </div>
                <span style={{ color: '#999' }}>{percentageNum}%</span>
            </div> : <span> — </span> 
        )
    }
}
