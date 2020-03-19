
import React from 'react'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreator'
import { logOut, getUserInfo } from '../../utils/userApi'
import Mock from 'mockjs'

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      showProfilePopup: false,
      userInfo: {},
    }
  }

  componentDidMount() {
    this.setUserInfo()
  }

  isJsonString(str) {
    try {
      if (typeof JSON.parse(str) == "object") {
        return true
      }
    } catch (e) {
    }
    return false
  }

    setUserInfo = () => {
      const userInfo = getUserInfo() || {}
      userInfo.avatar = userInfo.username && this.setUserAvatar(userInfo.username)
      if (userInfo.additionalInfo && this.isJsonString(userInfo.additionalInfo)) {
        userInfo.additionalInfo = JSON.parse(userInfo.additionalInfo)
      }
      this.setState({
        userInfo,
      })
    }

    setUserAvatar = (username) => {
      let r = username.slice(0, 1).charCodeAt().toString(16)
      let g = username.slice(1, 2).charCodeAt().toString(16)
      let b = username.slice(2, 3).charCodeAt().toString(16)
      let color = `#${r}${g}${b}`;
      const avatar = Mock.Random.image('74x74', color, '#FFF', 'png', username && username.slice(0, 1).toUpperCase())
      return avatar
    }

    _getTitle(pathName) {
      switch (pathName) {
        case '#/masterData':
          return `Program Master Data`
        case '#/qcData':
          return `QC交检数据填报`
        case '#/delayData':
          return `生产延期信息维护`
        case '#/regionData':
          return `Region 信息维护`
        case '#/projectManagerData':
          return `Project Manager信息维护`
        case '#/projectTypeData':
          return `Project Type信息维护`
        case '#/factoryData':
          return `工厂信息维护`
        case '#/SNReport':
          return `Daily Production Report-SinNung`
        case '#/WeeboReport':
          return `Daily Production Report-Weebo`
        case '#/productionSchedule':
          return 'Production Schedule 主界面'
        case '#/productionSchedule/addData':
          return 'Production Schedule 添加数据'
        default:
          break
      }
    }


    toggleProfilePopup = () => {
      const { showProfilePopup } = this.state
      this.setState({
        showProfilePopup: !showProfilePopup,
      })
    }

    renderProfilePopUp() {
      const { showProfilePopup, userInfo } = this.state
      return (
        showProfilePopup &&
        <div className="setting-popup">
          <div className="popup-content">
            <div className="top">
              <img className="avatar" alt="avatar" src={userInfo.avatar} />
              <div className="avatar-info">
                <div className="user-info">{userInfo.username || 'name'}({userInfo.additionalInfo && userInfo.additionalInfo.deptName})</div>
                <button type="border" className="logout-button" onClick={logOut}>退出登录</button>
              </div>
            </div>
            <div className="bottom">
              <div className="user-info"><i className="sap-icon icon-email"></i>{userInfo.email}</div>
              <div className="user-info"><i className="sap-icon icon-factory"></i>{userInfo.additionalInfo && userInfo.additionalInfo.orgName}</div>
            </div>
          </div>
        </div>
      )
    }

    nameToColor = (name) => {
      let colorValue1 = name.slice(0, 1).charCodeAt().toString(16)
      let colorValue2 = name.slice(1, 2).charCodeAt().toString(16)
      let colorValue3 = name.slice(1, 2).charCodeAt().toString(16)
      let color = `${colorValue1}${colorValue2}${colorValue3}`
      return color;
    }

    render() {
      const { userInfo } = this.state
      return (
        <header>
          {this.renderProfilePopUp()}
          <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">
            <img alt="logo" className="logo" src={require('../../asstes/images/Logo.png')} />
          </div>
          <span className="top-title ms-Grid-col ms-sm6 ms-md6 ms-lg8">{this._getTitle(window.location.hash)}</span>
          <div className="profile-content">
            <img
              className="avatar"
              alt="avatar"
              onClick={this.toggleProfilePopup}
              src={userInfo.avatar} />
          </div>
        </header>
      )
    }
  }

  const mapStateToProps = (state) => {
    return {
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
  }

  export default connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Header)


