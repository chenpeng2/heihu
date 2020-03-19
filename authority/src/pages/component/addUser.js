import React, { PureComponent } from 'react';
import { Select, Button, Form, Input, message, Modal } from 'antd';
import AntBtn from '../authority/user/antBtn/index'
import request from 'util/http'
import Mock from 'mockjs'
import {connect} from 'react-redux'
import * as loginActions from '../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState, getOtherState } from '../../redux/selectors/loginSelector'
const { Option } = Select;
const { TextArea } = Input;
class addUser extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            antBtnData:[],
            antdBtnDataChange:false,
            defaultOrganization:[],
            organizationVisible:false,
            organizationValue:''
        }
    }
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', fieldsValue)
            this.handleUser(fieldsValue)
        });
    };
    handleUser = (fieldsValue)=> {
        const {OtherState} = this.props
        const {OpenStateData, OpenStateValue} = OtherState
        if(OpenStateValue == 1){
            setTimeout(()=>{
                this.addUser(OpenStateData, fieldsValue)
            },1000)
        }else if(OpenStateValue == 2){
            setTimeout(()=>{
                this.resetPass(OpenStateData, fieldsValue)
            },1000)
        }else{
            setTimeout(()=>{
                this.editUser(OpenStateData, fieldsValue)
            },1000)
        }
    }
    //添加用户
    addUser = (OpenStateData, fieldsValue)=> {
        const {user} = this.props.userInfo
        const username = user && user.username
        const {antBtnData} =this.state
        const role = antBtnData.map((item,index)=>{
            return item
        })
        var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
        const is_Email = reg.test(fieldsValue.username)
        if(!is_Email){
            message.error('邮箱格式不正确，请用数字，字母，下划线组成！')
            return
        }
        request({
            url: `/user/addUser`,
            method: 'POST',
            data:{
                roleList: role,
                user: {
                    id:Mock.mock('@integer(1,2147483647)'),
                    orgId: fieldsValue.org_id,
                    name: fieldsValue.name,
                    organization: fieldsValue.organization,
                    password: fieldsValue.password,
                    username: fieldsValue.username,
                    additionalInfo: fieldsValue.additionalInfo,
                    createdBy:username
                }
            },
            success: res => {
                message.success('添加成功！')
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
    //重置密码
    resetPass = (OpenStateData, fieldsValue)=> {
        const {id} = OpenStateData, {password}  = fieldsValue
        request({
            url: `/user/resetPassword?id=${id}&password=${password}`,
            method: 'GET',
            success: res => {
                message.success('重置密码成功！')
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
    //编辑用户
    editUser = (OpenStateData, fieldsValue)=> {
        request({
            url: `/user/updateUser`,
            method: 'POST',
            data:{
                roleList: fieldsValue.role,
                user: {
                    id:OpenStateData.id,
                    orgId:fieldsValue.org_id,
                    name: fieldsValue.name,
                    organization: fieldsValue.organization,
                    password: fieldsValue.password,
                    additionalInfo: fieldsValue.additionalInfo,
                }
            },
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
        this.setState({antdBtnDataChange:false})
        this.props.cancelOpenState(null,null)
    }
    addRole = (value)=> {
        // 这里需要处理本来有的和修改后的  合并
        this.setState({antBtnData:value,antdBtnDataChange:true})
    }
    componentWillReceiveProps(nextProps,nextState){
        const {OpenStateData} = nextProps.OtherState
        if(!this.state.antdBtnDataChange && OpenStateData){
            this.setState({antBtnData:OpenStateData.roleList})
        }
        if(nextProps.codeList !== this.props.codeList){
            this.setState({defaultOrganization:nextProps.codeList})
        }
    }
    addOrganization = ()=> {
        const {defaultOrganization,organizationValue} = this.state
        defaultOrganization.push(organizationValue)
        this.setState({organizationVisible:false})
    }
    componentDidMount(){
        const { codeList } = this.props
        this.setState({defaultOrganization:codeList})
    }
    render() {
        const {width, height, OtherState, userInfo} = this.props
        const {antBtnData, defaultOrganization} = this.state
        const W = width?width:540
        const H = height?height:320
        const { getFieldDecorator } = this.props.form;
        const {OpenState,OpenStateData,OpenStateValue} = OtherState
        const title = OpenStateValue===1?'用户新增':(OpenStateValue===2?'重置密码':'用户编辑')
        const addOrgan = userInfo.user && userInfo.user.organization
        return (
            <div className={OpenState?'define-modal-mask':''}>
                {OpenState && <div className="modal-wrap animated zoomIn">
                    <div className="modal-content" style={{width:width+'px',marginLeft:-W/2+'px',marginTop:-H/2+'px'}}>
                        <div className="title">{title}</div>
                        <div className="cont">
                            <Form onSubmit={this.handleSubmit}>
                                <div className="dis-flex">
                                    <Form.Item label="邮箱">
                                        {getFieldDecorator('username',{
                                            rules: [{ required: true, message: '请输入邮箱!' }],
                                            initialValue: OpenStateData?OpenStateData.username:''
                                        })(
                                            <Input className="form-item-layout" placeholder="请输入用户名" disabled={(OpenStateValue==2 || OpenStateValue==3)?true:false}/>
                                        )}
                                    </Form.Item>
                                    {/*//Select的placeholder有问题*/}
                                    {OpenStateData?
                                        <Form.Item label={<span>机构{addOrgan === '0' && <Button type="primary" onClick={()=>this.setState({organizationVisible:true})}>添加新机构</Button>}</span>} className="right-margin">
                                            {getFieldDecorator('organization', {
                                                rules: [{required: true, message: '请选择机构!'}],
                                                initialValue: OpenStateData ? OpenStateData.organization : '',
                                            })(
                                                <Select style={addOrgan === '0' ? {width:126} : {}} placeholder="请选择机构" className="form-item-layout"
                                                        disabled={OpenStateValue == 2 ? true : false}>
                                                    {defaultOrganization.map((item,index)=><Option key={index} value={item}>{item}</Option>)}
                                                </Select>
                                            )}
                                        </Form.Item>
                                        :
                                        <Form.Item label={<span>机构{addOrgan === '0' && <Button type="primary" onClick={()=>this.setState({organizationVisible:true})}>添加新机构</Button>}</span>} className="right-margin">
                                            {getFieldDecorator('organization', {
                                                rules: [{required: true, message: '请选择机构!'}],
                                            })(
                                                <Select style={addOrgan === '0' ? {width:126} : {}} placeholder="请选择机构" className="form-item-layout"
                                                        disabled={OpenStateValue == 2 ? true : false}>
                                                    {defaultOrganization.map((item,index)=><Option key={index} value={item}>{item}</Option>)}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    }
                                </div>
                                <div className="dis-flex">
                                    <Form.Item label="密码">
                                        {getFieldDecorator('password',{
                                            rules: [{ required: true, message: '请输入密码!' }],
                                            initialValue: OpenStateData?OpenStateData.password:''
                                        })(
                                            <Input.Password placeholder="请输入密码" className="form-item-layout" autoComplete="new-password" disabled={OpenStateValue==3?true:false}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item label="用户名" className="right-margin">
                                        {getFieldDecorator('name',{
                                            rules: [{ required: true, message: '请输入用户名!' }],
                                            initialValue: OpenStateData?OpenStateData.name:''
                                        })(
                                            <Input placeholder="请输入用户名" className="form-item-layout" disabled={OpenStateValue==2?true:false}/>
                                        )}
                                    </Form.Item>
                                </div>
                                <div className="dis-flex">
                                    <Form.Item label="org_id">
                                        {getFieldDecorator('org_id',{
                                            rules: [{ required: true, message: '请输入org_id!' }],
                                            initialValue: OpenStateData?OpenStateData.orgId:''
                                        })(
                                            <Input placeholder="请输入org_id" className="form-item-layout" disabled={OpenStateValue==2?true:false}/>
                                        )}
                                    </Form.Item>
                                </div>
                                <div className="dis-flex">
                                    <Form.Item label="备注" style={{width:'100%'}} className="additionalInfo">
                                            {getFieldDecorator('additionalInfo',{
                                                rules: [{ required: false, message: '请输入备注!' }],
                                                initialValue: OpenStateData?(OpenStateData.additionalInfo==='null'?'':OpenStateData.additionalInfo):''
                                            })(
                                                <TextArea rows={2} placeholder="请输入备注" allowClear={true} className="form-item-layout" disabled={OpenStateValue==2?true:false}/>
                                            )}
                                    </Form.Item>
                                </div>
                                <Form.Item label="角色" className="last-margin">
                                    {getFieldDecorator('role',{
                                        rules: [{ required: false, message: '请选择角色!' }],
                                        initialValue: antBtnData
                                    })(
                                        <div className="text-area">
                                            <AntBtn antBtnData={antBtnData} addRole={(value)=>this.addRole(value)}/>
                                            {OpenStateValue==2 && <div className="mask"></div>}
                                        </div>
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
                        </div>
                    </div>
                </div>}
                <Modal
                    wrapClassName="role-modal animated fadeIn"
                    title={null}
                    okText="保存"
                    onCancel={()=>this.setState({organizationVisible:false})}
                    onOk={()=>this.addOrganization()}
                    closable={false}
                    visible={this.state.organizationVisible}
                    keyboard={true}
                    centered={true}
                >
                    <div className="title" style={{marginBottom:20}}>
                        添加新机构
                    </div>
                    <Input placeholder="请选择新机构" className="form-item-layout" onChange={(e)=>this.setState({organizationValue:e.target.value})}/>
                </Modal>
            </div>
        );
    }
}
const WrappedAddUser = Form.create({ name: 'add-user' })(addUser);
const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    const OtherState = getOtherState(state)
    return {
        userInfo,
        OtherState
    }
}
//映射Redux actions到组件的属性
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
}
//连接组件
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAddUser)
