import React from 'react'
import {Link} from 'react-router-dom';
import {Menu, Icon} from 'antd';
// import Menu from 'antd/es/menu';
// import Icon from 'antd/es/icon';
// import 'antd/es/menu/style';
const menus = [
    {
        title: '主页',
        key: '/',
        disable: true,
    },  {
        title: '实时监控',
        key: '/control',
        selectable: true,
        subs:[
            {
                title: 'GM',
                key: '/GMControl',
            },{
                title: '分货部',
                key: '/splitControl',
            }, {
                title: '出货部',
                key: '/outControl',
            }, 
            {
                title: '稳定库存',
                key: '/SSTKOverview',
            }, 
        ]
    }, 
     {
        title: '历史报告',
        key: '/1',
        disable: true,
     },{
        title: '场景分析',
        key: '/2',
        disable: true,
    },  {
        title: '原始数据',
        key: '/3',
        disable: true,
    }
]

class CustomMenu extends React.Component {

    renderSubMenu = ({key, title, subs}) => {
        return (
            <Menu.SubMenu key={key} title={<span>{title}<Icon type="down" /></span>}>
                {
                    subs && subs.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item)
                    })
                }
            </Menu.SubMenu>
        )
    }
    renderMenuItem = ({key, title, disable, selectable}) => {
        return (
            <Menu.Item key={key} disabled={disable}>
                { disable ? <span>{title}</span> : 
                <Link to={key}>
                    <span>{title}</span>
                </Link>}
            </Menu.Item>
        )
    }
    render() {
        const selectMenuKey = window.location.hash.split('#')[1]
        return (
                <Menu
                defaultSelectedKeys={[selectMenuKey === '/' ? '/GMControl' : selectMenuKey]}
                mode="horizontal"
                className="header-navbar"
            >
                {
                    menus.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item)
                    })
                }
            </Menu>
        )
    }
}
export default CustomMenu
