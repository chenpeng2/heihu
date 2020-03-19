import React from "react"
import PropTypes from 'prop-types';

//material component
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
// my component
import ListCard from 'component/tables/ListCard'
import { valueToText, REFRESH_TIME } from 'utils/chartHelper'
import MTable from 'component/tables/MaterialTable'
//action
import request from 'utils/urlHelpers'
import { message } from 'antd'
class ControlPage extends React.Component {

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            pickingData: {
                isLoading: true,
            },
            storeData: {
                isLoading: false,
            },
            checkingData: {
                isLoading: false,
            },
            storeList: {
                isLoading: true,
            },
            stackingData: {
                isLoading: true,
            },
            timeOutData: {
                isLoading: true,
            },
            noSearchData: true,
            defaultPage: {
                pageNum: 0,
                pageSize: 5,
            },
            defaultTimeOutPage: {
                pageNum: 0,
                pageSize: 15,
            },
            whsListData: [
                {
                    selectList: [],
                    type: 'select'
                },
                { title: '需拣货总量', value: '', type: 'text' },
                { title: '正在拣货量', value: '', type: 'text' },
                { title: '未完成量', value: '', type: 'text' },
                { rate: 0, type: 'progress' }
            ],
            storeListData: [
                {
                    selectList: [{
                        title: '小店 + 本地店',
                        value: 'all'
                    }, {
                        title: '小店',
                        value: false
                    }, {
                        title: '本地店',
                        value: true
                    }],
                    type: 'select'
                },
                { title: '需拣货总量', value: '', type: 'text' },
                { title: '正在拣货量', value: '', type: 'text' },
                { title: '未完成量', value: '', type: 'text' },
                { rate: 0.3, type: 'progress' }
            ],
            searchStoreList: [
                { type: 'search', value: '' },
                { title: '需拣货总量', value: '', type: 'text' },
                { title: '正在拣货量', value: '', type: 'text' },
                { title: '未完成量', value: '', type: 'text' },
                { rate: 0, type: 'progress' }
            ],
            pickingColumns: [{
                title: '主货槽ID',
                field: 'id',
                sorting: false,
            }, {
                title: '剩余货量',
                field: 'stackedUnit',
                sorting: false,
            }, {
                title: '拣货人数',
                field: 'userCount',
                sorting: false,
            }],
            columns: [{
                title: 'ID',
                field: 'userId',
                sorting: false,
            }, {
                title: '超时五分钟次数',
                field: 'timeOut5',
                sorting: false,
            }, {
                title: '超时十分钟次数',
                field: 'timeOut10',
                sorting: false,
            }, {
                title: '总计',
                field: 'total',
                sorting: false,
            }]
        }
    }

    getPickingData = (whsId) => {
        const { whsListData } = this.state
        const whsParam = whsId ? `?whsid=${whsId}` : ''
        return request({
            url: `/sstk/chart/sstk/picking/whs${whsParam}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                for (let key in data) {
                    whsListData.forEach(item => {
                        if (valueToText[key] === item.title) {
                            item.value = data[key]
                        }
                        if (item.type === 'progress') {
                            item.rate = data.rate
                        }
                    })
                }
                this.setState({
                    whsListData,
                    pickingData: data,
                })
            } else {
                this.setState({
                    pickingData: {
                        isLoading: false,
                        fetchError: true,
                    },
                })
            }
        })
    }

    getWarehouseList = () => {
        request({
            url: `/statistic/sstk/warehouselist`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                const selectList = [{ title: '全部', value: '' }]
                const { whsListData } = this.state
                data.whs.forEach(item => {
                    selectList.push({
                        title: `分拣区${item}`,
                        value: item,
                    })
                })
                whsListData[0].selectList = selectList
                this.setState({
                    whsListData,
                })
            } else {
                this.setState({
                    overViewData: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
            }
        })
    }

    
    getStoreData = (storeType) => {
        const { storeListData } = this.state
        const storeTypeParam = storeType !== 'all' ? `?islocal=${storeType}` : ''
        request({
            url: `/sstk/chart/sstk/picking/storetype${storeTypeParam}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const storeList = JSON.parse(res.data)
                for (let key in storeList) {
                    storeListData.forEach(item => {
                        if (valueToText[key] === item.title) {
                            item.value = storeList[key]
                        }
                        if (item.type === 'progress') {
                            item.rate = storeList.rate
                        }
                    })
                }
                this.setState({
                    storeListData,
                    storeList,
                })
            } else {
                this.setState({
                    storeListData: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
            }
        })
    }
    getStoreSearchData = (storeId) => {
        const { searchStoreList } = this.state
        request({
            url: `/sstk/chart/sstk/picking/store?storeid=${storeId}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                for (let key in data) {
                    searchStoreList.forEach(item => {
                        if (valueToText[key] === item.title) {
                            item.value = data[key]
                        }
                        if (item.type === 'progress') {
                            item.rate = data.rate
                        }
                    })
                }
                this.setState({
                    noSearchData: false,
                    searchStoreList,
                    storeData: data,
                })
            } else {
                this.setState({
                    storeData: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
            }
        })
    }

    getCheckingData() {
        request({
            url: `/sstk/chart/sstk/picking/checking/overview`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data) 
                this.setState({
                    checkingData: data,
                })
            } else {
                this.setState({
                    appointmentData: {
                        isLoading: false,
                        fetchError: true,
                    },
                })
            }
        })
    }

    getStackingData (pageParam) {
        const { pickingColumns } = this.state
        const pageParams = `?pageNum=${pageParam.pageNum + 1}&pageSize=${pageParam.pageSize}`
        request({
            url: `/sstk/chart/sstk/picking/slot/stacking/detail${pageParams}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                pickingColumns.forEach(column => {
                    if (column.title.search(/\(/) === -1 && column.field === 'stackedUnit') {
                        column.title += `(${data.utd})`
                    }
                }) 
                this.setState({
                    stackingData: data,
                })
            } 
        })
    }

    getTimeOutData (pageParam) {
        const pageParams = `?pageNum=${pageParam.pageNum + 1}&pageSize=${pageParam.pageSize}`
        request({
            url: `/sstk/chart/sstk/picking/user/timeout/detail${pageParams}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data) 
                this.setState({
                    timeOutData: data,
                })
            } 
        })
    }

    setDefaultSelect = () => {
        this.setState({
            setDefaultSelect: true,
        })
    }

    refreshData = () => {
        const { defaultPage, defaultTimeOutPage } = this.state
        const _this = this
        Promise.all(
            [
                _this.getPickingData(),
                _this.getWarehouseList(),
                _this.getCheckingData(),
                _this.getStoreData('all'),
                _this.getStackingData(defaultPage),
                _this.getTimeOutData (defaultTimeOutPage),
                _this.setDefaultSelect()
            ]
        ).then(res => {
            this.setState({
                setDefaultSelect: false,
            })
        }).catch((error) => {
            message.error('数据请求异常！')
        })

    }

    componentDidMount() {
        this.refreshData()
        this.timer = setInterval(this.refreshData, REFRESH_TIME)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

  changePage = (pageParam) => {
    this.setState({
        pageParam,
        setDefaultPageNum: false,
    },() => {
        this.getStackingData(pageParam)
    })
  }

  changetimeOutPage = (pageParam) => {
    this.setState({
        pageParam,
        setDefaultPageNum: false,
    },() => {
        this.getTimeOutData(pageParam)
    })
  }

    getTodetail = (value, keys) => {
        this.props.history.push({
            pathname: `/${value}`,
            state: {
                ...keys,
            }
        })
    }

    clearData = () => {
        this.setState({
            noSearchData: true,
        })
    }

    formateTotal(total) {
        if (total > 100000) {
            return (
                <span>
                    <span className="number">
                        {parseInt(total / 1000)}</span>
                    <span className="text">k</span>
                </span>
            )
        } else {
            return <span className="number">{total}</span>
        }
    }

    render() {
        const { pickingData, stackingData, setDefaultSelect, whsListData, searchStoreList, storeListData, storeList, noSearchData, storeData, checkingData, defaultPage, timeOutData, defaultTimeOutPage } = this.state
        
        return (
            <div>
                <div className="main-panel-light">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6} lg={3}>
                            {pickingData.isLoading ?
                                <div className="loading-content-label margin-bottom-16"> <CircularProgress /> </div>
                                : pickingData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content margin-bottom-16">
                                        <ListCard 
                                            title={'拣货统计数据'} 
                                            getData={this.getPickingData} 
                                            type={'按分拣区'} 
                                            subtitle={'全部完成量'} 
                                            total={pickingData.finished} 
                                            unit={pickingData.utd} 
                                            list={whsListData} 
                                            setDefaultSelect={setDefaultSelect}
                                        />
                                    </Paper>
                            }
                             {storeData.isLoading ?
                                <div className="loading-content-label"> <CircularProgress /> </div>
                                : storeData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content">
                                        <ListCard 
                                            title={'查询单个门店'}
                                            type={''} 
                                            list={searchStoreList} 
                                            getData={this.getStoreSearchData}
                                            noSearchData={noSearchData}
                                            unit={storeData.utd} 
                                            clearData={this.clearData}
                                        />
                                    </Paper>
                            }
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={3}>
                            {storeList.isLoading ?
                                <div className="loading-content-label margin-bottom-16"> <CircularProgress /> </div>
                                : storeList.fetchError ?
                                    <div className="loading-content-label margin-bottom-16">数据出错</div> :
                                    <Paper className="item-content margin-bottom-16">
                                        <ListCard 
                                            title={'拣货统计数据'} 
                                            type={'按店类型'} 
                                            subtitle={'小店 + 本地店完成量'} 
                                            total={storeList.finished} 
                                            unit={storeList.utd} 
                                            list={storeListData} 
                                            getData={this.getStoreData}
                                            setDefaultSelect={setDefaultSelect}
                                            />
                                    </Paper>
                            }
                            {checkingData.isLoading ? 
                                <div className="loading-content-label"> <CircularProgress /> </div>
                                : checkingData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> 
                                    :
                                    <Paper className="item-content">
                                        <ListCard
                                            title={'追踪拣货'}
                                            type={'拣货路径数量'}
                                            goTodetail={this.getTodetail}
                                            detailPath={'SSTKPick'}
                                            total={checkingData.tripNum}
                                            unit={'个'}
                                            list={[{ title: '拣货路径箱数量', value: checkingData.checkedNum || '--', type: 'text', utd: checkingData.utd }]}
                                        />
                                    </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={6}>
                            <Paper className="containerHeight">
                                <div className="table-title" onClick={() => this.getTodetail('pickTimeOut')}>
                                    <div className="left-content">
                                        拣货超时统计
                                    </div>
                                    <div className="right-content">
                                        <div className="item">
                                            <div className="title-little"></div>
                                        </div>
                                    </div>
                                </div>
                                <MTable
                                    defaultPageSize={defaultTimeOutPage.pageSize}
                                    isPreview={true}
                                    columns={this.state.columns}
                                    className="preview-table little-table-700"
                                    canAction={true}
                                    rows={timeOutData}
                                    isLoading={timeOutData.isLoading}
                                    changePage={this.changetimeOutPage}
                                    setDefaultSelect={setDefaultSelect}
                                />
                            </Paper>
                        </Grid>
                        {/* <Grid item xs={12} sm={6} md={4} lg={3}>
                            {checkingData.isLoading ? 
                                <div className="loading-content-label"> <CircularProgress /> </div>
                                : checkingData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> 
                                    :
                                    <Paper className="item-content">
                                        <ListCard
                                            title={'追踪拣货'}
                                            type={'拣货路径数量'}
                                            goTodetail={this.getTodetail}
                                            detailPath={'SSTKPick'}
                                            total={checkingData.tripNum}
                                            unit={'个'}
                                            list={[{ title: '拣货路径箱数量', value: checkingData.checkedNum || '--', type: 'text', utd: checkingData.utd }]}
                                        />
                                    </Paper>}
                        </Grid> */}
                        {/* <Grid item xs={12} sm={12} md={8} lg={6}>
                            <Paper className="containerHeight">
                                <div className="table-title">
                                    <div className="left-content">
                                        主货槽拣货拥堵状况
                                    </div>
                                    <div className="right-content">
                                        <div className="item">
                                            <div className="title-little"></div>
                                        </div>
                                    </div>
                                </div>
                                <MTable
                                    defaultPageSize={defaultPage.pageSize}
                                    isPreview={true}
                                    columns={this.state.pickingColumns}
                                    className="preview-table little-table-260"
                                    canAction={true}
                                    rows={stackingData}
                                    isLoading={stackingData.isLoading}
                                    changePage={this.changePage}
                                    setDefaultSelect={setDefaultSelect}
                                />
                            </Paper>
                        </Grid> */}


                    </Grid>
                </div>
            </div>)
    }
}

export default ControlPage