import React from 'react'
import {Link} from 'react-router-dom';
import {Menu, Icon} from 'antd';
import { getloginState } from 'redux/selectors/loginSelector'
//redux
import { connect } from "react-redux"

const menus = [
    {
        title: '历史报告',
        key: '#/historyReport', 
        menuRoles:['TMS-MASTER'],
        subs:[
            {
                title:'Daily Production Report',
                key: '/dailyReport', 
                menuRoles:['TMS-MASTER'],
            }, {
                title: 'Daily Production Report-Wai Hing',
                key:'/WHDailyReport',
                menuRoles:['20003'],
            }, {
                title: 'Daily Production Report-Hexon',
                key: '/HXDailyReport' , 
                menuRoles:['20005'],
            },{
                title: 'Production shedule',
                key: '/productionSchedulePreview', 
                menuRoles:['TMS-MASTER'],
            }
        ],
    },{   
        title: '数据填报',
        key: '/qcData', 
        menuRoles:['TMS-MASTER', 'TMS-QC', 'na'],
        subs: [
            {
                title: 'Program Master Data',
                key: '/masterData', 
                menuRoles:['TMS-MASTER'],
            },{
                title: 'Daily QC & Int‘N 数据填报',
                key: '/qcData', 
                menuRoles:['TMS-QC', 'na'],
            },{
                title: '工厂信息维护',
                key: '/factoryData', 
                menuRoles:['TMS-MASTER'],
            },{
                title: 'Region信息维护',
                key: '/regionData', 
                menuRoles:['TMS-MASTER'],
            },{
                title: 'Project Type信息维护',
                key: '/projectTypeData', 
                menuRoles:['TMS-MASTER'],
            },{
                title: 'Project Manager信息维护',
                key: '/projectManagerData', 
                menuRoles:['TMS-MASTER'],
            },{
                title: '生产延期信息维护',
                key: '/delayData', 
                menuRoles:['TMS-MASTER'],
            },{
                title: 'Production shedule',
                key: '/productionSchedule', 
                menuRoles:['TMS-QC'],
            }
        ]
    } 
]

class CustomMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userRole: ''
        }
    }

    renderSubMenu = ({key, title, subs, userRoles}) => {
        return (
            <Menu.SubMenu key={key} title={<span>{title}<Icon type="down"/></span>}>
                {
                    subs && subs.map(item => {
                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item)
                    })
                }
            </Menu.SubMenu>
        )
    }

    renderMenuItem = ({key, title, menuRoles}) => {
        const { userInfo } = this.props
        const { userRole, orgId } = userInfo
        return (
            menuRoles && (menuRoles.filter(item=>userRole.indexOf(item) !== -1).length || menuRoles.includes(orgId))&& 
            <Menu.Item key={key}>
                <Link to={key}>
                    <span>{title}</span>
                </Link>
            </Menu.Item>
        )
    }

    render() {
        const selectMenuKey = [window.location.hash.split('#')[1]]
        return (
                <Menu
                defaultSelectedKeys={selectMenuKey === '/' ? ['/qcData','/masterData' ] : selectMenuKey}
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

const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
      userInfo,
    }
  }
  
  const mapDispatchToProps = (dispatch) => {
    return {}
  }
  
export default connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CustomMenu)