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
import { isLogin } from 'util/userApi'

import { Form, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';

//路由
import { HashRouter } from 'react-router-dom'
import Login from 'pages/login'
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
        default:return 'CHINAUST';
    }
  }

  changeTitle(){
    const title = this.getTitle();
    this.setState({ title })
  }
  componentDidMount() {
    window.addEventListener("popstate", function(e) { 
        var deldom=document.getElementById('token-modal998');
        var deldom2=document.getElementById('token-modal999');
        (deldom || deldom2) && document.body.removeChild(deldom || deldom2)
        // alert("我监听到了浏览器的返回按钮事件啦");//根据自己的需求实现自己的功能 
    }, false);
    if (!isLogin()) {
        // this.props.history.push('/chinaust')
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
    // const code = getQueryString(window.location.search, 'code');
    // const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    return (
        isLogin() ?
            <div className="App">
                <Header title={this.state.title}/>
                <HashRouter>
                    <CustomMenu userRole={role} />
                    <div className="App-contentMain">
                        <ConfigProvider locale={zhCN}>
                            <ContentMain />
                        </ConfigProvider>
                    </div>
                </HashRouter>
            </div>
            :
            <Login/>
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
const WrappedTimeRelatedForm = Form.create({ name: 'time_related_controls' })(App);
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedTimeRelatedForm)
