import React from 'react'
import { connect } from "react-redux"
import { logOut } from '../../utils/userApi'
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreators'
import { getloginState } from 'redux/selectors/loginSelector'
import $ from 'jquery'
class Header extends React.Component{
    constructor (props) {
        super(props)
        this.state = {
            title: ''
        }
    }
    componentDidMount(){
        const _this =this;
        const { showProfilePopup } = this.state
        document.onclick= function(e){
            var e = e || window.event; //浏览器兼容性
            var elem = e.target || e.srcElement;
            if ($(elem).parents('.setting-popup').length == 1 || e.target.className == 'avatar') {
                return
            }else{
                _this.setState({showProfilePopup:false})
            }
        }
    }
    renderProfilePopUp() {
        const { userInfo } = this.props
        const { showProfilePopup } = this.state
        return (
            showProfilePopup &&
            <div className="setting-popup">
                <div className="popup-content">
                    <div className="top">
                        <img className="avatar" alt="avatar" src={userInfo.userAvatar} />
                        <div className="avatar-info">
                            <div className="user-info">{userInfo.userName || 'name'}({userInfo.deptName})</div>
                            <button type="border" className="logout-button" onClick={logOut}>退出登录</button>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="user-info"><i className="sap-icon icon-email"></i>{userInfo.userEmail}</div>
                        <div className="user-info"><i className="sap-icon icon-factory"></i>{userInfo.orgName}</div>
                    </div>
                </div>
            </div>
        )
    }

    toggleProfilePopup = (e) => {
        const { showProfilePopup } = this.state
        this.setState({
            showProfilePopup: !showProfilePopup,
        })
    }
    render() {
        const { userInfo, title } = this.props
        return (
            <header>
                {this.renderProfilePopUp()}
                <div className="ms-Grid-col">
                    <img alt="logo" className="logo" src={require('../../asstes/images/Logo.png')} />
                </div>
                <span className="top-title ms-Grid-col">{title || 'dicastal'}</span>
                <div className="profile-content">
                    <img
                        className="avatar"
                        alt="avatar"
                        onClick={this.toggleProfilePopup}
                        src={userInfo.userAvatar || ''} />
                </div>
            </header>
        )
    }
}

const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
        userInfo,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Header)