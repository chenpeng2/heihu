import React from 'react'
import {Link} from 'react-router-dom';
import {Menu} from 'antd';
import * as loginActions from 'redux/actions/loginActionCreators'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { getloginState } from 'redux/selectors/loginSelector'
const menus = [
    {
        title: '设备管理',
        key: '/device',
    },
    {
        title: '产品管理',
        key: '/product',
    },
    {
        title: '报警策略',
        key: '/standard',
    },
    {
        title: '异常分析',
        key: '/abnormalStatistics',
        subs: [
            // {key: '/abnormalStatistics/index', title: '异常分析'},
            {key: '/abnormalStatistics/abnormalList', title: '异常列表'},
            // {key: '/abnormalStatistics/deviceParams', title: '设备参数分析'},
            {key: '/abnormalStatistics/reason', title: '异常原因'},
            {key: '/abnormalStatistics/alertLog', title: '告警记录'},
        ]
    },
    {
        title: '通知管理',
        key: '/equipmentMonitoring',
    },
    // {
    //     title: '异常事件',
    //     key: '/abnormalStatistics/realTimeMonitoring',
    // }
]

class CustomMenu extends React.Component {
    renderSubMenu = ({key, title, subs},hasMaster) => {
        return (
            <Menu.SubMenu key={key} title={<span>{title}</span>}>
                {
                    subs && subs.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item,hasMaster)
                    })
                }
            </Menu.SubMenu>
        )
    }
    renderMenuItem = (item,hasMaster) => {
        const {key, title} = item;
        if((item.key == '/equipmentMonitoring') && hasMaster && hasMaster.length === 0){
            return null
        }
        return (
            <Menu.Item key={key}  style={{textAlign:'center'}}>
                <Link to={key}>
                    <span>{title}</span>
                </Link>
            </Menu.Item>
        )
    }
    render() {
        const hash = window.location.hash.slice(2);
        const { userInfo } = this.props
        let authorities = userInfo.user && userInfo.user.authorities
        const hasMaster = authorities && authorities.filter((item,index)=>{
            return item.authority==='master' || item.authority ==='system'
        })
        return (
                <Menu
                defaultSelectedKeys={[`${hash ? window.location.hash.slice(1) : '/device'}`]}
                mode="horizontal"
                className="header-navbar"
            >
                {
                    menus.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item,hasMaster) : this.renderMenuItem(item,hasMaster)
                    })
                }
            </Menu>
        )
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
)(CustomMenu)