import React, { PureComponent } from 'react';
import 'static/style/app.less'
import 'static/style/landing.css'

import Header from 'components/common/Header'
import CustomMenu from "components/common/Menu"
import ContentMain from 'components/common/contentMain'

import * as loginActions from 'redux/actions/loginActionCreators'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { getloginState } from 'redux/selectors/loginSelector'
import { getToken, isLogin, login, getQueryString } from 'util/userApi'

import { Spin, Icon } from 'antd';

//路由
import { BrowserRouter } from 'react-router-dom'

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: ''
    }
  }

  getTitle() {
    const hash = window.location.hash.split('/');
    switch (hash[1]) {
        case 'device':
            return '管理设备'
            break
        case 'product':
            return '管理产品'
            break
        case 'standard':
            return '管理参数标准'
            break
        case 'abnormalStatistics':
          return '设备参数分析'
          break
        default:return 'CHINAUST'; break;
    }
  }

  changeTitle(){
    const title = this.getTitle();
    this.setState({ title })
  }

  componentDidMount() {
    if (!isLogin()) {
        getToken()
    } else {
        this.props.getUserInfo().then(res => {
            if (res && res.code && res.code !== 0) {
                alert(res.msg)
            }
            if (res && res.code === -2) { //登录过期
                localStorage.removeItem('access_token')
                localStorage.removeItem('code')
                getToken()
            }
        })
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
        <Header title={this.state.title}/>
        <BrowserRouter>
          <CustomMenu userRole={role} />
          <div className="App-contentMain">
              <ContentMain />
          </div>
        </BrowserRouter>
      </div>
       :
       code ?
           <div className="page-loading-content">
               <Spin indicator={antIcon} />
           </div>
           : <div className="main-wrapper">
               <main className="ulp-outer">
                   <section className="ulp-box">
                       <div className="ulp-box-inner">
                           <div className="ulp-main">
                               <div className="ulp-header">
                                   <img id="prompt-logo-center" src="https://mi.blacklake.cn/resource/logo_without_brand.png" alt="欢迎" />
                                   <h1>黑湖智造 MI</h1>
                                   <p className="text-simple">CHINAUST</p>
                               </div>
                               <div className="ulp-container">
                                   <input type="hidden" name="state" value="g6Fo2SBFSHk5aHN4MmRrTE5pOFg1RnNhNEUzeG0zS0gxQ0l5aaN0aWTZIGVKWHVOQmlpX3NNel8xWWYybWtMcjcyY084T05TOUdro2NpZNkgMk4wTlg1azllb21YWUZEY25FWG5iMlg3cWx1bzJ2UDE" />
                                   <div className="button-bar">
                                       <button type="submit" name="action" value="default" className="ulp-button ulp-button-default" onClick={ login }>登录</button>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </section>
               </main>
           </div>
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
