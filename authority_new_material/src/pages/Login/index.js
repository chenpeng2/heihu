import React, { PureComponent } from 'react';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import request from '../../util/http'
import {setCookie,getCookie} from '../../util/userApi'
import {withRouter} from "react-router-dom"
class TimeRelatedForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
            if(values.username && values.username){
                this.login(values)
            }
        });

    };
    is_Email = (str)=> {
        var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
        return reg.test(str);
    }
    login = (values)=> {
        delete values.remember
        const emailValues =Object.assign({},values)
        const is_Email = this.is_Email(values.username)
        delete emailValues.username
        emailValues.email=values.username
        const origin = window.location.href
        let organization = "SYSTEM";
        if(origin.indexOf('tms') > -1){
            organization = "TSM"
        }else if(origin.indexOf('dicastal') > -1){
            organization = "DICASTAL"
        }else if(origin.indexOf('omega8') > -1){
            organization = "OMEGA8"
        }
        const data = is_Email?{...emailValues,...{organization}}:{...values,...{organization}}
        request({
            url: `/login`,
            method: 'POST',
            data,
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const responses = res.data
                setCookie('login-data',JSON.stringify(responses),0.5)
                setCookie('access_token',JSON.stringify(responses.jwt.access_token),0.5)
                setCookie('username',JSON.stringify(responses.user.username),0.5)
                message.success('登录成功！')
                this.props.history.push('/')
            },
            error: error => {
                // if(error.code === -2){
                //
                // }
                const msg = error.response && error.response.data.msg
                message.error(msg)
            }
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="main-wrapper">
                <main className="ulp-outer">
                    <section className="ulp-box">
                        <div className="ulp-box-inner">
                            <div className="ulp-main">
                                <div className="ulp-header">
                                    <img id="prompt-logo-center" src="https://mi.blacklake.cn/resource/logo_without_brand.png" alt="欢迎" />
                                    <h1>黑湖智造 MI</h1>
                                    {/*<p className="text-simple">CHINAUST</p>*/}
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
                                                {getFieldDecorator('remember', {
                                                    valuePropName: 'checked',
                                                    initialValue: true,
                                                })(<Checkbox>请记住我</Checkbox>)}
                                                <a className="login-form-forgot" href="">
                                                    忘记密码
                                                </a>
                                                <Button type="primary" htmlType="submit" className="login-form-button">
                                                    登录
                                                </Button>
                                                或者 <a href="">去注册</a>
                                            </Form.Item>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
    }
}
const WrappedTimeRelatedForm = Form.create({ name: 'time_related_controls' })(TimeRelatedForm);
export default withRouter(WrappedTimeRelatedForm);
