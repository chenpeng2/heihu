import React from 'react'
//引入路由
import {Route, Switch, Redirect} from 'react-router-dom'
import User from '../../pages/authority/user/index'
import Role from '../../pages/authority/role/index'
import Authority from '../../pages/authority/authority/index'
import '../../static/style/index.less' //公共样式
import Header from '../../components/common/Header'
class ContentMain extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: ''
        }
    }
    render() {
        return (
            <div className="container">
                <Header title={this.state.title}/>
                <Switch>
                    <Route path="/authority/userManage" component={User} />
                    <Route path="/authority/roleManage" component={Role} />
                    <Route path="/authority/authority" component={Authority} />
                    <Redirect path="/" to="/authority/userManage" />
                </Switch>
            </div>
        )
    }
}

export default ContentMain