import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class SwiperContainer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { donejob, door } = this.props
        return (
            <div className="swiper-container">
                <div className="top">
                    <span>20 min ago</span>
                </div>
                <div className="cnt">
                    <div>
                        <div className="strong">{ donejob }</div>
                        <span>已完成工作量/板</span>
                    </div>
                    <div>
                        <div className="strong">{ door }</div>
                        <span>即将满柜/柜</span>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatch = (dispatch) => {
    return {
      
    }
}

const mapState = (state) => {
    return {
        donejob: state.board.donejob
    }
}

  export default connect(mapState, mapDispatch)(SwiperContainer)