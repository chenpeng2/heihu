import React, { PureComponent } from 'react';
import { Button, Form, Input, message } from 'antd';
import request from 'util/http'
import {connect} from 'react-redux'
import * as loginActions from '../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getOtherState } from '../../redux/selectors/loginSelector'
import {getCookie,delCookie,refresh} from 'util/userApi'
class addRole extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            // console.log('Received values of form: ', fieldsValue)
            this.handleToken(fieldsValue)
        });
    };
    handleToken = (fieldsValue)=> {
        const {OtherState} = this.props
        const {OpenStateData, OpenStateValue} = OtherState
        if(OpenStateValue == 1){
            this.addToken(OpenStateData, fieldsValue)
        }else{
            this.editToken(OpenStateData, fieldsValue)
        }
    }
    //新增token
    addToken = (OpenStateData, fieldsValue)=> {
        const initData = {
            clientId: "",
            resourceIds: null,
            clientSecret: "123456",
            scope: "",
            authorizedGrantTypes: "",
            webServerRedirectUri: "",
            authorities: "",
            accessTokenValidity: null,
            refreshTokenValidity: null,
            additionalInformation: null,
            autoapprove: null,
            tenantId: "",
            status: null,
            purpose: null,
            createTime: null,
            updateTime: null,
            createBy: null,
            updateBy: null
        }
        request({
            url: `/oauth/addOauthClientDetail`,
            method: 'POST',
            data:Object.assign(initData,fieldsValue),
            success: res => {
                message.success('添加成功！')
                this.props.refresh()
                this.hiddenForm()
            },
            error: (error) => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    //编辑token
    editToken = (OpenStateData, fieldsValue)=> {
        const refreshTokenValidity=fieldsValue.refreshTokenValidity
        OpenStateData.refreshTokenValidity=fieldsValue.refreshTokenValidity
        OpenStateData.accessTokenValidity=fieldsValue.accessTokenValidity
        request({
            url: `/oauth/updateOauthClientDetail`,
            method: 'POST',
            data:OpenStateData,
            success: res => {
                message.success('修改成功！')
                //重新请求列表数据
                this.props.refresh()
                this.hiddenForm()
            },
            error: (error) => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    hiddenForm = ()=> {
        this.setState({antBtnData:[]})
        this.props.cancelOpenState(null,null)
    }
    render() {
        const {width,height, OtherState} = this.props
        const W = width?width:540
        const H = height?height:320
        const { getFieldDecorator } = this.props.form;
        const {OpenState,OpenStateData,OpenStateValue} = OtherState
        const title = OpenStateValue===1?'token新增':'token编辑'
        return (
            <div className={OpenState?'define-modal-mask':''}>
                {OpenState && <div className="modal-wrap animated zoomIn">
                    <div className="modal-content" style={{width:width+'px',marginLeft:-W/2+'px',marginTop:-H/2+'px'}}>
                        <div className="title">{title}</div>
                        <div className="cont">
                            {OpenStateValue===1?
                                <Form onSubmit={this.handleSubmit}>
                                    <div className="dis-flex">
                                        <Form.Item label="客户">
                                            {getFieldDecorator('clientId', {
                                                rules: [{required: true, message: '请输入客户!'}],
                                                initialValue: OpenStateData ? OpenStateData.clientId : ''
                                            })(
                                                <Input placeholder="请输入客户"/>,
                                            )}
                                        </Form.Item>
                                        <Form.Item label="权限范围">
                                            {getFieldDecorator('scope', {
                                                rules: [{required: true, message: '请输入权限范围!'}],
                                                initialValue: OpenStateData ? OpenStateData.scope : ''
                                            })(
                                                <Input placeholder="请输入权限范围"/>,
                                            )}
                                        </Form.Item>
                                    </div>
                                    <div className="dis-flex">
                                        <Form.Item label="refresh刷新时间">
                                            {getFieldDecorator('refreshTokenValidity', {
                                                rules: [{required: true, message: '请输入refresh刷新时间!'}],
                                                initialValue: OpenStateData ? OpenStateData.refreshTokenValidity : ''
                                            })(
                                                <Input addonAfter={<span>秒</span>} placeholder="请输入refresh刷新时间"/>,
                                            )}
                                        </Form.Item>
                                        <Form.Item label="token失效时间">
                                            {getFieldDecorator('accessTokenValidity',{
                                                rules: [{ required: true, message: '请输入token失效时间!' }],
                                                initialValue: OpenStateData?OpenStateData.accessTokenValidity:''
                                            })(
                                                <Input addonAfter={<span>秒</span>} placeholder="请输入token失效时间"/>,
                                            )}
                                        </Form.Item>
                                    </div>
                                    <Form.Item label="授权代理类型" style={{marginBottom:50}}>
                                        {getFieldDecorator('authorizedGrantTypes', {
                                            rules: [{required: true, message: '请输入授权代理类型!'}],
                                            initialValue: OpenStateData ? OpenStateData.authorizedGrantTypes : ''
                                        })(
                                            <Input placeholder="请输入授权代理类型"/>,
                                        )}
                                    </Form.Item>
                                    <div className="footer">
                                        <Button type="primary"
                                                style={{backgroundColor:'#fff',borderColor:'rgba(233,233,233,1)',color:'#00af98'}}
                                                onClick={()=>this.hiddenForm()}
                                        >取消</Button>
                                        <Button type="primary" htmlType="submit">保存</Button>
                                    </div>
                                </Form>
                                :
                                <Form onSubmit={this.handleSubmit}>
                                    <Form.Item label="refresh刷新时间">
                                        {getFieldDecorator('refreshTokenValidity', {
                                            rules: [{required: true, message: '请输入refresh刷新时间!'}],
                                            initialValue: OpenStateData ? OpenStateData.refreshTokenValidity : ''
                                        })(
                                            <Input addonAfter={<span>秒</span>} placeholder="请输入refresh刷新时间"/>,
                                        )}
                                    </Form.Item>
                                    <Form.Item label="token失效时间" style={{marginBottom:50}}>
                                        {getFieldDecorator('accessTokenValidity',{
                                            rules: [{ required: true, message: '请输入token失效时间!' }],
                                            initialValue: OpenStateData?OpenStateData.accessTokenValidity:''
                                        })(
                                            <Input addonAfter={<span>秒</span>} placeholder="请输入token失效时间"/>,
                                        )}
                                    </Form.Item>
                                    <div className="footer">
                                        <Button type="primary"
                                                style={{backgroundColor:'#fff',borderColor:'rgba(233,233,233,1)',color:'#00af98'}}
                                                onClick={()=>this.hiddenForm()}
                                        >取消</Button>
                                        <Button type="primary" htmlType="submit">保存</Button>
                                    </div>
                                </Form>
                            }
                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}
const WrappedAddRole = Form.create({ name: 'add-token' })(addRole);
const mapStateToProps = (state) => {
    const OtherState = getOtherState(state)
    return {
        OtherState
    }
}
//映射Redux actions到组件的属性
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
}
//连接组件
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAddRole)
