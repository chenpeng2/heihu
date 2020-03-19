import React from 'react';
import { Form, Icon, Input, Button, Checkbox, Spin } from 'antd';
import { login, getCookie, resetPassword } from 'utils/userApi'
import { withRouter } from "react-router-dom"
import ImgUrl3 from '../../../asstes/images/logo2.png'

class TimeRelatedForm extends React.Component {
    constructor(props) {
        super()
        this.state = {
            isResetPassword: false,
        }
    }
    componentDidMount() {
        this.setState({
            username: getCookie('username'),
            password: getCookie('password')
        })
    }
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                return
            }
            if (values.username && values.username) {
                this.setState({
                    isLoading: true
                })
                login(values).then(res => {
                    this.setState({
                        isLoading: false
                    })
                })
            }

        });
    };

    resetSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                return
            }
            if (values.password && values.newPassword) {
                resetPassword(values).then(res => {
                    if (res) {
                        this.setState({
                            isResetPassword: false,
                        })
                        window.history.go(0)
                    }
                    
                })
            }
        });
    }

    toLogin = () => {
        this.setState({
            isResetPassword: false,
        }) 
    }

    resetPassword = () => {
        this.setState({
            isResetPassword: true,
        })
    }

    render() {
        const { isLoading, isResetPassword } = this.state
        const { getFieldDecorator } = this.props.form;
        const loginStyle = {
            flex1: {
                flex: 1
            },
            background: {
                height: '100%',
                position: 'relative',
                background: `url(${ImgUrl3}) no-repeat #fff`,
                backgroundSize: 'auto'
            },
            gradient: {
                backgroundImage: `linear-gradient( #4B7790 , #038372 )`,
                color: '#fff'
            },
            imgWid: {
                width: '120px'
            }
        }
        return (
            <div className="main-wrapper">
                <main className="ulp-outer">
                    <section className="ulp-box">
                        {isLoading && <div className="login-loading">
                            <Spin tip="登录中..."></Spin>
                        </div>}
                        <div className="ulp-box-inner">
                            <div className="ulp-main">
                                <div className="ulp-header">
                                    <img id="prompt-logo-center" src={ImgUrl3} alt="欢迎" style={loginStyle.imgWid} />
                                    {isResetPassword && <div className="head-title">重置密码</div>}
                                </div>
                                <div className="ulp-container">
                                    <input type="hidden" name="state" value="g6Fo2SBFSHk5aHN4MmRrTE5pOFg1RnNhNEUzeG0zS0gxQ0l5aaN0aWTZIGVKWHVOQmlpX3NNel8xWWYybWtMcjcyY084T05TOUdro2NpZNkgMk4wTlg1azllb21YWUZEY25FWG5iMlg3cWx1bzJ2UDE" />
                                    <div className="button-bar" id="components-form-demo-normal-login">
                                        {!isResetPassword && <Form onSubmit={this.handleSubmit} className="login-form">
                                            <Form.Item>
                                                {getFieldDecorator('username', {
                                                    rules: [{ required: true, message: '请输入用户名!' }],
                                                    initialValue: this.state.username
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
                                                    initialValue: this.state.password
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
                                                })(<Checkbox style={{ padding: '0' }}>请记住我</Checkbox>)}
                                                {/* <a className="login-form-forgot" href="">
                                                    忘记密码
                                                </a> */}
                                                <Button type="primary" htmlType="submit" className="login-form-button">
                                                    登录
                                                </Button>
                                                <a className="login-form-reset" onClick={this.resetPassword}>
                                                    修改密码
                                                </a>
                                                {/* 或者 <a href="">去注册</a> */}
                                            </Form.Item>
                                        </Form>}
                                        {isResetPassword && <Form onSubmit={this.resetSubmit} className="reset-form">
                                            <Form.Item>
                                                {getFieldDecorator('username', {
                                                    rules: [{ required: true, message: '请输入邮箱!' }],
                                                    initialValue: this.state.email
                                                })(
                                                    <Input
                                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="邮箱"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item>
                                                {getFieldDecorator('password', {
                                                    rules: [{ required: true, message: '请输入旧密码!' }],
                                                    initialValue: this.state.oldPassword
                                                })(
                                                    <Input
                                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        type="password"
                                                        placeholder="旧密码"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item>
                                                {getFieldDecorator('newPassword', {
                                                    rules: [{ required: true, message: '请输入新密码!' }],
                                                    initialValue: this.state.newPassword
                                                })(
                                                    <Input
                                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        type="password"
                                                        placeholder="新密码"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item>
                                                <Button type="primary" htmlType="submit" className="reset-form-button">
                                                    确认修改
                                                </Button>
                                            </Form.Item>
                                            <a className="login-form-reset" onClick={this.toLogin}>
                                                {'<返回登录'}
                                            </a>
                                        </Form>}
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
