import React from 'react'
import { connect } from "react-redux"
import { logOut } from '../../utils/userApi'
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreators'
import { getloginState } from 'redux/selectors/loginSelector'
class Header extends React.Component{
    constructor (props) {
      super(props)
      this.state = {
          title: ''
      }
    }



  _getTitle(pathName) {
    switch (pathName) {
      case '#/outControl':
        return '出货部实时监控'
      case '#/splitControl':
        return `分货部实时监控`
      case '#/qcData':
        return `QC交检数据填报`
      default:
        break
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

    toggleProfilePopup = () => {
      const { showProfilePopup } = this.state
      this.setState({
        showProfilePopup: !showProfilePopup,
      })
    }

    hideProfilePopup = () => {
      this.setState({
        showProfilePopup: false,
      })
    }
  
    render() {
      const { userInfo, title } = this.props
        return (
          <header onClick={this.toggleProfilePopup}>
          {this.renderProfilePopUp()}
          <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
            <img  alt="logo" height={24} className="logo" style={{ verticalAlign: 'middle' }} src={require('../../asstes/images/Logo.png')} />
          </div>
          <span className="top-title ms-Grid-col ms-sm6 ms-md6 ms-lg8">{title}</span>
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