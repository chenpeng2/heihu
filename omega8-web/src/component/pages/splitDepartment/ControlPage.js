import React from "react"
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux"
import { connect } from "react-redux"

//material component
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import { message } from 'antd'
// my component
import Bar from 'component/charts/Bar'
import PieChart from 'component/charts/pie'
import BarListChart from 'component/charts/BarList'
import BarColors from 'component/charts/BarChartColors'
import SwiperModal from 'component/common/SwiperModal'
import LineChart from 'component/charts/line'
import { typeToText, timeOutText, REFRESH_TIME } from 'utils/chartHelper'

//action
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import request from 'utils/urlHelpers'

class splitControlPage extends React.Component {
    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            catchType: '2',
            appartmentData: {
                isLoading: true,
            },
            fullData: {
                isLoading: true,
            },
            splitCatchData: {
                isLoading: true,
            },
            getCatchData: {
                isLoading: true,
            },
            outTimeList: {
                isLoading: true,
            },
            todayReceiveData: {
                isLoading: true,
            },
            nextDayData: {
                isLoading: true,
            },
            isShowDetail: false,
        }
    }

    getBarData(data) {
        const chartData = {
            Xlist: [],
            series: {
                'heavy': [],
                'light': [],
                'total': [],
            }
        }
        data && data.forEach(item => {
            if (item.time === 'past') {
                chartData.Xlist.push('过去')
            } else if (item.time === 'now') {
                chartData.Xlist.push('现在')
            } else {
                chartData.Xlist.push(item.time)
            }
            chartData.series['heavy'].push(item.heavy)
            chartData.series['light'].push(item.light)
            chartData.series['total'].push(item.total)
        })
        return chartData
    }

    getAppartData = () => {
        return request({
            url: `/chart/receipt/appointment/time/overview`,
            method: 'GET'
        }).then(res => {
            if (res && res.code === 0) {
                const appartmentData = {}
                const data = JSON.parse(res.data)
                appartmentData.chartData = this.getBarData(data)
                this.setState({
                    appartmentData,
                })
            } else {
                const appartmentData = {
                    isLoading: false,
                    fetchError: true,
                }
                this.setState({
                    appartmentData,
                })
            }

        })
    }

    getFullSatus() {
        return request({
            url: `/statistic/doors/fullcontainer`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                const { all, full } = data
                const fullData = {
                    all,
                    full,
                }
                this.setState({
                    fullData,
                })
            } else {
                this.setState({
                    fullData: {
                        isLoading: false,
                    }
                })
            }

        })
    }


    getTimeOutData = (isAll) => {
        return request({
            url: `/chart/receipt/receipting/timeout/overview?isAll=${isAll}`,
            method: 'GET'
        }).then(res => {
            if (!res) {
                this.setState({
                    outTimeList: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
                return
            }
            const outTimeList = JSON.parse(res.data)
            outTimeList.chartData = {}
            for (let key in outTimeList) {
                if (timeOutText[key]) {
                    outTimeList.chartData[key] = outTimeList[key]
                }
            }
            this.setState({
                outTimeList,
            })
        })
    }

    formateBarData(data) {
        const chartData = {
            Xlist: [],
            series: {
                total: []
            }
        }
        data && data.forEach(item => {
            chartData.Xlist.push(`仓库${item.whsId}`)
            chartData.series.total.push(item.count)
        })
        return chartData
    }


    sum(arr) {
        return arr.reduce(function (prev, curr, idx, arr) {
            return prev + curr;
        })
    }

    formateColorsBarData(data, manyType) {
        const chartData = {
            Xlist: [],
            Ylist: [],
            series: {
                'total': [],
            },
        }
        const keys = {
            ...data[0]
        }
        delete keys.whsId // whsId 是X轴坐标，不需要放入series data中
        // formate X 轴和数据lable
        for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
            const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
            if (dataKey !== 'whsId') {
                if (manyType) {
                    if (dataKey !== 'used') {
                        chartData.series[key] = []
                    } else {
                        chartData.series[key] = []
                    }
                } else {
                    chartData.series[key] = []
                }
            }
        }
        // formate 数据
        data && data.forEach(item => {
            chartData.Xlist.push(`仓${item.whsId}`)
            chartData.Ylist.push(`仓${item.whsId}`)
            for (let dataKey in keys) {
                const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
                if (manyType) {
                    if (dataKey !== 'used') {
                        chartData.series[key] && chartData.series[key].push(item[dataKey] || 0)
                    }
                } else {
                    chartData.series[key] && chartData.series[key].push(item[dataKey] || 0)
                }
            }
            chartData.series.total.push(item.used)
        })
        return chartData
    }

    formateBarListData(data) {
        const chartData = {
            Xlist: [],
            Ylist: [],
            series: {},
        }
        const keys = {
            ...data[0]
        }
        delete keys.whsId // whsId 是X轴坐标，不需要放入series data中
        delete keys.used
        // formate X 轴和数据lable
        for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
            const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
            if (dataKey !== 'whsId') {
                chartData.series[key] = []
            }
        }
        // formate 数据
        data && data.forEach(item => {
            chartData.Ylist.push(`仓${item.whsId}`)
            for (let dataKey in keys) {
                const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
                chartData.series[key].push(item[dataKey] || 0)
            }
        })
        return chartData
    }

    formateLineData(data) {
        const chartData = {
            Xlist: [],
            series: {
                'total': [],
            },
        }
        const keys = {
            ...data[0]
        }
        for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
            const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
            chartData.series[key] = []
        }
        data && data.forEach(item => {
            chartData.Xlist.push(`${item.time}`)
            for (let dataKey in keys) {
                const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
                chartData.series[key] && chartData.series[key].push(item[dataKey] || 0)
            }
        })
        return chartData
    }


    getAppartTotal = (isNextDay) => {
        const stateKey = isNextDay ? 'nextDayTotalData' : 'todayTotalData'
        return request({
            url: `/statistic/receipt/appointment?isnextday=${isNextDay}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                this.setState({
                    [stateKey]: JSON.parse(res.data),
                })
            }

        })
    }

    getFullDoor() {
        return request({
            url: `/chart/store/fulleddoor`,
            method: 'GET'
        }).then(res => {
            if (res) {
                this.setState({
                    fullList: JSON.parse(res.data),
                })
            }
        })
    }

    getSplitCatchData = () => {
        return request({
            url: '/chart/receipt/filling/stored/detail',
            method: 'GET'
        }).then(res => {
            if (res) {
                const splitCatchData = JSON.parse(res.data)
                splitCatchData.chartData = this.formateColorsBarData(splitCatchData.detail)
                this.setState({
                    splitCatchData,
                })
            } else {
                const splitCatchData = {
                    fetchError: true,
                    isLoading: false,
                }
                this.setState({
                    splitCatchData,
                })
            }

        })
    }

    setChartSelect() {
        const typeSelect = [{
            value: '2',
            title: '分拣类型'
        }, {
            value: '1',
            title: '货物类型'
        }]
        const timeoutSelect = [{
            value: true,
            title: '全部'
        }, {
            value: false,
            title: '京东 & 社区店'
        }]

        const getCatchSelect = [{
            value: '2',
            title: '分拣类型'
        }, {
            value: '1',
            title: '货物类型'
        }, {
            value: '3',
            title: '门店类型'
        }]
        this.setState({
            typeSelect,
            timeoutSelect,
            timeOutText,
            getCatchSelect
        })
    }

    getCatchStatusData = (type) => {
        const typeParam = type ? `?category=${type}` : ''
        return request({
            url: `/chart/receipt/receipting/stored/detail${typeParam}`,
            method: 'GET'
        }).then(res => {
            if (!res) {
                this.setState({
                    getCatchData: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
                return
            }
            const getCatchData = JSON.parse(res.data)
            getCatchData.chartData = this.formateColorsBarData(getCatchData.detail, true)
            getCatchData.isLoading = false
            this.setState({
                getCatchData,
                catchType: type,
            })
        })
    }

    getTodayReceiptData = (type) => {
        const typeParam = type ? `?category=${type}` : ''
        return request({
            url: `/chart/receipt/receipting/stored/done${typeParam}`,
            method: 'GET'
        }).then(res => {
            if (!res) {
                this.setState({
                    todayReceiveData: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
                return
            }
            const data = JSON.parse(res.data)
            const todayReceiveData = data
            todayReceiveData.chartData = this.formateBarListData(data.detail, true)
            this.setState({
                todayReceiveData,
            })
        })
    }

    getNextDayData(isNextDay) {
        return request({
            url: `/chart/receipt/appointment/time/detail?isnextday=${isNextDay}`,
            method: 'GET'
        }).then(res => {
            if (!res) {
                this.setState({
                    nextDayData: {
                        isLoading: false,
                        fetchError: true,
                    }
                })
                return
            }
            const nextDayData = JSON.parse(res.data)
            nextDayData.chartData = this.formateLineData(nextDayData, true)
            this.setState({
                nextDayData,
            })
        })
    }

    setDefaultSelect = () => {
        this.setState({
            catchType: '2',
            setDefaultSelect: true,
        })
    }

    refreshData = () => {
        const _this = this
        Promise.all(
            [
                _this.getAppartData(),
                _this.getTimeOutData(true),
                _this.getFullSatus(),
                _this.getFullDoor(),
                _this.getAppartTotal(true),
                _this.getAppartTotal(false),
                _this.getSplitCatchData(),
                _this.getCatchStatusData('2'),
                _this.getTodayReceiptData('2'),
                _this.getNextDayData(true),
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
        this.setChartSelect()
        this.refreshData()
        this.timer = setInterval(this.refreshData, REFRESH_TIME)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    showDetailModal = () => {
        this.setState({
            isShowDetail: true,
        })
    }

    closeModal = () => {
        this.setState({
            isShowDetail: false,
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
        const { appartmentData, nextDayData, catchType, getCatchData, todayReceiveData, outTimeList, splitCatchData, fullData, fullList, timeoutSelect, typeSelect, getCatchSelect, todayTotalData, nextDayTotalData } = this.state
        return (
            <div>
                {this.state.isShowDetail &&
                    <SwiperModal data={fullList} isShow={this.state.isShowDetail} getTodetail={this.getTodetail} from={'split'} closeModal={this.closeModal} />}
                <div className="main-panel-light">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            {appartmentData.isLoading || !todayTotalData ?
                                <div className="loading-content"> <CircularProgress /> </div> :
                                <Paper className="item-content content-chart-big" style={{ paddingBottom: '12px' }}>
                                    <div className="chart-title" onClick={() => this.getTodetail('appartment', { isNextDay: false })}>
                                        <div className="left-content">
                                            今日预约未到货量
                                        <div className="number-content">
                                                {this.formateTotal((todayTotalData && todayTotalData.total) || 0)}
                                                <span className="text">{todayTotalData && todayTotalData.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                        <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">重货</div>
                                                <div className="little-value">{(todayTotalData && todayTotalData.heavy + todayTotalData.utd) || 0}</div>
                                            </div>
                                            <div className="item">
                                                <div className="title-little">抛货</div>
                                                <div className="little-value">{(todayTotalData && todayTotalData.light + todayTotalData.utd) || 0}</div>
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                    {
                                        appartmentData.fetchError ?
                                            <div className="empty-content">数据出错</div> :
                                            <Bar
                                                data={appartmentData.chartData}
                                                getData={this.getDoneJob}
                                                getTodetail={this.getTodetail}
                                                detailPath={'appartment'}
                                                unit={todayTotalData.utd}
                                                isPreview={true} />
                                    }
                                </Paper>
                            }
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={5}>
                            {splitCatchData.isLoading ?
                                <div className="loading-content"> <CircularProgress /> </div>
                                :
                                <Paper className="item-content content-chart-big">
                                    <div className="chart-title">
                                        <div className="left-content">
                                            分货部待转C区板数
                                            <div className="number-content">
                                                {this.formateTotal(splitCatchData.total)}
                                                <span className="text">{splitCatchData.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                        <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">一期</div>
                                                <div className="little-value">{splitCatchData.group1 + splitCatchData.utd}</div>
                                            </div>
                                            <div className="item">
                                                <div className="title-little">二期</div>
                                                <div className="little-value">{splitCatchData.group2 + splitCatchData.utd}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {splitCatchData.fetchError ?
                                        <div className="empty-content">数据出错</div> :
                                        <BarColors hasFull={true} unit={splitCatchData.utd} isManyColor={true} data={splitCatchData.chartData} isPreview={true} />
                                    }
                                </Paper>
                            }
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            {getCatchData.isLoading ?
                                <div className="loading-content content-chart-big"> <CircularProgress /> </div>
                                : <Paper className="content-chart-big">
                                    <div className="chart-title">
                                        <div className="left-content">
                                            收货缓冲板数
                                            <div className="number-content">
                                                {this.formateTotal(getCatchData.total)}
                                                <span className="text">{getCatchData.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                        {catchType === '2' && <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">扫描类型</div>
                                                <div className="little-value">{getCatchData.scan || 0}{getCatchData.utd}</div>
                                            </div>
                                            <div className="item">
                                                <div className="title-little">声控类型</div>
                                                <div className="little-value">{getCatchData.voice || 0}{getCatchData.utd}</div>
                                            </div>
                                        </div>
                                        }
                                        {catchType === '1' &&
                                            <div className="right-content">
                                                <div className="item">
                                                    <div className="title-little">重货</div>
                                                    <div className="little-value">{getCatchData.heavy || 0}{getCatchData.utd}</div>
                                                </div>
                                                <div className="item">
                                                    <div className="title-little">抛货</div>
                                                    <div className="little-value">{getCatchData.light || 0}{getCatchData.utd}</div>
                                                </div>
                                            </div>
                                        }
                                        {catchType === '3' &&
                                            <div className="right-content">
                                                <div className="item">
                                                    <div className="title-little">京东</div>
                                                    <div className="little-value">{getCatchData.jd || 0}{getCatchData.utd}</div>
                                                </div>
                                                <div className="item">
                                                    <div className="title-little">社区店</div>
                                                    <div className="little-value">{getCatchData.super || 0}{getCatchData.utd}</div>
                                                </div>
                                                <div className="item">
                                                    <div className="title-little">大卖场</div>
                                                    <div className="little-value">{getCatchData.hyper || 0}{getCatchData.utd}</div>
                                                </div>
                                            </div>}
                                    </div>
                                    {getCatchData.fetchError ?
                                        <div className="empty-content">数据出错</div> :
                                        <BarColors
                                            unit={getCatchData.utd}
                                            hasFull={true}
                                            selectList={getCatchSelect}
                                            isManyColor={true}
                                            setDefaultSelect={this.state.setDefaultSelect}
                                            data={getCatchData.chartData}
                                            getData={this.getCatchStatusData}
                                            isPreview={true}
                                            manyType={true}
                                            changeType={true}
                                        />}
                                </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            {outTimeList.isLoading ?
                                <div className="loading-content-little item-content-top"> <CircularProgress /> </div>
                                : <Paper className="item-content-top">
                                    <div className="chart-title" onClick={() => this.getTodetail('timeoutDetail')}>
                                        <div className="left-content">
                                            超时待分拣货量
                                        <div className="number-content">
                                                {this.formateTotal((outTimeList && outTimeList.total) || 0)}
                                                <span className="text">{outTimeList && outTimeList.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                        <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">京东 & 社区店超时数量</div>
                                                <div className="little-value">{outTimeList && outTimeList.jdSuperTotal + outTimeList.utd}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {outTimeList.fetchError ? <div className="loading-content-little">数据出错</div> :
                                        <PieChart
                                            selectList={timeoutSelect}
                                            valueToText={timeOutText}
                                            getTodetail={this.getTodetail}
                                            getData={this.getTimeOutData}
                                            data={outTimeList.chartData}
                                            detailPath={'timeoutDetail'}
                                            setDefaultSelect={this.state.setDefaultSelect}
                                        />}
                                </Paper>
                            }
                            <Paper className="">
                                {fullData.isLoading ?
                                    <div className="loading-content-label"> <CircularProgress /> </div> :
                                    <div className="state-content">
                                        <div className="left-content">
                                            <div className="title">即将满柜</div>
                                            <div className="subtitle">货柜容量即将达到【80%】</div>
                                            <a className="more-button" href="javascript:;" onClick={() => this.getTodetail('doorCabinet', { tag: '即将满柜', from: 'split' })}>查看全部</a>
                                        </div>
                                        <div className="right-content">
                                            <div className="value-content">
                                                <div className="value">{fullData.full || 0}</div>
                                                <div onClick={this.showDetailModal}>
                                                    <i className="sap-icon icon-dimension"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={8} lg={5}>
                            {todayReceiveData.isLoading ?
                                <div className="loading-content"> <CircularProgress /> </div>
                                :
                                <Paper className="item-content content-chart-big">
                                    <div className="chart-title">
                                        <div className="left-content">
                                            当日累计分拣货量
                                        <div className="number-content">
                                                {todayReceiveData && this.formateTotal(todayReceiveData.total || 0)}
                                                <span className="text">{todayReceiveData && todayReceiveData.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                    </div>
                                    {todayReceiveData.fetchError ?
                                        <div className="empty-content">数据出错</div> :
                                        <BarListChart
                                            selectList={typeSelect}
                                            getData={this.getTodayReceiptData}
                                            isPreview={true}
                                            data={todayReceiveData.chartData}
                                            setDefaultSelect={this.state.setDefaultSelect}
                                        />}
                                </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={8} lg={4}>
                            {nextDayData.isLoading ?
                                <div className="loading-content"> <CircularProgress /> </div>
                                :
                                <Paper className="item-content content-chart-big">
                                    <div className="chart-title" onClick={() => this.getTodetail('appartment', { isNextDay: true })}>
                                        <div className="left-content">
                                            明日预约未到货量
                                        <div className="number-content">
                                                {this.formateTotal((nextDayTotalData && nextDayTotalData.total) || 0)}
                                                <span className="text">{nextDayTotalData && nextDayTotalData.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                        <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">重货</div>
                                                <div className="little-value">{(nextDayTotalData && nextDayTotalData.heavy + nextDayTotalData.utd) || 0}</div>
                                            </div>
                                            <div className="item">
                                                <div className="title-little">抛货</div>
                                                <div className="little-value">{(nextDayTotalData && nextDayTotalData.light + nextDayTotalData.utd) || 0}</div>
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                    {nextDayData.fetchError ? <div className="empty-content">数据出错</div> :
                                        <LineChart data={nextDayData.chartData} isPreview={true} getTodetail={this.getTodetail} detailPath={'appartment'} />
                                    }
                                </Paper>}
                        </Grid>

                    </Grid>

                </div>
            </div>)
    }
}

const mapStateToProps = (state) => {
    return {
        list: state,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withRouter(splitControlPage));