import React, { PureComponent } from 'react';
import { Table, Checkbox, Breadcrumb, Button, Affix, Select, Anchor, Input, Icon, Tabs, Modal } from 'antd';
import PointChar from '@src/components/chart/pointLine';
import OneEditTable from '@src/components/antdEditTable/oneEdit';
const { Option } = Select;
const { Link } = Anchor;
const { TabPane } = Tabs;
const {Search}=Input;
class PointChart extends PureComponent {
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
                    title: '起始时间',
                    dataIndex: 'startTime',
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.name - b.name,
                },
                {
                    title: '结束时间',
                    dataIndex: 'endTime',
                },
                {
                    title: '产品',
                    dataIndex: 'product',
                    render: text => <a>{text}</a>,
                },
                {
                    title: '当前范围',
                    dataIndex: 'nowRange',
                },
                {
                    title: '标准范围',
                    dataIndex: 'standardRange',
                    render: text => <a>{text}</a>,
                },
                {
                    title: '异常原因',
                    dataIndex: 'abnormalReason',
                },
                {
                    title: '备注',
                    dataIndex: 'remarks',
                }
            ],
            data: [
                {
                    key: '1',
                    num: 3,
                    startTime: '2019/6-01 12:01:09',
                    endTime: '2019/6-01 12:01:09',
                    product: 'Name',
                    nowRange: '220-230度',
                    standardRange: '220-230度',
                    abnormalReason: 'XXX',
                    remarks: 'XXX',
                },
                {
                    key: '2',
                    num: 3,
                    startTime: '2019/6-01 12:01:09',
                    endTime: '2019/6-01 12:01:09',
                    product: 'Name',
                    nowRange: '220-230度',
                    standardRange: '220-230度',
                    abnormalReason: 'XXX',
                    remarks: 'XXX',
                }
            ],
            isShowFilter: true,
            isPingFilters: false,
            visible: false,
        }
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
    renderFilters() {
        const { isShowFilter, isPingFilters } = this.state;
        const {columns, data } = this.state;
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
            <div>
                <div className="create-device-page">
                    <div className="fixed-panel">
                        <div>
                            <h1>Robot Arm Series 9</h1>
                            <span>48865</span>
                        </div>
                        <div className="info" style={{display: isShowFilter ? "flex" : "none"}}>
                            <div style={{ width: '80px', height: '80px', background: '#dcdcdc', marginRight: '20px' }}></div>
                            <div className="head-params"  style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div><span>Manafacturer:</span>Robotech</div>
                                    <div  style={{margin: '10px 0'}}><span>Factory:</span>Florida, OL</div>
                                    <div><span>Supplier:</span>Florida, OL</div>
                                </div>
                                <div>
                                    <div><span>产品:</span>Robotech</div>
                                    <div style={{margin: '10px 0'}}><span>模具:</span>Florida, OL</div>
                                    <div><span>产线:</span>Florida, OL</div>
                                </div>
                                <div>
                                    <div>状态:</div>
                                    <p className="statu">运转</p>
                                </div>
                                <div>
                                    <div>参数异常:</div>
                                    <p className="abnormal">无异常</p>
                                </div>
                                <div>
                                    <div>Key Value:</div>
                                    <p className="value">379.99</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="subtitle-panel data-report">
                        <div className="bottom-botton-panel">
                            <div className="button-panel">
                                <div className="button" onClick={(e)=>this.changeFilter(e)}>
                                    {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}

                                </div>
                                {isShowFilter
                                &&<div className="button" onClick={this.pingFilters.bind(this)}>
                                    {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="all-tabs">
                    <Tabs defaultActiveKey="1" onChange={(e)=>console.log(e)}>
                        <TabPane tab="参数组名称" key="1">
                            {/*表格图标内容*/}
                            <div className="all-contents">
                                <div className="content-item">
                                    <div className="head2">
                                        <span className="title">A温度趋势</span>
                                        <Select
                                            size="default"
                                            placeholder="选择车间"
                                            style={{ width: 200,marginLeft:14 }}
                                        >
                                            <Option key='1'>车间1</Option>
                                            <Option key='2'>车间2</Option>
                                        </Select>
                                    </div>
                                    <div className="cont">
                                        <div className="chart">
                                            <PointChar/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="参数名称" key="2">
                            Content of Tab Pane 2
                        </TabPane>
                        <TabPane tab="参数名称" key="3">
                            Content of Tab Pane 3
                        </TabPane>
                        <TabPane tab="参数名称" key="4">
                            Content of Tab Pane 1
                        </TabPane>
                    </Tabs>
                </div>
                <Modal
                    className="edit-modal"
                    closable={false}
                    centered={true}
                    visible={this.state.visible}
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
        )
    }
    render() {
        const { isShowFilter, isPingFilters } = this.state;
        return (
            <div className="equipment-monitoring back-color">
                { isPingFilters ?
                    <Affix offsetTop={0}>
                        {this.renderFilters()}
                    </Affix> :
                    <div> { this.renderFilters()} </div>
                }
            </div>

        );
    }
}

export default PointChart;
