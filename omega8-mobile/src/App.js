import React, { PureComponent } from 'react';

import { Views, App, Statusbar, View, Toolbar, Link, Button, LoginScreen, Page } from 'framework7-react';
import { bindActionCreators } from "redux"
import { connect } from 'react-redux'

import Landing from './pages/login/index'

import routes from './router/'

import { authLogin, getToken, isLogin, logOut } from './module/userApi'
import * as loginActions  from './redux/action/login'
const f7params = {
  root: '#root',
  theme: 'ios', 
  name: 'Walmart', 
  id: 'com.Walmart',
  routes: routes,
  view: {
    stackPages: true,
    // pushState: true
  }
}

class AppContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
       authrize: false,
       flag: false
    }
  }

  signIn() {
    authLogin()
  }

  componentDidMount() {
    getToken(() => {
      this.setState({ flag: true })
    }, () => {
      // this.setState({ flag: false })
    }, () => {
      if (isLogin()) {
        this.props.getUserInfo((res) => {
          if (res && res.code === -2) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('code');
            window.location.reload()
          }else {
            this.setState({ authrize : true })
          }
        })
      }else {
        this.setState({ authrize : false })
      }
    } );
  }

  render() {
    const { loginInfo } = this.props;
    return (
      <App params={ f7params }>
        <Statusbar></Statusbar>
        <Views tabs>
          <View
            url="/menu-home/"
            id="tab-view-1" main tab tabActive
          >
          </View>
          <View id="tab-view-2" tab>...</View>
          <View id="tab-view-3" tab>
            <div style={{ textAlign: 'center', height: '150px', paddingTop: '20px', background: '#445E75', color: '#fff' }}>
              <div style={ {width: '80px', height: '80px', margin: 'auto', overflow: 'hidden', borderRadius: '50%'} }>
                <img width="100%" src={ loginInfo.userAvatar } />
              </div>
              <p>{ loginInfo.userName }</p>
            </div>
            <Button style={{ width: '100px', display: 'block', margin: '20px auto' }} outline onClick={ logOut }>退出登录</Button>
          </View>
        </Views>
        <Toolbar tabbar position='bottom' className="tab-views">
          <Link tabLink="#tab-view-1" tabLinkActive>
            <i className="def-icon icon-home"></i>主页
          </Link>
          <Link tabLink="#tab-view-2">
            <i className="def-icon icon-note"></i>通知
          </Link>
          <Link tabLink="#tab-view-3">
            <i className="def-icon icon-user"></i>我
          </Link>
        </Toolbar>
        <LoginScreen className="demo-login-screen" opened={ !this.state.authrize } >
          <Page loginScreen>
            <Landing flag={this.state.flag} login={ this.signIn } />
          </Page>
        </LoginScreen>
      </App>
    )
  }
}
const mapDispatch = (dispatch) => {
  return bindActionCreators(loginActions, dispatch)
}

const mapState = (state) => {
  return {
    loginInfo: state.login.loginInfo
  }
}
export default connect(mapState, mapDispatch)(AppContainer)
