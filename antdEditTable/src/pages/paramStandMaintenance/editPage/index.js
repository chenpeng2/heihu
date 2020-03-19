import React, { PureComponent } from 'react';
import { Breadcrumb, Button, Table, Checkbox, Form, Input, Select, Tooltip, Icon, Modal, Anchor } from 'antd';
import AntdEditTable from '@src/components/antdEditTable/index';
const { Search } = Input;
const { Option } = Select;
const { Link } = Anchor;
class EditPage extends PureComponent {
  constructor(props) {
    super(props)
      this.state = {
          visible: false,
          newStandard:false,
          selectedRows: [],
          columns: [
              {
                  title: '#',
                  dataIndex: 'num'
              },
              {
                  title: '参数名称',
                  dataIndex: 'name',
              },
              {
                  title: 'MeasurementID',
                  dataIndex: 'MeasurementID',
              },
              {
                  title: '标准下限',
                  dataIndex: 'stadardDown',
                  editable: true,
                  tailaffix:'℃',
                  width:'15%'
              },
              {
                  title: '标准上限',
                  dataIndex: 'stadardUp',
                  editable: true,
                  tailaffix:'℃',
                  width:'15%'
              },
              {
                  title: '接收通知',
                  dataIndex: 'notice',
                  editable: true,
                  inputtype:'check',
                  render: (text, row) =>{
                    return <Checkbox onChange={console.log(1)} checked={row.notice}>Checkbox</Checkbox>
                  }
              },
              {
                  title: '通知优先级',
                  dataIndex: 'priority',
                  editable: true,
                  inputtype:'select'
              },
              {
                  title: '通知间隔',
                  dataIndex: 'interval',
                  editable: true,
                  inputtype:'select'
              }
          ],
          data: [
                {
                  key: '1',
                  num: 3,
                  name: '600009070',
                  MeasurementID: 'CR-D123V09',
                  stadardDown: '500009070',
                  stadardUp: 'CR-D123V09',
                  notice: false,
                  priority: '500009070',
                  interval: 'CR-D123V09',
                },
                {
                  key: '2',
                  num: 3,
                  name: '600009070',
                  MeasurementID: 'CR-D123V09',
                  stadardDown: '500009070',
                  stadardUp: 'CR-D123V09',
                  notice: true,
                  priority: '500009070',
                  interval: 'CR-D123V09',
                }
          ],
      }
  }
    handleSubmit = (e) => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', fieldsValue);
        });
    }
    editTable = (newData) => {
        //这里需要判断save保存是修改还是新增
        if(newData){
            this.setState({dataSource: newData},()=>{
                this.props.history.push('/paramStandMaintenance/viewPage')
            })
        }
    }
    save = ()=> {
      this.refs.antdEditTable.handlePreserve()
    }
    cancel = ()=> {
        this.props.history.push('/paramStandMaintenance/viewPage')
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    handleCancel = e => {
        this.setState({
            visible: false,
        });
    };
  render() {
      const { name } =this.state;
      const {columns, data } = this.state;
      const rowSelection = {
          onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                  selectedRows
              })
          },
          getCheckboxProps: record => ({
              name: record.name,
          }),
      };
      const { getFieldDecorator } = this.props.form;
      const children = [<Option key='1'>车间1</Option>, <Option key='2'>车间2</Option>];
      const dataSour = [
          {
              key: '1',
              name: 'Table content text',
              id: 'Tokyo',
              type: '617083',
          },
          {
              key: '2',
              name: 'Table content text',
              id: 'Tokyo',
              type: '617083',
          },
          {
              key: '3',
              name: 'Table content text',
              id: 'Tokyo',
              type: '617083',
          },
          {
              key: '4',
              name: 'Table content text',
              id: 'Tokyo',
              type: '617083',
          },
      ];

      const cols = [
          {
              title: '产品名称',
              dataIndex: 'name',
              key: 'name',
          },
          {
              title: '产品编号',
              dataIndex: 'id',
              key: 'id',
          },
          {
              title: '产品种类',
              dataIndex: 'type',
              key: 'type',
          },
      ];
      return (
          <div className="Vparam-stand-maintenance">
              <div className="header">
                  <div>
                      <Breadcrumb>
                          <Breadcrumb.Item>管理标准</Breadcrumb.Item>
                          <Breadcrumb.Item style={{color:'#427CAC'}}>参数标准</Breadcrumb.Item>
                      </Breadcrumb>
                      <div className="name">
                          {name?'创建标准':'标准名称'}
                      </div>
                  </div>
              </div>
              <div className="all-tabs">
                  <Anchor affix={false}>
                      <ul>
                          <li className="active"><Link href="#basic-information" title="基础信息" /></li>
                          <li><Link href="#parameter-standard" title="参数标准" /></li>
                      </ul>
                  </Anchor>
              </div>
              <div className="all-contents">
                  <div className="content-item">
                    <div className="head">
                        <span>基础信息</span>
                    </div>
                    <div className="cont">
                        <Form layout="inline" onSubmit={this.handleSubmit}>
                            <Form.Item label="标准名称:">
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: '请输入标准名称' }],
                                })(
                                    <Input placeholder="Basic usage" style={{ width: 200 }}/>,
                                )}
                            </Form.Item>
                            <Form.Item label="设备:">
                                {getFieldDecorator('equipment', {
                                    rules: [{ required: true, message: '请选择设备' }],
                                })(
                                    <Select
                                        mode="multiple"
                                        size="default"
                                        placeholder="选择车间"
                                        style={{ width: 200 }}
                                    >
                                        {children}
                                    </Select>,
                                )}
                            </Form.Item>
                            <Form.Item label="产品:">
                                {getFieldDecorator('product', {
                                    rules: [{ required: true, message: '请选择产品' }],
                                })(
                                    <Input placeholder="Basic usage"
                                           suffix={
                                              <i className="sap-icon icon-value-help" onClick={(e)=>this.showModal(e)}></i>
                                           }
                                           style={{ width: 200,cursor:'pointer' }}
                                           onClick={(e)=>this.showModal(e)}
                                    />,
                                )}
                            </Form.Item>
                        </Form>
                    </div>
                  </div>
                  <div className="content-item">
                      <div className="head">
                          <span>参数标准</span>
                      </div>
                      <div className="cont">
                          <div className="operate">
                              <span>设备 (5)</span>
                              <div>
                                  <a href="#">
                                      <i className="sap-icon icon-settings"></i>
                                  </a>
                              </div>
                          </div>
                          <AntdEditTable ref="antdEditTable" editTable={this.editTable} rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
                      </div>
                      <div className="save-btns">
                          <Button type="primary" style={{background:'#0A6ED1'}} className="save" onClick={this.save}>Save</Button>
                          <Button className="cancel" onClick={this.cancel}>Cancel</Button>
                      </div>
                      <Modal
                          className="edit-modal"
                          closable={false}
                          centered={true}
                          visible={this.state.visible}
                          onOk={this.handleOk}
                          onCancel={this.handleCancel}
                          footer={<div style={{color:'#0854A1'}} onClick={this.handleCancel}>取消</div>}
                      >
                          <div>
                              <Input placeholder="Search"
                                     suffix={
                                         <Icon type="search" />
                                     }
                                     style={{ width: '90%',margin:'0 0 12px 5%',cursor:'pointer' }}
                              />
                              <Table dataSource={dataSour} columns={cols} pagination={false}
                              />
                          </div>
                      </Modal>
                  </div>
              </div>
          </div>
    );
  }
}
const WrappedEditPage = Form.create({ name: 'params_search' })(EditPage);
export default WrappedEditPage;
