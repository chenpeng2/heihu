import React, { PureComponent } from 'react';
import * as loginActions from 'redux/actions/loginActionCreators'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { getloginState } from 'redux/selectors/loginSelector'
import { login, resetPassword, getCookie } from 'util/userApi'
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import ImgUrl3 from 'static/img/logo2.png'
class Login extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
        isResetPassword: false,
        username:''
    }
  }
  componentDidMount() {
      if(getCookie('username')){
        this.setState({
            username: getCookie('username'),
        })
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
  }
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
    const { isLoading, isResetPassword, username } = this.state
    const { getFieldDecorator } = this.props.form;
    const role = this.props.userInfo && this.props.userInfo.role;
    // const code = getQueryString(window.location.search, 'code');
    // const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    const loginStyle={
        gradient:{
            backgroundImage: `linear-gradient( #4B7790 , #038372 )`,
            color:'#fff'
        },
        imgWid:{
            width:'120px'
        }
    }
    return (
            <div className="main-wrapper">
                <main className="ulp-outer">
                    <section className="ulp-box" style={loginStyle.gradient}>
                        <div className="ulp-box-inner">
                            <div className="ulp-main">
                                <div className="ulp-header">
                                    <img id="prompt-logo-center" src={ImgUrl3} alt="欢迎" style={loginStyle.imgWid}/>
                                    {isResetPassword && <div className="head-title">重置密码</div>}
                                </div>
                                <div className="ulp-container">
                                    <div className="button-bar" id="components-form-demo-normal-login">
                                        {!isResetPassword &&<Form onSubmit={this.handleSubmit} className="login-form">
                                                <Form.Item>
                                                    {getFieldDecorator('username', {
                                                        rules: [{ required: true, message: '请输入邮箱!' }],
                                                        initialValue: username ? username : '',
                                                    })(
                                                        <Input
                                                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                            placeholder="邮箱"
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
                                                    {/* <a className="login-form-forgot" href="">
                                                        忘记密码
                                                    </a> */}
                                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                                        登录
                                                    </Button>
                                                    {/* 或者 <a href="">去注册</a> */}
                                                    <a className="login-form-reset" onClick={this.resetPassword}>修改密码</a>
                                                </Form.Item>
                                            </Form>
                                        }
                                        {isResetPassword && <Form onSubmit={this.resetSubmit} className="reset-form">
                                        <Form.Item>
                                            {getFieldDecorator('username', {
                                                rules: [{ required: true, message: '请输入邮箱!' }],
                                                initialValue: this.state.username
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
const mapStateToProps = (state) => {
  const userInfo = getloginState(state)
  return {
      userInfo
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(loginActions, dispatch)
}
const WrappedTimeRelatedForm = Form.create({ name: 'time_related_controls' })(Login);
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedTimeRelatedForm)
