import React, { PureComponent } from 'react';
import CustomMenu from "./components/common/Menu"
import ContentMain from './components/common/contentMain'
import {connect} from 'react-redux'
import * as loginActions from './redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState } from './redux/selectors/loginSelector'
import { isLogin, projectUrl } from 'util/userApi'
import { ConfigProvider, Modal } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Login from 'pages/Login/index'
//路由
import { HashRouter } from 'react-router-dom'

class App extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    componentDidMount() {
        if (!isLogin()) {
            this.props.history.push(projectUrl)
        }else{
            this.props.getUserInfo()
        }
        // let initCount=0
        // setInterval(()=>{
        //     initCount++;
        //     if(initCount===120){
        //         if(isLogin()){
        //             window.location.hash='restTime'
        //         }
        //     }
        // },1000)
        // document.onmousemove=function () {
        //     initCount=0
        // };//窗口加载
    }
    render() {
        const role = this.props.userInfo && this.props.userInfo.role;
        return (
            isLogin() ?
                <div className="App">
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
//映射Redux actions到组件的属性
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
}
//连接组件
export default connect(mapStateToProps, mapDispatchToProps)(App)
