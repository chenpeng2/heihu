import React, { PureComponent } from 'react';
import { Breadcrumb, Button, Table, Checkbox, Anchor } from 'antd';
const { Link } = Anchor;
class ViewPage extends PureComponent {
  constructor(props) {
    super(props)
      this.state = {
          name:'标准名称 ',
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
              },
              {
                  title: '标准上限',
                  dataIndex: 'stadardUp',
              },
              {
                  title: '接收通知',
                  dataIndex: 'notice',
                  render: (text, row) =>{
                    return <Checkbox onChange={console.log(1)} disabled={true} checked={row.notice}>Checkbox</Checkbox>
                  }
              },
              {
                  title: '通知优先级',
                  dataIndex: 'priority',
              },
              {
                  title: '通知间隔',
                  dataIndex: 'interval',
              }
          ],
          targetOffset: undefined,
          data: [1,2,3,4,5,6,7,8,9,10,11,12].map( (item, key) => {
              return {
                key: key,
                num: 3,
                name: '600009070',
                MeasurementID: 'CR-D123V09',
                stadardDown: '500009070',
                stadardUp: 'CR-D123V09',
                notice: false,
                priority: '500009070',
                interval: 'CR-D123V09',
              }
            })
      }
  }
    componentDidMount() {
        this.setState({
            targetOffset: window.innerHeight / 2,
        });
    }
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
      return (
          <div className="Vparam-stand-maintenance">
              <div className="header">
                  <div>
                      <Breadcrumb>
                          <Breadcrumb.Item>管理标准</Breadcrumb.Item>
                          <Breadcrumb.Item style={{color:'#427CAC'}}>参数标准</Breadcrumb.Item>
                      </Breadcrumb>
                      <div className="name">
                          {name}
                      </div>
                  </div>
                  <div className="btns">
                      <Button type="primary" style={{background:'#00af98'}} onClick={(e) => this.props.history.push({pathname:'/paramStandMaintenance/editPage',state:{}})}>编辑</Button>
                      <Button onClick={ () => this.props.history.push({pathname:'/paramStandMaintenance',state:{}})}>删除</Button>
                      <i className="sap-icon icon-share" style={{fontSize:20,position:'relative',top:'3px'}}></i>
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
              <div className="all-contents"  id="basic-information">
                  <div className="content-item">
                    <div className="head">
                        <span>基础信息</span>
                    </div>
                    <div className="cont flex">
                        <div className="itm">
                            <label htmlFor="name">标准名称:</label>
                            <div id="name">Robot Arm Series 9</div>
                        </div>
                        <div className="itm">
                            <label htmlFor="name">设备:</label>
                            <div id="name">6 Axis</div>
                        </div>
                        <div className="itm">
                            <label htmlFor="name">产品:</label>
                            <div id="name">White（default）</div>
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
                          <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
                      </div>
                  </div>
              </div>
          </div>
    );
  }
}
export default ViewPage;
