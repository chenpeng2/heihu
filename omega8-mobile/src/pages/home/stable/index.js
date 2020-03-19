import React, { PureComponent } from 'react';
import { Page, Navbar, Card, CardHeader, CardContent,CardFooter, Actions, Progressbar, ListItem, List, Preloader } from 'framework7-react';
import './index.less';

import { connect } from 'react-redux'

import ActionInner from '../board/components/action-inner'

class GmPage extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        load: false,
        actionOpend: false,
        actionOpend_1: false,
        searchText: '',

        total: '--',
        rest: '--',

        whId: '全部',
        whIds: ['全部'],

        store: '小店+本地店',
        stores: ['小店+本地店', '小店', '本地店'],

        pickingWhs: {},
        pickingStore: {},
        storeInfo: {},
        overview: {},

        stack: {},
        stackPage: 1,

        timeout: {}
      };
    }

    actionClick = (item, key) => {  
        this.getPickingWhs( key === 0 ? '' : item.replace('分拣区', '') );
        this.setState({ whId: item })
        this.refs.actionsPop.close()
    }

    actionClickStore = (item, key) => {
        key === 0 ? this.getPickingStoretype() : this.getPickingStoretype(key === 2)
        this.setState({ store: item })
        this.refs.actionsPop_1.close()
    }

    getWarehouseList(callback) {
        window.axios({
            url: '/statistic/sstk/warehouselist',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data);
                const whs = data.whs;
                if(!whs || !whs.length) {
                    return
                }
                const whids = this.state.whIds;
                this.setState({
                    whIds: whids.concat( whs.map((item) => {
                        return '分拣区' + item
                    }) )
                })
                callback && callback(whs[0])
            })
        })
    }

    getPickingStoretype(islocal) {
        const url = typeof islocal === 'undefined' ? '' : '?islocal=' + islocal
        window.axios({
            url: '/sstk/chart/sstk/picking/storetype' + url,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const pickingStore = JSON.parse(res.data);
                this.setState({ pickingStore })
            })
        })
    }

    getPickingWhs(whsid) {
        const isUndef = typeof whsid === 'undefined';
        const url = isUndef ? '' : '?whsid=' + whsid
        window.axios({
            url: '/sstk/chart/sstk/picking/whs' + url,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const pickingWhs = JSON.parse(res.data)
                if(isUndef) {
                    this.setState({
                        total: pickingWhs.finished,
                        rest: pickingWhs.rest
                    })
                }
                this.setState({ pickingWhs })
            })
        })
    }

    searchStore = (e) => {
        e && e.stopPropagation();
        const value = this.refs.searchInput.value;
        if(typeof value !== 'string' || value === '') {
            return
        }
        this.getStoreInfo(value)
    }

    handleChange = (e) => {
        this.setState({searchText: e.target.value});
    }

    getStoreInfo(storeid) {
        window.axios({
            url: '/sstk/chart/sstk/picking/store?storeid=' + storeid,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const storeInfo = JSON.parse(res.data)
                this.setState({ storeInfo })
            })
        })
    }

    getOverview() {
        window.axios({
            url: '/sstk/chart/sstk/picking/checking/overview',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const overview = JSON.parse(res.data)
                this.setState({ overview })
            })
        })
    }

    getStacking(pageNum) {
        const total = this.state.stack.total;
        this.setState({ stack : {total: total, result: null }})
        window.axios({
            url: `/sstk/chart/sstk/picking/slot/stacking/detail?pageNum=${pageNum}&pageSize=5`,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const stack = JSON.parse(res.data);
                this.setState({ stack })
            })
        })
    }

    getTimeout() {
        window.axios({
            url: `/sstk/chart/sstk/picking/user/timeout/detail?pageNum=1&pageSize=5`,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const timeout = JSON.parse(res.data);
                this.setState({ timeout })
            })
        })
      }

    componentDidMount() {
        this.getWarehouseList();
        this.getPickingWhs();
        this.getPickingStoretype();
        this.getOverview();
        // this.getStacking(1, 5);
        this.getTimeout();
    }

    render() {
        const {total, rest, pickingWhs, pickingStore, storeInfo, overview, stack, timeout, actionOpend, actionOpend_1, whIds, whId, stores, store, searchText, stackPage } = this.state
      return (
        <Page className="stable-page gm-page board-page">
            <Navbar backLink="主页" title="稳定库存实时看板"></Navbar>
            <div className="swiper-container">
                {/* <div className="top">
                    <span>20 min ago</span>
                </div> */}
                <div className="cnt">
                <div>
                    <div className="strong">{ total }</div>
                        <span>全部完成量</span>
                    </div>
                    <div>
                        <div className="strong">{ rest }</div>
                        <span>未完成量</span>
                    </div>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title"><span>拣货统计数据</span> |  按仓</div>
                        <div className="info">
                            <div className="data">{ pickingWhs.finished } <span style={{ fontSize: '14px' }}>{ pickingWhs.utd }</span> </div>
                        </div>
                        <div className="lable">{ whId }完成量</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <List simple-list className="list-with-meida">
                        <ListItem>
                            <div style={{ width: '100%' }}>
                                <span 
                                className="select-link"
                                onClick={ () => this.refs.actionsPop.open() }
                                >{ whId }<i className="sap-icon icon-slim-arrow-down"></i></span>
                            </div>
                        </ListItem>
                        <ListItem header="需拣货总量" after={ pickingWhs.total + pickingWhs.utd }></ListItem>
                        <ListItem header="正在拣货量" after={ pickingWhs.picking + pickingWhs.utd }></ListItem>
                        <ListItem header="未完成量" after={ pickingWhs.rest + pickingWhs.utd }></ListItem>
                        <ListItem>
                            <div style={{ width: '80%' }}>
                                <Progressbar color='blue' progress={ typeof pickingWhs.rate === 'undefined' ? 0 : ( pickingWhs.rate >= 1 ? 100 : pickingWhs.rate*100 ) } ></Progressbar>
                            </div>
                            <span>{ typeof pickingWhs.rate === 'undefined' ? '--' : parseInt(pickingWhs.rate * 100 ) + '%' }</span>
                        </ListItem>
                    </List>
                    <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                        {
                            actionOpend ? 
                            <ActionInner
                                handleClick={ this.actionClick } 
                                list={ whIds } /> : ''
                        }
                    </Actions>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title"><span>拣货统计数据 </span> |  按店类型</div>
                        <div className="info">
                            <div className="data">{ pickingStore.finished } <span style={{ fontSize: '14px' }}>{ pickingStore.utd }</span></div>
                        </div>
                        <div className="lable">{ store }完成量</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <List simple-list className="list-with-meida">
                        <ListItem>
                            <div style={{ width: '100%' }}>
                                <span 
                                className="select-link"
                                onClick={ () => this.refs.actionsPop_1.open() }
                                >{ store }<i className="sap-icon icon-slim-arrow-down"></i></span>
                            </div>
                        </ListItem>
                        <ListItem header="需拣货总量" after={ pickingStore.total + pickingStore.utd }></ListItem>
                        <ListItem header="正在拣货量" after={ pickingStore.picking + pickingStore.utd }></ListItem>
                        <ListItem header="未完成量" after={ pickingStore.rest + pickingStore.utd }></ListItem>
                        <ListItem>
                            <div style={{ width: '80%' }}>
                                <Progressbar color='blue' progress={ typeof pickingStore.rate === 'undefined' ? 0 : ( pickingStore.rate >= 1 ? 100 : pickingStore.rate*100 ) } ></Progressbar>
                            </div>
                            <span>{ typeof pickingStore.rate === 'undefined' ? '--' : parseInt(pickingStore.rate * 100 ) + '%' }</span>
                        </ListItem>
                    </List>
                    <Actions ref="actionsPop_1" onActionsOpen={ ()  => this.setState({ actionOpend_1: true }) }>
                        {
                            actionOpend_1 ? 
                            <ActionInner
                                name="storeSelect"
                                handleClick={ this.actionClickStore } 
                                list={ stores } /> : ''
                        }
                    </Actions>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">查询单个门店</div>
                        <div className="info" style={{ fontSize: '14px', color: '#666' }}>{ searchText === '' ? '门店号' : searchText }</div>
                    </div>
                </CardHeader>
                <CardContent>
                <List simple-list className="list-with-meida">
                    <ListItem>
                        <div className="search-box">
                            <input onChange={ (e) => this.handleChange(e) } ref="searchInput" className="search-input" type="text" />
                            <i onClick={ (e) => this.searchStore() } className={ (searchText === '' ? '' : 'active') + ' searchbar-icon'}></i>
                        </div>
                    </ListItem>
                    <ListItem header="需拣货总量" after={ storeInfo.total + storeInfo.utd }></ListItem>
                    <ListItem header="正在拣货量" after={ storeInfo.picking + storeInfo.utd }></ListItem>
                    <ListItem header="未完成量" after={ storeInfo.rest + storeInfo.utd }></ListItem>
                    <ListItem>
                        <div style={{ width: '80%' }}>
                            <Progressbar color='blue' progress={ typeof storeInfo.rate === 'undefined' ? 0 : ( storeInfo.rate >= 1 ? 100 : storeInfo.rate*100 ) } ></Progressbar>
                        </div>
                        <span>{ typeof storeInfo.rate === 'undefined' ? '--' : parseInt(storeInfo.rate * 100 ) + '%' }</span>
                    </ListItem>
                </List>
                </CardContent>
            </Card>
            <div onClick={ (e) => this.$f7router.navigate('/stable-road/') }>
                <Card>
                    <CardHeader>
                        <div className="top">
                            <div className="title"><span>追踪拣货 </span> |  拣货路径数量</div>
                            <div className="info">
                                <div className="data">{ overview.tripNum } <span style={{ fontSize: '14px' }}>个</span></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                    <List simple-list className="list-with-meida">
                        <ListItem header="拣货路径箱数量" after={ overview.checkedNum + overview.utd }></ListItem>
                    </List>
                    </CardContent>
                </Card>
            </div>

            {/* <div onClick={ (e) => this.$f7router.navigate('/stable-stack/') }>
                <Card>
                    <CardHeader style={{ alignItems: 'flex-start' }}>
                        <div className="top">
                            <div className="title">主货槽拣货拥堵状况</div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6F7275', textAlign: 'right' }}>
                            { typeof stack.total === 'undefined' ? '-- of --' :  ('5 of ' + stack.total) }
                        </div>
                    </CardHeader>
                    <CardContent style={{ padding: 0, minHeight: '257px' }}>
                        <table className="default-table" cellPadding="0" cellSpacing="0" width="100%">
                            <thead>
                                <tr>
                                    <th width="33%">主货槽ID</th>
                                    <th width="33%">剩余货量({ stack.utd })</th>
                                    <th>拣货人数</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                stack.result ? 
                                (
                                    stack.result.length ?
                                    stack.result.map( (item, key) => 
                                        <tr key={key}>
                                            <td className="strong">{ item.id }</td>
                                            <td>{ item.stackedUnit }</td>
                                            <td>{ item.userCount }</td>
                                        </tr>
                                    ) : <tr><td colSpan='4'>暂无数据</td></tr> 
                                ) : <tr><td colSpan='4'><Preloader /></td></tr>
                            }
                            </tbody>
                        </table>
                            
                    </CardContent>
                </Card>  
            </div> */}

            <div onClick={ (e) => this.$f7router.navigate('/stable-timeout/') }>
                <Card>
                    <CardHeader style={{ alignItems: 'flex-start' }}>
                        <div className="top">
                            <div className="title">拣货超时统计</div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6F7275' }}>
                        { typeof timeout.total === 'undefined' ? '-- of --' :  ('5 of ' + timeout.total) }
                        </div>
                    </CardHeader>
                    <CardContent style={{ padding: 0 }}>
                        <table className="default-table" cellPadding="0" cellSpacing="0" width="100%">
                            <thead>
                                <tr>
                                    <th width="33%">ID</th>
                                    <th width="33%">超时五分钟次数</th>
                                    <th>超时十分钟次数</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                timeout.result ? 
                                (
                                    timeout.result.length ?
                                    timeout.result.map( (item, key) => 
                                        <tr key={key}>
                                            <td className="strong">{ item.userId }</td>
                                            <td>{ item.timeOut5 }</td>
                                            <td>{ item.timeOut10 }</td>
                                        </tr>
                                    ) : <tr><td colSpan='4'>暂无数据</td></tr> 
                                ) : <tr><td colSpan='4'><Preloader /></td></tr>
                            }
                            </tbody>
                        </table>
                            
                    </CardContent>
                </Card>
            </div>
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