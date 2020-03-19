import React from 'react'
import './App.less'
import 'styles/landing.css'
//redux
//redux
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreators'
//路由
import { HashRouter } from 'react-router-dom'
//布局组件
import CustomMenu from "component/menu/index"
import ContentMain from 'component/contentMain/index'
import Header from 'component/common/Header'
import { getToken, isLogin, login, getQueryString } from '../utils/userApi'
//selector
import { getloginState } from 'redux/selectors/loginSelector'
import CircularProgress from '@material-ui/core/CircularProgress'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: ''
    }
  }

  getTitle = () => {
    let title = ''
    switch (window.location.hash) {
      case '#/outControl':
        return title = '部门工作实时看板-出货部'
      case '#/splitControl':
        return title = '部门工作实时看板-分货部'
      case '#/GMControl':
        return title = '部门工作实时看板-GM'
      case '#/SSTKOverview':
          return title = '部门工作实时看板-稳定库存'
      default:
        return title
    }
  }

  changeTitle = () => {
    const title = this.getTitle()
    this.setState({
      title,
    })
  }

  componentWillMount() {
    if (!isLogin()) {
      getToken()
      // .then(() => { //加上登录后redirect后可以去掉
      //   this.props.getUserInfo()
      // })
    } else {
      this.props.getUserInfo().then(res => {
        if (res && res.code && res.code !== 0) {
          alert(res.msg)
        }
        if (res && res.code === -2) { //登录过期
          localStorage.removeItem('access_token')
          localStorage.removeItem('code')
          window.location = '/'
          getToken()
        }
      })
    }
    this.changeTitle()
    window.addEventListener('hashchange', () => {
      this.changeTitle()
    })
  }

  login () {
    login()
  }

  render() {
    const role = this.props.userInfo && this.props.userInfo.role
    const code = getQueryString(window.location.search, 'code')
    return (
      isLogin() ?  
      <div className="App" >
        <Header title={this.state.title} />
        <HashRouter>
          <CustomMenu userRole={role} />
          <div className="App-contentMain">
            <ContentMain changeTitle={this.changeTitle} />
          </div>
        </HashRouter>
      </div> : 
      code ?
        <div className="page-loading-content"> 
          <CircularProgress /> 
        </div> 
        : <div className="main-wrapper">
                <main className="ulp-outer">
                    <section className="ulp-box">
                        <div className="ulp-box-inner">
                            <div className="ulp-main">
                                <div className="ulp-header">
                                    <img id="prompt-logo-center" src="https://mi.blacklake.cn/resource/logo_without_brand.png" alt="欢迎" />
                                    <h1>黑湖智造 MI</h1>
                                    {/* <p className="text-simple">沃尔玛（中国）仓储物流应用</p> */}
                                </div>
                                <div className="ulp-container">
                                        <input type="hidden" name="state" value="g6Fo2SBFSHk5aHN4MmRrTE5pOFg1RnNhNEUzeG0zS0gxQ0l5aaN0aWTZIGVKWHVOQmlpX3NNel8xWWYybWtMcjcyY084T05TOUdro2NpZNkgMk4wTlg1azllb21YWUZEY25FWG5iMlg3cWx1bzJ2UDE" />
                                        <div className="button-bar">
                                            <button type="submit" name="action" value="default" className="ulp-button ulp-button-default" onClick={this.login}>登录 / 注册</button>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>     
            </div> 
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
)(App)
