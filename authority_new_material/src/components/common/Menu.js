import React from 'react'
import {Link} from 'react-router-dom';
import {Menu} from 'antd';
const menus = [
    {
        title: '实时监控',
        key: '/timeMonitor',
        icon:'icon-assessment-24px'
    },
    {
        title: '系统配置',
        key: '/systemConfiguration',
        icon:'icon-build-24px'
    }
]

class CustomMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            menuKey:0
        }
    }
    renderMenuItem = (item, index) => {
        const {title} = item;
        return (

            <li onClick={()=>this.setState({menuKey:index})} key={index} className={index === this.state.menuKey?'menu-li active':'menu-li no-active'}>
                <i className={'icon-iconmoon '+item.icon}></i>
                <p>{title}</p>
            </li>
        )
    }
    render() {
        return (
            <div className="menus">
                <div>
                    <img alt="logo" title="黑湖欢迎你！" height={32} className="logo" style={{ verticalAlign: 'middle' }} src={require('../../static/img/Logo.png')} />
                </div>
                <ul>
                {
                    menus.map((item,index) => {
                        return  this.renderMenuItem(item,index)
                    })
                }
                </ul>
            </div>
        )
    }
}
export default CustomMenu