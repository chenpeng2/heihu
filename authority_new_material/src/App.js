import React, { PureComponent } from 'react';
import './static/style/index.less'
import './static/style/material.less'
import CustomMenu from "./components/common/Menu"
import ContentMain from './components/common/contentMain'

import * as loginActions from './redux/actions/loginActionCreators'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { getloginState } from './redux/selectors/loginSelector'
import { getToken, isLogin, login, getQueryString } from './util/userApi'

import { Spin, Icon, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Login from './pages/Login/index'
//路由
import { HashRouter } from 'react-router-dom'
class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: ''
    }
  }

  getTitle() {
    const hash = window.location.pathname.split('/');
    switch (hash[1]) {
        case 'device':
            return '管理设备'
        case 'product':
            return '管理产品'
        case 'standard':
            return '管理参数标准'
        case 'abnormalStatistics':
          return '设备参数分析'
        default:return '权限管理系统';
    }
  }

  changeTitle(){
    const title = this.getTitle();
    this.setState({ title })
  }

  componentDidMount() {
    if (!isLogin()) {
        // getToken()
        this.props.history.push('/login')
    }else{
        this.props.getUserInfo()
    }
    this.changeTitle()
    window.addEventListener('hashchange', () => {
        this.changeTitle()
    })
  }

  render() {
    const role = this.props.userInfo && this.props.userInfo.role;
    const code = getQueryString(window.location.search, 'code');
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    return (
      isLogin() ?
      <div className="App">
        {/*<Header title={this.state.title}/>*/}
        <HashRouter>
          <div className="App-contentMain">
              <CustomMenu userRole={role} />
              <ConfigProvider locale={zhCN}>
                  <ContentMain />
              </ConfigProvider>
          </div>
        </HashRouter>
      </div>
       :
       code ?
           <div className="page-loading-content">
               <Spin indicator={antIcon} />
           </div>
           : <Login/>
    );
  }
}
const mapStateToProps = (state) => {
  const userInfo = getloginState(state)
  return {
      userInfo
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(loginActions, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
