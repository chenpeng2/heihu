import React, { PureComponent } from 'react'
import { connect } from "react-redux"
import { logOut } from 'util/userApi'
import { bindActionCreators } from "redux"
import * as loginActions from 'redux/actions/loginActionCreators'
import { getloginState } from 'redux/selectors/loginSelector'
import { Popover, Modal, Drawer, Tabs, notification, Icon } from 'antd'
import Setting from './setting'
import Mock from 'mockjs'
const { TabPane } = Tabs;
class Header extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            modalShow: false,  // 设置弹窗控制
            drawerShow: false  // 通知侧边栏控制
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
        const avator = Mock.Random.image('100x100', '#894FC4', '#FFF', 'png', name && name.slice(0,1).toUpperCase())
        return (
            <div className="setting-popup">
                <div className="popup-content">
                    <div className="top">
                        <img className="avatar" alt="avatar" src={avator} />
                        <div className="avatar-info">
                            <div className="user-info">{name}</div>
                            <button type="border" className="logout-button" onClick={ logOut }>退出登录</button>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="setting" onClick={ () => { this.modalControl(true) } }><i className="sap-icon icon-action-settings"></i> 设置</div>
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
    openNotification = () => {
        notification.open({
            message: 'Notification Title',
            description:
                'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
            icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
        });
    };
    render() {
        const { title, userInfo } = this.props;
        const name = userInfo.user && userInfo.user.name
        const avator = Mock.Random.image('100x100', '#894FC4', '#FFF', 'png', name && name.slice(0,1).toUpperCase())
        return (
            <header>
                <div className="ms-Grid-col">
                    <img alt="logo" height={24} className="logo" style={{ verticalAlign: 'middle' }} src={require('../../static/img/Logo.png')} />
                    <span style={{ marginLeft: '16px' }}>{ title || ''}</span>
                </div>

                <span className="top-title ms-Grid-col"></span>
                
                <div className="profile-content">
                    {/* <i onClick={ () => { this.setState({ drawerShow: true }) } } className="sap-icon icon-bell"><span>12</span></i> */}
                    <img
                            className="avatar"
                            alt=""
                            src={avator} style={{verticalAlign:'middle'}}/>
                    <Popover ref="popup" content={ this.renderProfilePopUp() } placement="bottomRight" title="">
                        <img src={require('../../static/img/Arrow_drop_down-24px.svg')} style={{verticalAlign:'middle',padding:'8px',cursor:'pointer'}}/>
                    </Popover>
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
                    <Drawer
                        className="drawer"
                        width={420}
                        style={{marginTop:44}}
                        mask={false}
                        title=""
                        placement="right"
                        closable={false}
                        onClose={ () => { this.setState({ drawerShow: false }) } }
                        visible={this.state.drawerShow}
                        >
                        <Tabs defaultActiveKey="1" onChange={()=>console.log(1)}>
                            <TabPane tab="按时间" key="1">
                                Content of Tab Pane 1
                            </TabPane>
                            <TabPane tab="按优先级" key="2">
                                Content of Tab Pane 2
                            </TabPane>
                            <TabPane tab="按设备" key="3">
                                Content of Tab Pane 3
                            </TabPane>
                        </Tabs>
                    </Drawer>
                </div>
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