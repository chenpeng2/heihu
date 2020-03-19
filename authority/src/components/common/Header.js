import React, { PureComponent } from 'react'
import {Link} from 'react-router-dom';
import { logOut } from 'util/userApi'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreators'
import { getloginState } from 'redux/selectors/loginSelector'
import { Popover, Modal, Menu } from 'antd'
import Setting from './setting'
import Mock from 'mockjs'
const menus = [
    {
        title: '用户管理',
        key: '/userManage',
        // subs: [
        //     {key: '/userManage', title: '用户'},
        //     {key: '/userGroupManage', title: '用户组'},
        // ]
    },
    {
        title: '角色管理',
        key: '/roleManage'
    },
    {
        title: '权限管理',
        key: '/authority'
    }
]
class Header extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            modalShow: false,  // 设置弹窗控制
        }
    }

    handleSubmit() { // 提交设置

    }

    modalControl(bool) {  // 控制设置弹窗
        this.setState({ modalShow: bool })
    }

    renderProfilePopUp() { // 用户信息popover内容
        const { userInfo } = this.props;
        const name = userInfo.user && userInfo.user.name
        const avator = Mock.Random.dataImage('30x30', name && name.slice(0,1).toUpperCase())
        return (
            <div className="setting-popup">
                <div className="popup-content">
                    <div className="top">
                        <img className="avatar" alt="avatar" src={avator} />
                        <div className="avatar-info">
                            <div className="user-info">{name}</div>
                            <button type="button" className="logout-button" onClick={ logOut }>退出登录</button>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="setting" onClick={ () => { this.modalControl(true) } }><i className="sap-icon icon-action-settings"></i><span>设置</span></div>
                    </div>
                </div>
            </div>
        )
    }
    componentWillMount(){
        // notification.config({
        //     placement: 'bottomRight',
        //     bottom: 50,
        //     duration: 6,
        // });
    }

    renderSubMenu = ({key, title, subs}) => {
        return (
            <Menu.SubMenu key={key} title={<span>{title}<i className="icon-iconmoon icon-arrow_drop_down-24px"></i></span>}>
                {
                    subs && subs.map(item => {
                        return this.renderMenuItem(item,1)
                    })
                }
            </Menu.SubMenu>
        )
    }
    renderMenuItem = (item, num) => {
        const {key, title} = item;
        return (
            <Menu.Item key={key}  style={num == 0 ? {textAlign:'center'} : {width:'100%',textAlign:'center',height:34,lineHeight:'34px'}}>
                <Link to={key}>
                    <span>{title}</span>
                    <div className="bottom"></div>
                </Link>
            </Menu.Item>
        )
    }
    render() {
        const hash = window.location.hash.slice(1);
        const { userInfo, cleanComponent, header, headerMenu } = this.props;
        const name = userInfo.user && userInfo.user.name
        const avator = Mock.Random.dataImage('30x30', name && name.slice(0,1).toUpperCase())
        return (
            <header>
                <div className="top">
                    <div className="profile-content">

                    </div>
                    <span className="top-title ms-Grid-col"><i className="icon-iconmoon icon-build-24px"></i>{cleanComponent?header:'系统配置'}</span>
                    <div className="profile-content">
                        <img
                            className="avatar"
                            alt=""
                            src={avator} style={{verticalAlign:'middle'}}/>
                        {!this.state.modalShow && <Popover
                            content={ this.renderProfilePopUp() }
                            placement="bottomRight"
                            title=""
                            trigger="click"
                        >
                            <i className="icon-iconmoon icon-arrow_drop_down-24px cursor"  style={{verticalAlign:'middle'}}></i>
                        </Popover>}
                        <Modal
                            className="setting-modal"
                            title="设置"
                            width={620}
                            style={{ top: '100px'}}
                            visible={ this.state.modalShow }
                            cancelText='取消'
                            okText='保存'
                            onOk={ (e) => { this.handleSubmit() } }
                            onCancel={ (e) => { this.modalControl(false) } }
                        > <Setting userInfo={ userInfo } /> </Modal>
                    </div>
                </div>
                {headerMenu?
                    <div className="all-menus">
                        <Menu
                                defaultSelectedKeys={[`/token`]}
                                mode="horizontal"
                                className="header-navbar"
                            >
                                {
                                    headerMenu.map(item => {
                                        return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item,0)
                                    })
                                }
                        </Menu>
                    </div>
                    :
                    <div className="all-menus">
                        {window.location.hash=='#/'?
                            <Menu
                                    defaultSelectedKeys={[`${window.location.hash.slice(1)}`]}
                                    mode="horizontal"
                                    className="header-navbar"
                                >
                                    {
                                        menus.map(item => {
                                            return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item,0)
                                        })
                                    }
                            </Menu>
                            :
                            <Menu
                                    defaultSelectedKeys={[`${window.location.hash.slice(1)}`]}
                                    mode="horizontal"
                                    className="header-navbar"
                                >
                                    {
                                        menus.map(item => {
                                            return item.subs && item.subs.length > 0 ? this.renderSubMenu(item) : this.renderMenuItem(item,0)
                                        })
                                    }
                            </Menu>
                        }
                    </div>
                }
            </header>
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
)(Header)