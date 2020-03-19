import React, { PureComponent } from 'react';
import { Form, Input, Select, Button, Table, Icon, Affix } from 'antd';
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
                    dataIndex: 'equipmentNumber',
                    render: text => <a>{text}</a>,
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.name - b.name,
                },
                {
                    title: ' 订单号',
                    dataIndex: 'orderNumber',
                },
                {
                    title: '挤出速度',
                    dataIndex: 'extrusionSpeed',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'0',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '螺旋转速',
                    dataIndex: 'screwSpeed',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'1',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '牵引速度',
                    dataIndex: 'tractionSpeed',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'2',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '熔温',
                    dataIndex: 'fusionTemperature',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'3',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '熔压',
                    dataIndex: 'fusionPressure',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'4',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '1-5温区',
                    dataIndex: 'lWarmArea',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'5',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '6-20温区',
                    dataIndex: 'hWarmArea',
                    render: (text,row) => <div>报警<span style={{color:'#00af98',margin:'0 4px'}} onClick={this.clickRow.bind(this,'6',row.equipmentNumber)}>{text}</span>次</div>,
                },
                {
                    title: '',
                    dataIndex: 'nextGo',
                    render: (text,row) => <Icon type="right" onClick={this.clickRow.bind(this,'',row.equipmentNumber)}/>,
                    width: 80,
                }
            ],
            data: [
                {
                    key: '1',
                    num: 3,
                    equipmentNumber: '6000093070',
                    orderNumber: '0121093',
                    extrusionSpeed: '8',
                    screwSpeed: '8',
                    tractionSpeed: '8',
                    fusionTemperature: '8',
                    fusionPressure: '8',
                    lWarmArea: '8',
                    hWarmArea: '9',
                },
                {
                    key: '2',
                    num: 3,
                    equipmentNumber: '60000943070',
                    orderNumber: '0121093',
                    extrusionSpeed: '8',
                    screwSpeed: '8',
                    tractionSpeed: '8',
                    fusionTemperature: '8',
                    fusionPressure: '8',
                    lWarmArea: '8',
                    hWarmArea: '9',
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
            // console.log('Received values of form: ', fieldsValue);
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
    clickRow = (index,equipmentNumber)=> {
        this.props.history.push({pathname:'/abnormalStatistics/deviceParamsDetail',state:{tabIndex:index,equipmentNumber}})
    }
    renderFilters() {
        const { isShowFilter, isPingFilters } = this.state;
        const { getFieldDecorator } = this.props.form;
        const children = [<Option key='1'>车间1</Option>, <Option key='2'>车间2</Option>];
        return (
            <div className="filter-panel">
                <div className="flex-container"  style={{display: isShowFilter ? "flex" : "none"}}>
                    <Form layout="inline" onSubmit={this.handleSubmit}>
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
                        <Form.Item label="设备编码:">
                            {getFieldDecorator('equipmentNumber', {
                                rules: [{ required: false, message: '请选择设备编码' }],
                            })(
                                <Select
                                    size="default"
                                    placeholder="请选择设备编码"
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
                                    size="default"
                                    placeholder="选择产品"
                                    style={{ width: 200 }}
                                >
                                    {children}
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label="生产订单:">
                            {getFieldDecorator('productOrder', {
                                rules: [{ required: false, message: '请选择生产订单' }],
                            })(
                                <Select
                                    size="default"
                                    placeholder="请选择生产订单"
                                    style={{ width: 200 }}
                                >
                                    {children}
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item label={<div></div>} colon={false}>
                            <Button className="filter-submit" type="primary" htmlType="submit">查询</Button>
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
                            {/*<i className="sap-icon icon-settings"  style={{margin:'3px 5px 0'}}></i>*/}
                        </div>
                    </div>
                    <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}
                           // onRow={(record) => {
                           //     return {
                           //         onClick: this.clickRow.bind(this)
                           //     }
                           // }}
                    />
                </div>
            </div>
        );
    }
}
const WrappedParamStandMaintenance = Form.create({ name: 'params_search' })(ParamStandMaintenance);
export default WrappedParamStandMaintenance;
