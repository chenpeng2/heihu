import React, { PureComponent } from 'react';
import { Select, Button, Form, Input, message, Modal } from 'antd';
import AntBtn from '../authority/role/antBtn/index'
import request from 'util/http'
import {connect} from 'react-redux'
import * as loginActions from '../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState, getOtherState } from '../../redux/selectors/loginSelector'
import Mock from 'mockjs'
const { Option } = Select;
class addRole extends PureComponent {
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
            // console.log('Received values of form: ', fieldsValue)
            this.handleRole(fieldsValue)
        });
    };
    handleRole = (fieldsValue)=> {
        const {OtherState} = this.props
        const {OpenStateData, OpenStateValue} = OtherState
        if(OpenStateValue == 1){
            setTimeout(()=>{
                this.addRole(OpenStateData, fieldsValue)
            },1000)
        }else{
            setTimeout(()=>{
                this.editUser(OpenStateData, fieldsValue)
            },1000)
        }
    }
    //新增角色
    addRole = (OpenStateData, fieldsValue)=> {
        const {user} = this.props.userInfo
        const username = user && user.username
        const {antBtnData} =this.state
        const authority = antBtnData.map((item,index)=>{
            return {
                id:item.id,
                authority:item.authority
            }
        })
        request({
            url: `/role/addRole`,
            method: 'POST',
            data:{
                authList: authority,
                role: {
                    id:Mock.mock('@integer(1,2147483647)'),
                    description: fieldsValue.description,
                    organization: fieldsValue.organization,
                    name: fieldsValue.role,
                    createdBy:username
                }
            },
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
    //编辑角色
    editUser = (OpenStateData, fieldsValue)=> {
        request({
            url: `/role/updateRole`,
            method: 'POST',
            data:{
                authList: fieldsValue.auth,
                role: {
                    id:OpenStateData.id,
                    description: fieldsValue.description,
                    name: fieldsValue.role,
                    organization: fieldsValue.organization,
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
    addAuth = (value)=> {
        this.setState({antBtnData:value,antdBtnDataChange:true})
    }
    componentWillReceiveProps(nextProps,nextState){
        const {OpenStateData} = nextProps.OtherState
        if(!this.state.antdBtnDataChange && OpenStateData){
            this.setState({antBtnData:OpenStateData.authList})
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
        const title = OpenStateValue===1?'角色新增':'角色编辑'
        const addOrgan = userInfo.user && userInfo.user.organization
        return (
            <div className={OpenState?'define-modal-mask':''}>
                {OpenState && <div className="modal-wrap animated zoomIn">
                    <div className="modal-content" style={{width:width+'px',marginLeft:-W/2+'px',marginTop:-H/2+'px'}}>
                        <div className="title">{title}</div>
                        <div className="cont">
                            <Form onSubmit={this.handleSubmit}>
                                <div className="dis-flex">
                                    <Form.Item label="角色">
                                        {getFieldDecorator('role',{
                                            rules: [{ required: true, message: '请输入角色名!' }],
                                            initialValue: OpenStateData?OpenStateData.name:''
                                        })(
                                            <Input className="form-item-layout" placeholder="请输入角色名"/>
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
                                <Form.Item label="权限描述">
                                    {getFieldDecorator('description',{
                                        rules: [{ required: false, message: '请输入权限描述!' }],
                                        initialValue: OpenStateData?OpenStateData.description:''
                                    })(
                                        <Input className="form-item-layout" placeholder="请输入权限描述"/>
                                    )}
                                </Form.Item>
                                <Form.Item label="权限" className="last-margin">
                                    {getFieldDecorator('auth',{
                                        rules: [{ required: false, message: '请选择权限!' }],
                                        initialValue: antBtnData
                                    })(
                                        <div className="text-area">
                                            <AntBtn antBtnData={antBtnData} addRole={(value)=>this.addAuth(value)}/>
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
const WrappedAddRole = Form.create({ name: 'add-role' })(addRole);
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
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAddRole)
