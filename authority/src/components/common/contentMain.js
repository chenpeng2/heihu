import React from 'react'
//引入路由
import {Route, Switch, Redirect} from 'react-router-dom'
import User from 'pages/authority/user/index'
import Role from 'pages/authority/role/index'
import Authority from 'pages/authority/authority/index'
import Token from 'pages/token/index'
// import RestTime from 'pages/restTime'
import C404 from 'pages/404'
import C500 from 'pages/500'
import '@src/static/style/index.less' //公共样式
class ContentMain extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        return (
            <div className="container">
                <Switch>
                    <Route path="/userManage" component={User} />
                    {/*<Route path="/userGroupManage" component={User} />*/}
                    <Route path="/roleManage" component={Role} />
                    <Route path="/authority" component={Authority} />
                    <Route path="/token" component={Token} />
                    {/* <Route path="/restTime" component={RestTime} /> */}
                    <Route path="/404" component={C404} />
                    <Route path="/500" component={C500} />
                    {
                        window.location.hash.slice(2)
                        ?<Redirect path="/*" to="/404" />:<Redirect path="/" to="/userManage" />
                    }
                </Switch>
            </div>
        )
    }
}

export default ContentMain