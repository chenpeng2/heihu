import React, { PureComponent } from 'react';
import { Table, Checkbox, Breadcrumb, Button, Affix, Select, Anchor, Input, Icon } from 'antd';
import Line from '@src/components/chart/line';
const { Option } = Select;
const { Link } = Anchor;
class ParamShow extends PureComponent {
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
                title: '异常温度',
                dataIndex: 'temperature',
            },
            {
                title: '起始时间',
                dataIndex: 'startTime',
                render: text => <a>{text}</a>,
                defaultSortOrder: 'descend',
                sorter: (a, b) => a.name - b.name,
            },
            {
                title: '产品',
                dataIndex: 'product',
            },
            {
                title: '实际值',
                dataIndex: 'actualValue',
            },
            {
                title: '标准范围',
                dataIndex: 'standardRange',
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
              temperature: '温度一',
              startTime: '2019/6-01 12:01:09',
              product: 'Name',
              actualValue: '250度',
              standardRange: '220-230度',
              abnormalReason: 'XXX',
              remarks: 'XXX',
            },
            {
                key: '2',
                num: 3,
                temperature: '温度一',
                startTime: '2019/6-01 12:01:09',
                product: 'Name',
                actualValue: '250度',
                standardRange: '220-230度',
                abnormalReason: 'XXX',
                remarks: 'XXX',
            }
        ],
        isShowFilter: true,
        isPingFilters: false,
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
    renderFilters() {
        const { isShowFilter, isPingFilters } = this.state;
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
        return (
            <div>
              <div className="create-device-page">
                <div className="fixed-panel">
                  <Breadcrumb>
                    <Breadcrumb.Item><a href="#" onClick={ (e) => { this.props.history.goBack() } }>异常统计</a></Breadcrumb.Item>
                    <Breadcrumb.Item>参数呈现</Breadcrumb.Item>
                  </Breadcrumb>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Robot Arm Series 9</h1>
                    <div className="btn-group">
                      <Button onClick={ () => this.props.history.push('/deviceCreate/111/edit') } type="primary">编辑</Button>
                      <Button>删除</Button>
                      <Button onClick={ () => this.props.history.push('/deviceCreate/111/copy') }>复制</Button>
                    </div>
                  </div>
                  <div className="info" style={{display: isShowFilter ? "flex" : "none"}}>
                    <div style={{ width: '80px', height: '80px', background: '#dcdcdc', marginRight: '20px' }}></div>
                    <div>
                      <div style={{marginBottom: '20px'}}><span>类型:</span>Robotech</div>
                      <div><span>编码:</span>Florida, OL</div>
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
                <Anchor affix={false}>
                  <ul>
                    <li className="active"><Link href="#basic-information" title="模具温度" /></li>
                    <li><Link href="#parameter-standard" title="参数名称" /></li>
                    <li><Link href="#basic-information" title="参数名称" /></li>
                    <li><Link href="#parameter-standard" title="参数名称" /></li>
                    <li><Link href="#basic-information" title="参数名称" /></li>
                    <li><Link href="#parameter-standard" title="参数名称" /></li>
                  </ul>
                </Anchor>
              </div>
              {/*表格图标内容*/}
              <div className="all-contents"  id="basic-information">
                <div className="content-item">
                  <div className="head">
                    <span>模具温度</span>
                  </div>
                  <div className="cont">
                    <div className="table-header">
                      <div>
                        <span className="span">参数组名称</span>
                        <Select
                            size="default"
                            placeholder="一小时内"
                            style={{ width: 200 }}
                        >
                          <Option key='1'>一小时内</Option>
                        </Select>
                      </div>
                      <div className="flex-space-between">
                        <Input placeholder="Search"
                               suffix={
                                 <Icon type="search" />
                               }
                               style={{ width: '180px',margin:'0 12px 12px 0',cursor:'pointer' }}
                        />
                        <i className="sap-icon icon-settings" style={{margin:'3px 5px 0'}}></i>
                      </div>
                    </div>
                    <div className="table">
                      <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
                    </div>
                  </div>
                </div>
                <div className="content-item" id="parameter-standard">
                  <div className="head">
                    <span>参数标准</span>
                  </div>
                  <div className="cont">
                    <div className="operate">
                      <span>参数标准 (12)</span>
                      <div>
                        <a href="#">
                          <i className="sap-icon icon-settings"></i>
                        </a>
                      </div>
                    </div>
                    <div className="chart">
                      <Line/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )
    }
  render() {
    const { isShowFilter, isPingFilters } = this.state;
    return (
        <div className="abnormal-statistics back-color">
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

export default ParamShow;
