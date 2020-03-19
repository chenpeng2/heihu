import React, { PureComponent } from 'react';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import {getCookie,login} from 'util/userApi'
import {withRouter} from "react-router-dom"
import ImgUrl from '../../static/img/AppleTV.svg'
import ImgUrl3 from '../../static/img/logo2.png'
class TimeRelatedForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            marginTop:'',
            username:''
        }
    }
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
            }
            if(values.username && values.password){
                login(values)
            }
        });
    };
    resize = ()=> {
        let clientH = document.body.clientHeight
        const marginTop = (clientH - 540)*1/3
        this.setState({marginTop})
    }
    componentDidMount(){
        const _this = this
        _this.resize()
        window.onresize = function(){
            _this.resize()
        }
        if(getCookie('username')){
            this.setState({
                username: getCookie('username'),
            })
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { marginTop } = this.state
        const loginStyle={
            flex1:{
                flex:1
            },
            background:{
                height:'100%',
                minWidth:'1200px',
                minHeight:'700px',
                position:'relative',
                background:`url(${ImgUrl}) no-repeat #fff`,
                backgroundSize:'100%'
            },
            gradient:{
                marginTop: marginTop+'px',
                backgroundImage: `linear-gradient( #4B7790 , #038372 )`,
                color:'#fff'
            },
            imgWid:{
                width:'120px'
            }
        }
        return (
            <div className="main-wrapper">
                <main className="ulp-outer dis-flex" style={loginStyle.background}>
                    <div style={{...loginStyle.flex1}}>

                    </div>
                    <div style={{marginRight:'10%'}}>
                        <section className="ulp-box" style={loginStyle.gradient}>
                            <div className="ulp-box-inner">
                                <div className="ulp-main">
                                    <div className="ulp-header">
                                        <img id="prompt-logo-center" src={ImgUrl3} alt="欢迎" style={loginStyle.imgWid}/>
                                    </div>
                                    <div className="ulp-container">
                                        <input type="hidden" name="state" value="g6Fo2SBFSHk5aHN4MmRrTE5pOFg1RnNhNEUzeG0zS0gxQ0l5aaN0aWTZIGVKWHVOQmlpX3NNel8xWWYybWtMcjcyY084T05TOUdro2NpZNkgMk4wTlg1azllb21YWUZEY25FWG5iMlg3cWx1bzJ2UDE" />
                                        <div className="button-bar" id="components-form-demo-normal-login">
                                            <Form onSubmit={this.handleSubmit} className="login-form">
                                                <Form.Item>
                                                    {getFieldDecorator('username', {
                                                        rules: [{ required: true, message: '请输入用户名!' }],
                                                    })(
                                                        <Input
                                                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                            placeholder="用户名"
                                                        />,
                                                    )}
                                                </Form.Item>
                                                <Form.Item>
                                                    {getFieldDecorator('password', {
                                                        rules: [{ required: true, message: '请输入密码!' }],
                                                    })(
                                                        <Input
                                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                            type="password"
                                                            placeholder="密码"
                                                        />,
                                                    )}
                                                </Form.Item>
                                                <Form.Item>
                                                    {getFieldDecorator('organization', {
                                                        rules: [{ required: true, message: '请选择机构!' }],
                                                    })(
                                                        <Input
                                                            prefix={<Icon type="team" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                            placeholder="机构"
                                                        />
                                                    )}
                                                </Form.Item>
                                                <Form.Item>
                                                    {getFieldDecorator('remember', {
                                                        valuePropName: 'checked',
                                                        initialValue: true,
                                                    })(<Checkbox>请记住我</Checkbox>)}
                                                    {/* <a className="login-form-forgot" href="">
                                                        忘记密码
                                                    </a> */}
                                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                                        登录
                                                    </Button>
                                                    {/* 或者 <a href="">去注册</a> */}
                                                </Form.Item>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        );
    }
}
const WrappedTimeRelatedForm = Form.create({ name: 'time_related_controls' })(TimeRelatedForm);
export default withRouter(WrappedTimeRelatedForm);
