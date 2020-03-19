import React, { PureComponent } from 'react';
import ImgUrl from '../static/img/404.png'
class C404 extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        const divStyle={
            height:'100%',
            position:'relation',
            backgroundColor:'#fff'
        }
        const imgSty = {
            maxWidth:'1000px',
            position:'absolute',
            left:'50%',
            top:'50%',
            margin:'-300px 0 0 -500px'

        }
        return (
            <div style={divStyle}>
                <img src={ImgUrl} alt="" style={imgSty}/>
            </div>
        );
    }
}

export default C404;
