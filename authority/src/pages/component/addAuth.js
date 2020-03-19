import React, { PureComponent } from 'react';
import { Select, Button, Form, Input, message, Modal } from 'antd';
import request from 'util/http'
import Mock from 'mockjs'
import {connect} from 'react-redux'
import * as loginActions from '../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState, getOtherState } from '../../redux/selectors/loginSelector'
const { Option } = Select;
class addAuthority extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
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
            this.addAuthority(OpenStateData, fieldsValue)
        }else{
            this.editUser(OpenStateData, fieldsValue)
        }
    }
    //新增权限
    addAuthority = (OpenStateData, fieldsValue)=> {
        const {user} = this.props.userInfo
        const username = user && user.username
        request({
            url: `/authority/addAuthority`,
            method: 'POST',
            data:{
                id:Mock.mock('@integer(1,2147483647)'),
                authority: fieldsValue.authority,
                organization: fieldsValue.organization,
                description: fieldsValue.description,
                createdBy:username
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
    //编辑权限
    editUser = (OpenStateData, fieldsValue)=> {
        request({
            url: `/authority/updateAuthority`,
            method: 'POST',
            data:{
                id:OpenStateData.id,
                authority: fieldsValue.authority,
                organization: fieldsValue.organization,
                description: fieldsValue.description,
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
        this.props.cancelOpenState(null,null)
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
    componentWillReceiveProps(nextProps,nextState){
        if(nextProps.codeList !== this.props.codeList){
            this.setState({defaultOrganization:nextProps.codeList})
        }
    }
    render() {
        const {width, height, OtherState, userInfo} = this.props
        const {defaultOrganization} = this.state
        const W = width?width:540
        const H = height?height:320
        const { getFieldDecorator } = this.props.form;
        const {OpenState,OpenStateData,OpenStateValue} = OtherState
        const title = OpenStateValue === 1 ? '权限新增' : '权限编辑'
        const addOrgan = userInfo.user && userInfo.user.organization
        return (
            <div className={OpenState?'define-modal-mask':''}>
                {OpenState && <div className="modal-wrap animated zoomIn">
                    <div className="modal-content" style={{width:width+'px',marginLeft:-W/2+'px',marginTop:-H/2+'px'}}>
                        <div className="title">{title}</div>
                        <div className="cont">
                            <Form onSubmit={this.handleSubmit}>
                                <div className="dis-flex">
                                    <Form.Item label="权限">
                                        {getFieldDecorator('authority',{
                                            rules: [{ required: true, message: '请输入权限名!' }],
                                            initialValue: OpenStateData?OpenStateData.authority:''
                                        })(
                                            <Input className="form-item-layout" placeholder="请输入权限名"/>
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
                                <Form.Item label="权限描述" className="last-margin">
                                    {getFieldDecorator('description',{
                                        rules: [{ required: false, message: '请输入权限描述!' }],
                                        initialValue: OpenStateData?OpenStateData.description:''
                                    })(
                                        <Input className="form-item-layout" placeholder="请输入权限描述"/>
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
const WrappedAddAuthority = Form.create({ name: 'add-role' })(addAuthority);
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
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAddAuthority)
