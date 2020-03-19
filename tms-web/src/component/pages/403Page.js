import React from "react"
import Header from 'component/common/Header'
import { logOut } from '../../utils/userApi'
class ErrorPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() { 
        return (
        <div>
            <Header />
            <div className="main-panel-light"> 没有权限访问该页面！你可以登陆其他账号查看</div>
            <button type="border" className="logout-button" style={{ 
                backgroundColor: '#ffffff', height: '40px', marginLeft: '40px'}} onClick={logOut}>退出登录</button>
        </div>)
    }
}
  
export default ErrorPage;