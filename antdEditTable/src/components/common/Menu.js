import React from 'react'
import {Link} from 'react-router-dom';
import {Menu} from 'antd';
const menus = [
    {
        title: '基础数据',
        key: '/device',
        subs: [
            {key: '/device', title: '管理设备'},
            {key: '/product', title: '管理产品'},
            {key: '/standard', title: '管理参数标准'},
        ]
    },{
        title: '异常分析',
        key: '/abnormalStatistics',
        subs: [
            // {key: '/abnormalStatistics/index', title: '异常分析'},
            {key: '/abnormalStatistics/reason', title: '异常原因'},
            // {key: '/abnormalStatistics/deviceParams', title: '设备参数分析'},
            {key: '/equipmentMonitoring', title: '通知'},
        ]
    },{
        title: '实时监控',
        key: '/realTimeMonitoring',
        subs: [
            {key: '/abnormalStatistics/realTimeMonitoring', title: '设备参数分析'},
        ]
    }
]

class CustomMenu extends React.Component {

    renderSubMenu = ({key, title, subs}) => {
        return (
            <Menu.SubMenu key={key} title={<span>{title}</span>}>
                {
                    subs && subs.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item,1)
                    })
                }
            </Menu.SubMenu>
        )
    }
    renderMenuItem = (item, num) => {
        const {key, title} = item;
        return (
            <Menu.Item key={key}  style={num === 0 ? {textAlign:'center'} : {width:'100%',textAlign:'center'}}>
                <Link to={key}>
                    <span>{title}</span>
                </Link>
            </Menu.Item>
        )
    }
    render() {
        const hash = window.location.hash.slice(2);
        return (
                <Menu
                defaultSelectedKeys={[`${hash ? window.location.hash.slice(1) : '/deviceList'}`]}
                mode="horizontal"
                className="header-navbar"
            >
                {
                    menus.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item,0)
                    })
                }
            </Menu>
        )
    }
}
export default CustomMenu