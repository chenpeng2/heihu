import React, { PureComponent } from 'react';
import { Form, Input, Select, Button, Table, Icon, Affix } from 'antd';
import Bar from './bar';
import './index.less';
const { Search } = Input;
const { Option } = Select;
class ParamStandMaintenance extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],
            columns: [
                {
                    title: '#',
                    dataIndex: 'num'
                },
                {
                    title: '设备编号',
                    dataIndex: 'number',
                    render: text => <a onClick={this.toDevice}>{text}</a>,
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.name - b.name,
                },
                {
                    title: ' 设备名称',
                    dataIndex: 'name',
                },
                {
                    title: '产品',
                    dataIndex: 'product',
                },
                {
                    title: '车间',
                    dataIndex: 'group',
                },
                {
                    title: '重要参数异常',
                    dataIndex: 'param',
                },
                {
                    title: '次要参数异常',
                    dataIndex: 'param2',
                },
                {
                    title: '一般参数异常',
                    dataIndex: 'param3',
                },
                {
                    title: '参数异常总数',
                    dataIndex: 'abnormalNum',
                },
                {
                    title: '',
                    dataIndex: 'nextGo',
                    render: (text,row) => <Icon type="right" onClick={this.toParamShow}/>,
                    width: 80,
                }
            ],
            data: [
                {
                    key: '1',
                    num: 3,
                    number: '600009070',
                    name: 'Name',
                    product: 'product A',
                    group: 'Workshop A',
                    param: '8',
                    param2: '8',
                    param3: '8',
                    abnormalNum: '9',
                },
                {
                    key: '2',
                    num: 3,
                    number: '600009070',
                    name: 'Name',
                    product: 'product A',
                    group: 'Workshop A',
                    param: '8',
                    param2: '8',
                    param3: '8',
                    abnormalNum: '9',
                }],
            isShowFilter: true,
            isPingFilters: false,
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
    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter, isPingFilters } = this.state
        if(isPingFilters){return}
        this.setState({
            isShowFilter: !isShowFilter
        })
    }

    pingFilters() {
        const { isPingFilters } = this.state
        this.setState({
            isPingFilters: !isPingFilters,
        })
    }
    renderFilters() {
        const { isShowFilter, isPingFilters } = this.state;
        const { getFieldDecorator } = this.props.form;
        const children = [<Option key='1'>车间1</Option>, <Option key='2'>车间2</Option>];
        return (
            <div className="filter-panel">
                <div className="flex-container"  style={{display: isShowFilter ? "flex" : "none"}}>
                    <Form layout="inline" onSubmit={this.handleSubmit}>
                        <Form.Item label={<div></div>} colon={false}>
                            {getFieldDecorator('search', {
                                rules: [{ required: false, message: '请输入搜索内容' }],
                            })(
                                <Search
                                    placeholder="搜索"
                                    onSearch={value => console.log(value)}
                                    style={{ width: 200 }}
                                />,
                            )}
                        </Form.Item>
                        <Form.Item label="时间跨度:">
                            {getFieldDecorator('workshop', {
                                rules: [{ required: false, message: '请选择时间跨度' }],
                            })(
                                <Select
                                    mode="multiple"
                                    size="default"
                                    placeholder="选择时间跨度"
                                    style={{ width: 200 }}
                                >
                                    {children}
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="车间:">
                            {getFieldDecorator('workshop', {
                                rules: [{ required: false, message: '请选择车间' }],
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
                        <Form.Item label="设备型号:">
                            {getFieldDecorator('equipmentType', {
                                rules: [{ required: false, message: '请选择设备型号' }],
                            })(
                                <Select
                                    mode="multiple"
                                    size="default"
                                    placeholder="选择设备型号"
                                    style={{ width: 200 }}
                                >
                                    {children}
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="产品:">
                            {getFieldDecorator('product', {
                                rules: [{ required: false, message: '请选择产品' }],
                            })(
                                <Select
                                    mode="multiple"
                                    size="default"
                                    placeholder="选择产品"
                                    style={{ width: 200 }}
                                >
                                    {children}
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label={<div></div>} colon={false}>
                            <Button className="filter-submit" type="primary" htmlType="submit">更新</Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className="subtitle-panel data-report">
                    <div className="bottom-botton-panel">
                        <div className="button-panel">
                            <div className="button" onClick={(e)=>this.changeFilter(e)}>
                                {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}

                            </div>
                            <div className="button" onClick={this.pingFilters.bind(this)}>
                                {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
    toDevice = ()=> {
        this.props.history.push({pathname:'/abnormalStatistics/deviceParams',state:{}})
    }
    toParamShow = ()=> {
        this.props.history.push({pathname:'/abnormalStatistics/paramShow',state:{}})
    }
    render() {
        const { columns, data, isPingFilters } = this.state;
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
        return (
            <div className="param-stand-maintenance">
                { isPingFilters ?
                    <Affix offsetTop={0}>
                        {this.renderFilters()}
                    </Affix> :
                    <div> { this.renderFilters()} </div>
                }
                <div className="main-panel">
                    <div className="operate">
                        <span>设备参数监控列表 (12)</span>
                        <div className="flex-space-between">
                           <i className="sap-icon icon-settings"  style={{margin:'3px 5px 0'}}></i>
                        </div>
                    </div>
                    <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
                    <div className="operate" style={{marginTop:12}}>
                        <span>设备参数监控图 (12)</span>
                    </div>
                    <Bar/>
                </div>
            </div>
        );
    }
}
const WrappedParamStandMaintenance = Form.create({ name: 'params_search' })(ParamStandMaintenance);
export default WrappedParamStandMaintenance;
