import React, { PureComponent } from 'react'

class Header extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            showProfilePopup: false
        }
    }

    renderProfilePopUp() {
        const userInfo = {}
        const { showProfilePopup } = this.state
        return (
            showProfilePopup &&
            <div className="setting-popup">
                <div className="popup-content">
                    <div className="top">
                        <img className="avatar" alt="avatar" src={userInfo.userAvatar} />
                        <div className="avatar-info">
                            <div className="user-info">{userInfo.userName || 'name'}({userInfo.deptName})</div>
                            <button type="border" className="logout-button">退出登录</button>
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

    toggleProfilePopup = () => {
        const { showProfilePopup } = this.state
        this.setState({
            showProfilePopup: !showProfilePopup,
        })
    }


    render() {
        const userInfo = {}
        const { title } = this.props
        return (
            <header onClick={ (e) => this.toggleProfilePopup() }>
                { this.renderProfilePopUp() }
                <div className="ms-Grid-col">
                    <img alt="logo" className="logo" src={require('../../static/img/Logo.png')} />
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

export default Header