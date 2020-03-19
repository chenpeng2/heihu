import React, { PureComponent } from 'react';
import { Page, Navbar, Card, CardHeader, CardContent,CardFooter, Actions, Progressbar, ListItem, List } from 'framework7-react';
import './index.less';

import Line from './components/line'
import Doughnut from './components/doughnut'
import ActionInner from '../board/components/action-inner';

import { connect } from 'react-redux'

class GmPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,

        flowData: {},
        dept: {},
        appoint: {},
        sstk: {},
        chartData_a: null,
        chartData : null,

        finishTime: '',
        estimateTime: '',

        actionOpend_a: false,
        actionOpend: false,
        dept_a: '全部',
        dept_e: '全部',
        depts_a: ['全部', 'XDK', 'SSTK'],
        depts: ['全部', 'XDK', 'SSTK']
      };
    }

    getOverview() {
        window.axios({
            url: `/chart/gm/monitor/overview`,
            success: (res => {
              if (res && res.code === 0) {
                const flowData = JSON.parse(res.data)
                this.setState({
                    flowData
                })
              }
            })
        })
    }

    getAppointment() {
        window.axios({
            url: `/chart/gm/appointment`,
            success: (res => {
              if (res && res.code === 0) {
                const appoint = JSON.parse(res.data)
                this.setState({
                    appoint
                })
              }
            })
        })
    }

    getFinished(department) {
        const departmentParam = department ? `?department=${department}` : ''
        window.axios({
            url: `/chart/gm/order/finished${departmentParam}`,
            success: (res => {
              if (res && res.code === 0) {
                const finished = JSON.parse(res.data)
                console.log(finished)
                this.setState({
                    finishTime: finished[0].date + '-' + finished[finished.length-1].date,
                    chartData_a: this.formatFinishChartData(finished)
                })
              }
            })
        })
    }

    getEstimate(department) {
        const departmentParam = department ? `?department=${department}` : ''
        window.axios({
            url: `/chart/gm/order/estimate${departmentParam}`,
            success: (res => {
              if (res && res.code === 0) {
                const estimate = JSON.parse(res.data)
                this.setState({
                    estimateTime: estimate[0].date + '-' + estimate[estimate.length-1].date,
                    chartData: this.formatChartData(estimate)
                })
              }
            })
        })
    }

    formatFinishChartData(data) {
        if(!data || !data.length ) {
            return null
        }
        let chartData = {
            legend: ['收货'],
            Ylist: [],
            series: [[]]
        }
        data.map( (item) => {
            chartData.Ylist.push(item.date);
            chartData.series[0].push(item.received);
        })
        return chartData
    }

    formatChartData(data) {
        if(!data || !data.length ) {
            return null
        }
        let chartData = {
            legend: ['箱数', '预约数量', 'PO数量'],
            Ylist: [],
            series: [[], [], []]
        }
        data.map( (item) => {
            chartData.Ylist.push(item.date);
            chartData.series[0].push(item.unit);
            chartData.series[1].push(item.appointmentCount);
            chartData.series[2].push(item.poCount);
        })
        return chartData
    }

    getSummary() {
        window.axios({
            url: `/chart/gm/summary`,
            success: (res => {
              if (res && res.code === 0) {
                const dept = JSON.parse(res.data)
                this.setState({
                    dept
                })
              }
            })
        })
    }

    getPickingWhs() {
        window.axios({
            url: '/sstk/chart/sstk/picking/whs',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const sstk = JSON.parse(res.data);
                this.setState({ sstk })
            })
        })
    }

    parseStr(str) {
        if(typeof str !== 'string') {
            return {}
        }
        return JSON.parse(str)
    }

    actionClick_a = (item, key) => {
        this.setState({
            dept_a: item
        });
        this.refs.actionsPop_a.close();
        this.getFinished(key === 0 ? '' : item)
    }

    actionClick = (item, key) => {
        this.setState({
            dept_e: item
        });
        this.refs.actionsPop.close();
        this.getEstimate(key === 0 ? '' : item)
    }

    FormatFlowData(obj) {
        if(!obj) {
            return null
        }
        return [obj.g, obj.r, obj.y]
    }

    navigatePage(id, name) { 
        this.$f7router.navigate('/actual-board/', {
          props: {
            depart: { id: id, name: name }
          }
        })  // 部门链接到实时看板
      }

    componentDidMount() {
        this.getPickingWhs()
        this.getOverview();
      this.getSummary();
      this.getAppointment();
      this.getEstimate();
      this.getFinished();
    }

    render() {
        const {sstk, flowData, chartData, chartData_a, load, dept, appoint, dept_e, dept_a, depts, depts_a, actionOpend, actionOpend_a, estimateTime, finishTime } = this.state;
        const RecDes = this.parseStr(dept.RecDes);
        const PicPicd = this.parseStr(dept.PicPicd);
        const ShipShipdu = this.parseStr(dept.ShipShipdu);
        const ShipShipdt = this.parseStr(dept.ShipShipdt);
        const SSTKRec = this.parseStr(dept.SSTKRec);
        // const SSTKShipd = this.parseStr(dept.SSTKShipd);
        const { fillingStoredRate, receivingStoredRate, shippingStoredRate } = dept;
        const XDK = this.parseStr(appoint.XDK);
        const SSTK = this.parseStr(appoint.SSTK);

      return (
        <Page onPageAfterIn={ () => this.setState({ load: true }) } className="gm-page">
            <Navbar backLink="主页" title="GM"></Navbar>
            <Card>
                <div className="flow-box">
                    <div className="receiving dept">
                        <div className="ring">
                            <Doughnut data={ this.FormatFlowData(flowData.receipting) } />
                            <i className="sap-icon icon-add-product"></i>
                        </div>
                        <div className="line"></div>
                        <i className="sap-icon icon-process"></i>
                        收货部
                    </div>
                    <div className="picking dept">
                        <div className="ring">
                            <Doughnut data={ this.FormatFlowData(flowData.filling) } />
                            <i className="sap-icon icon-customer-and-supplier"></i>
                        </div>
                        <div className="line"></div>
                        <i className="sap-icon icon-process"></i>
                        分货部
                    </div>
                    <div className="shipping dept">
                        <div className="ring">
                            <Doughnut data={ this.FormatFlowData(flowData.shipping) } />
                            <i className="sap-icon icon-offsite-work"></i>
                        </div>
                        <div className="line"></div>
                        <i className="sap-icon icon-process"></i>
                        出货部
                    </div>
                    <div className="stable dept">
                        <div className="ring">
                            <Doughnut />
                            <i className="sap-icon icon-fridge"></i>
                        </div>
                        <div className="line"></div>
                        <i className="sap-icon icon-process"></i>
                        稳定库存
                    </div>
                    <div className="legend-box">
                        <div className="item">
                            <div className='bar' style={{background: '#DC0D0E'}}></div> 拥堵
                        </div>
                        <div className="item">
                            <div className='bar' style={{background: '#DE890D'}}></div> 可能拥堵
                        </div>
                        <div className="item">
                            <div className='bar' style={{background: '#3FA45B'}}></div> 通畅
                        </div>
                        <div className="item">
                        <i className="sap-icon icon-process" style={{marginRight: '6px'}}></i> 流速合适
                        </div>
                    </div>
                </div>
            </Card>
            <div className="part-name">已完成项目</div>
            <Card className="completed">
                <CardHeader>
                    <div className="top">
                        <div className="title"><span>收货部</span> |  已收货箱数</div>
                        <div className="info">
                            <div className="data">{ RecDes.distributed } <span style={{ fontSize: '16px' }}>{ RecDes.utd }</span></div>
                            <div className="metas">
                                <div className="meta">
                                    缓存区利用率
                                    <div className="strong">{ typeof receivingStoredRate === 'undefined' ? '--' : parseInt(receivingStoredRate * 100) + '%' }</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="cnt-box">
                        <span>待收货箱数</span>
                        <span className="strong">{ RecDes.valid + RecDes.utd }</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="progressbar-box">
                        <Progressbar color='blue' progress={ typeof RecDes.rate === 'undefined' ? 0 : ( RecDes.rate >= 1 ? 100 : RecDes.rate*100 ) }></Progressbar>
                        <span className="progress-label">{ typeof RecDes.rate === 'undefined' ? '--' : parseInt(RecDes.rate * 100 ) }%</span>
                    </div>
                </CardFooter>
            </Card>
            <div onClick={ (e) => this.navigatePage(0, '分货部', e) }>
                <Card className="completed">
                    <CardHeader>
                        <div className="top">
                            <div className="title"><span>分货部</span> |  已分拣箱数</div>
                            <div className="info">
                                <div className="data">{ PicPicd.shipping } <span style={{ fontSize: '16px' }}>{ PicPicd.utd }</span></div>
                                <div className="metas">
                                    <div className="meta">
                                        缓存区利用率
                                        <div className="strong">{ typeof fillingStoredRate === 'undefined' ? '--' : parseInt(fillingStoredRate * 100) + '%' }</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="cnt-box">
                            <span>待分拣箱数</span>
                            <span className="strong">{ PicPicd.waiting + PicPicd.utd }</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="progressbar-box">
                            <Progressbar color='blue' progress={ typeof PicPicd.rate === 'undefined' ? 0 : ( PicPicd.rate >= 1 ? 100 : PicPicd.rate*100 ) }></Progressbar>
                            <span className="progress-label">{ typeof PicPicd.rate === 'undefined' ? '--' : parseInt(PicPicd.rate * 100 ) }%</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div onClick={ (e) => this.navigatePage(1, '出货部', e) }>
                <Card className="completed">
                    <CardHeader>
                        <div className="top">
                            <div className="title"><span>出货部</span> |  已出货箱数</div>
                            <div className="info">
                                <div className="data">{ ShipShipdu.shipping } <span style={{ fontSize: '16px' }}>{ ShipShipdu.utd }</span></div>
                                <div className="metas">
                                    <div className="meta">
                                        缓存区利用率
                                        <div className="strong">{ typeof shippingStoredRate === 'undefined' ? '--' : parseInt(shippingStoredRate * 100) + '%' }</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="cnt-box">
                            <span>待出货箱数</span>
                            <span className="strong">{ ShipShipdu.waiting + ShipShipdu.utd }</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="progressbar-box">
                            <Progressbar color='blue' progress={ typeof ShipShipdu.rate === 'undefined' ? 0 : ( ShipShipdu.rate >= 1 ? 100 : ShipShipdu.rate*100 ) }></Progressbar>
                            <span className="progress-label">{ typeof ShipShipdu.rate === 'undefined' ? '--' : parseInt(ShipShipdu.rate * 100 ) }%</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div onClick={ (e) => this.navigatePage(1, '出货部', e) }>
                <Card className="completed">
                    <CardHeader>
                        <div className="top">
                            <div className="title"><span>出货部</span> |  已出货柜数</div>
                            <div className="info">
                                <div className="data">{ ShipShipdt.shipped } <span style={{ fontSize: '16px' }}>{ ShipShipdt.utd }</span></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="cnt-box">
                            <span>正在装载柜数</span>
                            <span className="strong">{ ShipShipdt.loading + ShipShipdt.utd }</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="progressbar-box">
                            <Progressbar color='blue' progress={ typeof ShipShipdt.rate === 'undefined' ? 0 : ( ShipShipdt.rate >= 1 ? 100 : ShipShipdt.rate*100 ) }></Progressbar>
                            <span className="progress-label">{ typeof ShipShipdt.rate === 'undefined' ? '--' : parseInt(ShipShipdt.rate * 100 ) }%</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div onClick={ (e) => this.$f7router.navigate('/stable/') }>
                <Card className="completed">
                    <CardHeader>
                        <div className="top">
                            <div className="title"><span>稳定库存</span> |  已收货箱数</div>
                            <div className="info">
                                <div className="data">{ SSTKRec.received } <span style={{ fontSize: '16px' }}>{ SSTKRec.utd }</span></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="cnt-box">
                            <span>待收货箱数</span>
                            <span className="strong">{ SSTKRec.waiting + SSTKRec.utd }</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="progressbar-box">
                            <Progressbar color='blue' progress={  typeof SSTKRec.rate === 'undefined' ? 0 : ( SSTKRec.rate >= 1 ? 100 : SSTKRec.rate*100 ) }></Progressbar>
                            <span className="progress-label">{ typeof SSTKRec.rate === 'undefined' ? '--' : parseInt(SSTKRec.rate * 100 ) }%</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div onClick={ (e) => this.$f7router.navigate('/stable/') }>
                <Card className="completed">
                    <CardHeader>
                        <div className="top">
                            <div className="title"><span>稳定库存</span> |  已分拣箱数</div>
                            <div className="info">
                                <div className="data">{ sstk.finished } <span style={{ fontSize: '16px' }}>{ sstk.utd }</span></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="cnt-box">
                            <span>待分拣箱数</span>
                            <span className="strong">{ sstk.rest + sstk.utd }</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="progressbar-box">
                            <Progressbar color='blue' progress={ typeof sstk.rate === 'undefined' ? 0 : ( sstk.rate >= 1 ? 100 : sstk.rate*100 ) }></Progressbar>
                            <span className="progress-label">{ typeof sstk.rate === 'undefined' ? '--' : parseInt(sstk.rate * 100 ) }%</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="part-name">预约项目</div>
            <Card>
                <CardHeader>XDK 预约</CardHeader>
                <CardContent>
                <List simple-list className="list-with-meida">
                    <ListItem header="预约箱数" after={ XDK.unit + XDK.unit_utd }>
                        <i slot="media" className="sap-icon icon-add-product"></i>
                    </ListItem>
                    <ListItem header="预约数量" after={ XDK.count + XDK.count_utd }>
                        <i slot="media" className="sap-icon icon-activity-item"></i>
                    </ListItem>
                    <ListItem header="PO数量" after={ XDK.po + XDK.po_utd }>
                        <i slot="media" className="sap-icon icon-sales-order"></i>
                    </ListItem>
                </List>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>SSTK 预约</CardHeader>
                <CardContent>
                <List simple-list className="list-with-meida">
                    <ListItem header="预约箱数" after={ SSTK.unit + SSTK.unit_utd }>
                        <i slot="media" className="sap-icon icon-add-product"></i>
                    </ListItem>
                    <ListItem header="预约数量" after={ SSTK.count + SSTK.count_utd }>
                        <i slot="media" className="sap-icon icon-activity-item"></i>
                    </ListItem>
                    <ListItem header="PO数量" after={ SSTK.po + SSTK.po_utd }>
                        <i slot="media" className="sap-icon icon-sales-order"></i>
                    </ListItem>
                </List>
                </CardContent>
            </Card>

            <div className="part-name">趋势图</div>
            <Card>
                <CardHeader>
                    <div className="title"><span>已完成</span> |  过去七天</div>
                    <div style={{ fontSize: '14px' }}>{ finishTime }</div>
                </CardHeader>
                <CardContent>
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ marginRight: '10px' }}>箱数</span>
                        <span 
                            className="select-link"
                            onClick={ () => this.refs.actionsPop_a.open() }
                            >{ dept_a }<i className="sap-icon icon-slim-arrow-down"></i></span>
                    </div>
                    {
                        load && chartData_a ?
                        <Line solid={true} chartData={chartData_a} /> : ''
                    }
                    <Actions ref="actionsPop_a" onActionsOpen={ ()  => this.setState({ actionOpend_a: true }) }>
                        {
                            actionOpend_a ? 
                            <ActionInner
                                name="storeSelect"
                                handleClick={ this.actionClick_a } 
                                list={ depts_a } /> : ''
                        }
                    </Actions>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="title"><span>预约</span> |  未来七天</div>
                    <div style={{ fontSize: '14px' }}>{ estimateTime }</div>
                </CardHeader>
                <CardContent>
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ marginRight: '10px' }}>箱数</span>
                        <span 
                            className="select-link"
                            onClick={ () => this.refs.actionsPop.open() }
                            >{ dept_e }<i className="sap-icon icon-slim-arrow-down"></i></span>
                    </div>
                    {
                        load && chartData ?
                        <Line chartData={chartData} /> : ''
                    }
                    <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                        {
                            actionOpend ? 
                            <ActionInner
                                handleClick={ this.actionClick } 
                                list={ depts } /> : ''
                        }
                    </Actions>
                </CardContent>
            </Card>
        </Page>
      )
    }
};
const mapDispatch = (dispatch) => {
  return {
      
  }
}

const mapState = (state) => {
  return {
  }
}

export default connect(mapState, mapDispatch)(GmPage)