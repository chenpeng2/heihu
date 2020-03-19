import React, { PureComponent } from 'react'
import { connect } from "react-redux"
import { Tabs, Input, Select, Form, DatePicker } from 'antd'

import moment from 'moment';  // 处理时间控件value类型

const { Option } = Select;
const { TabPane } = Tabs;

// 默认值设置表单组件
const CustomizedForm = Form.create({
    name: 'global_state',
    onFieldsChange(props, changedFields) {
      props.onChange(changedFields);
    },
    mapPropsToFields(props) {
      return {
        shop: Form.createFormField({
          ...props.shop,
          value: props.shop.value,
        }),
        maker: Form.createFormField({
            ...props.maker,
            value: props.maker.value,
        }),
        type: Form.createFormField({
            ...props.type,
            value: props.type.value,
        }),
        outTime: Form.createFormField({
            ...props.outTime,
            value: props.outTime.value,
        }),
        enterTime: Form.createFormField({
            ...props.enterTime,
            value: props.enterTime.value,
        }),
      };
    }
  })(props => {
    const { getFieldDecorator } = props.form;
    const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
    return (
      <Form {...formItemLayout} className="default-form">
        <Form.Item label="车间">
          {getFieldDecorator('shop')(<Input />)}
        </Form.Item>
        <Form.Item label="制造商">
          {getFieldDecorator('maker')(<Input />)}
        </Form.Item>
        <Form.Item label="型号">
          {getFieldDecorator('type')(<Input />)}
        </Form.Item>
        <Form.Item label="出厂日期">
          {getFieldDecorator('outTime')(<DatePicker format={"YYYY-MM-D"} />)}
        </Form.Item>
        <Form.Item label="入厂日期">
          {getFieldDecorator('enterTime')(<DatePicker format={"YYYY-MM-D"} />)}
        </Form.Item>
      </Form>
    );
  });

class Setting extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            notifcate: 30,  // 通知频率数据
            fields: {  // 默认值设置数据
                shop: {
                  value: '车间1',
                },maker: {
                    value: 'mi',
                },type: {
                    value: '82374235',
                },outTime: {
                    value: moment('2015/01/01', "YYYY-MM-DD"),
                },enterTime: {
                    value: moment('2015/01/01', "YYYY-MM-DD"),
                },
              }
        }
    }

    handleFormChange = changedFields => {
        this.setState(({ fields }) => ({
          fields: { ...fields, ...changedFields },
        }));
    }

    notificateChange(notifcate) {  // select事件 切换通知频率
        this.setState({ notifcate })
    }

    render() {
        const { userInfo } = this.props;
        const children = [<Option key='30'>30分钟</Option>, <Option key='20'>20分钟</Option>, <Option key='10'>10分钟</Option>];
        return (
            <Tabs tabPosition="left" defaultActiveKey="1">
                <TabPane 
                    tab={ <div className="tab-inner"><i className="sap-icon icon-account"></i><div>账户<div>{ userInfo.userName }</div></div></div> } 
                    key="1">
                    <div className="inner" style={{ height: '460px' }}>
                        <div className="title"><i className="sap-icon icon-account"></i> { userInfo.userName }</div>
                        <form>
                            <div className="group">
                                <label>名称：</label>
                                <Input disabled value={ userInfo.userName } />
                            </div>
                            <div className="group">
                                <label>电子邮件：</label>
                                <Input disabled value={ userInfo.userEmail } />
                            </div>
                        </form>
                    </div>
                </TabPane>
                {/* <TabPane tab={ <div className="tab-inner"><i className="sap-icon icon-bell"></i><div>通知</div></div> } key="2">
                    <div className="inner" style={{ height: '460px' }}>
                        <div className="title"><i className="sap-icon icon-bell"></i> 通知</div>
                        <form>
                            <div className="group">
                                <label>通知频次：</label>
                                <Select
                                    onChange={(value, e) => { this.notificateChange(value) } }
                                    defaultValue="30"
                                    size="default"
                                    placeholder="选择频次"
                                    style={{ width: '197px', height: '26px' }}
                                >
                                    {children}
                                </Select>
                            </div>
                            <p>对于一台设备的一个参数类型，两次通知间隔不会大于选择的频次。</p>
                        </form>
                    </div>
                </TabPane> */}
                {/* <TabPane tab={ <div className="tab-inner"><i className="sap-icon icon-filter-fields"></i><div>默认值</div></div> } key="3">
                    <div className="inner" style={{ height: '460px' }}>
                        <div className="title"><i className="sap-icon icon-filter-fields"></i> 默认值</div>
                        <CustomizedForm {...this.state.fields} onChange={this.handleFormChange} />
                    </div>
                </TabPane> */}
            </Tabs>
        )
    }
}

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Setting)