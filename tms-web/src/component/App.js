import React from 'react'
import './App.less'
import 'styles/common/landing.css'

//redux
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreator'
//路由
import { HashRouter } from 'react-router-dom'
//布局组件
import CustomMenu from "component/menu/index"
import ContentMain from 'component/contentMain/index'
import { Layout } from 'antd'
import CircularProgress from '@material-ui/core/CircularProgress'
import Login from 'component/pages/login/index'
//selector
import { getRouteState } from 'redux/selectors/routeSelector'
import { getloginState } from 'redux/selectors/loginSelector'
import { isLogin, getUserInfo } from '../utils/userApi'

const {
  Content,
} = Layout

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: ''
    }
  }

  componentDidMount() {
    if (!isLogin()) {
      return
    } else {
      this.setState({
        userInfo: getUserInfo(),
      })
      this.props.getUserInfo()
    }
  }

  render() {
    const { userInfo } = this.props
    return (
      isLogin() ?
        <div className="App" >
          {
            <HashRouter >
              <Layout>
                
                <Layout>
                  {userInfo.userRole ?
                  <>
                  <CustomMenu userInfo={userInfo} />
                  <Content className="App-contentMain">
                    <ContentMain userInfo={userInfo} />
                  </Content>
                  </> :
                  <div className="page-loading-content">
                    <CircularProgress />
                  </div>
                 }
                </Layout>
              </Layout>
            </HashRouter>
          }
        </div>
         :
        <Login />

    )
  }
}

const mapStateToProps = (state) => {
  const routeInfo = getRouteState(state)
  const userInfo = getloginState(state)
  return {
    routeInfo,
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