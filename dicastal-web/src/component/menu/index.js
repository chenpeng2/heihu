import React from 'react'
import {Link} from 'react-router-dom';
import {Menu} from 'antd';

const menus = [
    {
        title: '实时监控',
        key: '/timeMonitor',
        subs: [
            {key: '/hubScrapMonitor', title: '轮毂报废监控'},
            {key: '/hubDefectMonitor', title: '轮毂缺陷监控'},
        ]
    }, 
     {
        title: '数据报告',
        key: '/hubScrap',
         subs: [
             {key: '/hubScrap', title: '轮毂报废报告'},
             {key: '/hubDefect', title: '轮毂缺陷报告'},
         ]
     },{
        title: '分析工具',
        key: '/distributionAnalysis',
        subs: [
            {key: '/distributionAnalysis', title: '分布分析'},
            {key: '/paretoAnalysis', title: '帕累托分析'},
        ]
    },  {
        title: '原始数据',
        key: '/hubPicData',
        subs: [
            {key: '/hubPicData', title: '轮毂图片检测数据'},
            {key: '/hubResult', title: '轮毂检测结果'},
            {key: '/hubStandard', title: '轮毂检测标准'},
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
            <Menu.Item key={key}  style={num == 0 ? {textAlign:'center'} : {width:'100%',textAlign:'center'}}>
                <Link to={key}>
                    <span>{title}</span>
                </Link>
            </Menu.Item>
        )
    }
    render() {
        return (
                <Menu
                defaultSelectedKeys={[`${window.location.pathname}`]}
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