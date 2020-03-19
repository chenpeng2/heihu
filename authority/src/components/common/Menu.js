import React from 'react'
import { withRouter } from 'react-router';
import {connect} from 'react-redux'
import * as loginActions from '../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState } from '../../redux/selectors/loginSelector'
const logoImg = require('static/img/Logo.png')
const menus = [
    // {
    //     title: '实时监控',
    //     key: '/timeMonitor',
    //     icon:'icon-assessment-24px'
    // },
    {
        title: '系统配置',
        key: '/userManage',
        icon:'icon-build-24px'
    },
    {
        title: 'token安全设置',
        key: '/token',
        icon:'icon-securitytoken-24px'
    }
]

class CustomMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            menuKey:0
        }
    }
    tabMenu = (item,index)=> {
        this.setState({menuKey:index},()=>window.location.hash=item.key)
    }
    renderMenuItem = (item, index) => {
        const {title} = item;
        const pathname = window.location.hash
        const isPath = ['#/userManage','#/roleManage','#/authority'].indexOf(pathname) > -1 && index===0
        return (
            <li onClick={()=>this.tabMenu(item,index)} key={index} className={pathname.indexOf(item.key) > -1 || isPath?'menu-li active animated slideInLeft':'menu-li no-active'}>
                <i className={'icon-iconmoon '+item.icon}></i>
                <p>{title}</p>
            </li>
        )
    }
    render() {
        const moduleRoute =['#/userManage','#/roleManage','#/authority','#/token']
        const pathname = window.location.hash
        const IndexO = moduleRoute.indexOf(pathname)>-1
        return (
            IndexO &&
            <div className="menus">
                <div>
                    <img alt="logo" title="黑湖欢迎你！" height={32} className="logo" style={{ verticalAlign: 'middle' }} src={logoImg} />
                </div>
                <ul>
                {
                    menus.map((item,index) => {
                        const {user} = this.props.userInfo
                        if(user && (index==menus.length-1) && user.organization!=='0'){
                            return  null
                        }
                        return  this.renderMenuItem(item,index)
                    })
                }
                </ul>
            </div>
        )
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
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CustomMenu))
