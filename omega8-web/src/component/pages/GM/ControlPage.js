import React from "react"
import PropTypes from 'prop-types';

//material component
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import { message } from 'antd'
// my component
import AppointmentList from 'component/tables/AppointmentList'
import Progress from 'component/common/Progress'
import LineChart from 'component/charts/line'
import FlowChart from 'component/charts/flowChart'
import { typeToText, REFRESH_TIME } from 'utils/chartHelper'
import ListCard from 'component/tables/ListCard'

//action
import request from 'utils/urlHelpers'

class ControlPage extends React.Component {
    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            summaryData: {
                isLoading: true,
            },
            appointmentData: {
                isLoading: true,
            },
            appointmentLineData: {
                isLoading: true,
            },
            overViewData: {
                isLoading: true,
            },
            doneLineData: {
                isLoading: true,
            },
            pickedData: {
                isLoading: true,
            },

        }
    }

    getSummary() {
        return request({
            url: `/chart/gm/summary`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                for (let key in data) {
                    data[key] = JSON.parse(data[key])
                }
                this.setState({
                    summaryData: data,
                })
            } else {
                this.setState({
                    summaryData: {
                        isLoading: false,
                        fetchError: true,
                    },
                })
            }
        })
    }

    getOverViewData = () => {
        request({
            url: `/chart/gm/monitor/overview`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                this.setState({
                    overViewData: data,
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

    getAppointmentData() {
        request({
            url: `/chart/gm/appointment`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                for (let key in data) {
                    data[key] = JSON.parse(data[key])
                }
                this.setState({
                    appointmentData: data,
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

    formateLineData(data) {
        const chartData = {
            Xlist: [],
            legend: [],
            series: {
                'total': [],
            },
        }
        const keys = {
            ...data[0]
        }
        delete keys.date
        for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
            const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
            chartData.series[key] = []
            chartData.legend.push(typeToText[dataKey])
        }
        data && data.forEach(item => {
            chartData.Xlist.push(`${item.date}`)
            for (let dataKey in keys) {
                const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
                chartData.series[key] && chartData.series[key].push(item[dataKey] || 0)
            }
        })
        return chartData
    }

    getOrderData = (department) => {
        const departmentParam = department ? `?department=${department}` : ''
        return request({
            url: `/chart/gm/order/estimate${departmentParam}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                const appointmentLineData = {}
                appointmentLineData.chartData = this.formateLineData(data)
                appointmentLineData.date = `${data[0].date}-${data[data.length - 1].date}`
                this.setState({
                    appointmentLineData,
                })
            }
        })
    }

    getDoneData = (department) => {
        const departmentParam = department ? `?department=${department}` : ''
        return request({
            url: `/chart/gm/order/finished${departmentParam}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                const doneLineData = {}
                doneLineData.chartData = this.formateLineData(data)
                doneLineData.date = `${data[0].date}-${data[data.length - 1].date}`
                this.setState({
                    doneLineData,
                })
            }
        })
    }

    getPickedData = () => {
        request({
            url: `/sstk/chart/sstk/picking/whs`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                this.setState({
                    pickedData: data,
                })
            } else {
                this.setState({
                    pickedData: {
                        isLoading: false,
                        fetchError: true,
                    },
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
        const _this = this
        Promise.all(
            [
                _this.getSummary(),
                _this.getAppointmentData(),
                _this.getOrderData(''),
                _this.getOverViewData(),
                _this.getDoneData(''),
                _this.getPickedData(),
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

    goTodetail = (value, keys) => {
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
        const { summaryData, appointmentData, appointmentLineData, overViewData, doneLineData, pickedData, setDefaultSelect } = this.state
        const mokeLineData = {
            legend: ['收货', '分货', '出货'],
            Xlist: ['07/21', '07/23', '07/23', '07/24', '07/25'],
            series: {
                '收货': [300, 500, 600, 1000, 800],
                '分货': [400, 700, 1100, 1300, 1500],
                '出货': [800, 1000, 1400, 1300, 1900]
            }
        }
        const recList = [
            { title: '待收货箱数', value: summaryData.RecDes && summaryData.RecDes.valid, type: 'text' },
            { rate: summaryData.RecDes && summaryData.RecDes.rate, type: 'progress' }
        ]

        const shippingList = [
            { title: '待出货箱数', value: summaryData.ShipShipdu && summaryData.ShipShipdu.waiting, type: 'text' },
            { rate: summaryData.ShipShipdu && summaryData.ShipShipdu.rate, type: 'progress' }
        ]
        const shippingList2 = [
            { title: '正在装载柜数', value: summaryData.ShipShipdt && summaryData.ShipShipdt.loading, type: 'text' },
            { rate: summaryData.ShipShipdt && summaryData.ShipShipdt.rate, type: 'progress' }
        ]

        const picList = [
            { title: '待分拣箱数', value: summaryData.PicPicd && summaryData.PicPicd.waiting, type: 'text' },
            { rate: summaryData.ShipShipdu && summaryData.PicPicd.rate, type: 'progress' }
        ]

        const SSTKRecList = [
            { title: '待收货箱数', value: summaryData.SSTKRec && summaryData.SSTKRec.waiting, type: 'text' },
            { rate: summaryData.SSTKRec && summaryData.SSTKRec.rate, type: 'progress' }
        ]

        const SSTKShipdList = [
            { title: '待分拣箱数', value: pickedData.rest, type: 'text' },
            { rate: pickedData.rate, type: 'progress' }
        ]

        return (
            <div>
                <div className="main-panel-light">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={8} lg={6}>
                            {overViewData.isLoading ?
                                <div className="loading-content-little"><CircularProgress /> </div>
                                : overViewData.fetchError ?
                                    <div className="loading-content-little">数据出错</div> :
                                    <Paper className="item-content-two">
                                        <div className="item-title">
                                            <div className="left-content">
                                                <div className="loaction-title">
                                                    <i className="sap-icon icon-loaction"></i>Shenzhen DC
                                        </div>
                                            </div>
                                            <div className="right-content">
                                                {/* <div className="title-little">12:00 07/29</div> */}
                                            </div>
                                        </div>
                                        <div className="content-paper-info">
                                            <FlowChart data={overViewData} />
                                        </div>
                                    </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            {summaryData.isLoading ?
                                <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        <ListCard title={'收货部'} type={'已收货箱数'}
                                            total={summaryData.RecDes.distributed}
                                            detail={summaryData.receivingStoredRate}
                                            unit={'箱'}
                                            list={recList} />
                                    </Paper>
                            }
                            {summaryData.isLoading ?
                                <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        {summaryData.isLoading ?
                                            <div className="loading-content-label"> <CircularProgress /> </div>
                                            : summaryData.fetchError ?
                                                <div className="loading-content-label">数据出错</div> :
                                                <ListCard
                                                    title={'出货部'}
                                                    type={'已出货箱数'}
                                                    total={summaryData.ShipShipdu.shipping}
                                                    detail={summaryData.shippingStoredRate}
                                                    goTodetail={this.goTodetail}
                                                    unit={summaryData.ShipShipdu.utd}
                                                    detailPath={'outControl'}
                                                    list={shippingList} />
                                        }
                                    </Paper>
                            }
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            {summaryData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        <ListCard
                                            title={'分货部'}
                                            goTodetail={this.goTodetail}
                                            detailPath={'splitControl'}
                                            type={'已分拣箱数'}
                                            total={summaryData.PicPicd.shipping}
                                            detail={summaryData.fillingStoredRate}
                                            unit={summaryData.PicPicd.utd}
                                            list={picList} />
                                    </Paper>}
                            {summaryData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        <ListCard title={'出货部'} type={'已出货柜数'}  goTodetail={this.goTodetail}  detailPath={'outControl'} total={summaryData.ShipShipdt.shipped} detail={summaryData.shippingStoredRate} unit={summaryData.ShipShipdt.utd} list={shippingList2} />
                                    </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            {summaryData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> : <Paper className="item-content item-content-one">
                                        <div className="item-title">
                                            <div className="left-content">
                                                XDK预约
                                    </div>
                                        </div>
                                        {appointmentData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                            : <AppointmentList listData={appointmentData.XDK} getData={this.getOutTimeData} />}
                                    </Paper>}

                            {summaryData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        <ListCard
                                            goTodetail={this.goTodetail}
                                            detailPath={'SSTKOverview'}
                                            title={'稳定库存'}
                                            type={'已收货箱数'}
                                            total={summaryData.SSTKRec.received}
                                            unit={summaryData.SSTKRec.utd}
                                            list={SSTKRecList} />
                                    </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            {summaryData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                : summaryData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        <div className="item-title">
                                            <div className="left-content">
                                                <div className="title">SSTK预约</div>
                                            </div>
                                        </div>
                                        {appointmentData.isLoading ?
                                            <div className="loading-content-label"> <CircularProgress /> </div>
                                            : <AppointmentList listData={appointmentData.SSTK} getData={this.getOutTimeData} />
                                        }
                                    </Paper>
                            }
                            {pickedData.isLoading ? <div className="loading-content-label"> <CircularProgress /> </div>
                                : pickedData.fetchError ?
                                    <div className="loading-content-label">数据出错</div> :
                                    <Paper className="item-content item-content-one">
                                        <ListCard
                                            title={'稳定库存'}
                                            type={'已分拣箱数'}
                                            total={pickedData.finished}
                                            unit={pickedData.utd}
                                            list={SSTKShipdList}
                                            goTodetail={this.goTodetail}
                                            detailPath={'SSTKOverview'}
                                        />

                                    </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Paper className="item-content item-content-one-chart">
                                <div className="item-title">
                                    <div className="title">
                                        <div className="left-content">
                                            已完成 | 过去七天
                                        </div>
                                        <div className="right-content">
                                            <div className="subtitle">{doneLineData.date}</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {/* <LineChart data={mokeLineData} canSelect={true} lineType={'solid'} /> */}
                                    {doneLineData.isLoading ?
                                        <div className="loading-content-little"> <CircularProgress /> </div>
                                        : <LineChart
                                            setDefaultSelect={setDefaultSelect}
                                            data={doneLineData.chartData}
                                            canSelect={true}
                                            lineType={'solid'}
                                            getData={this.getDoneData}
                                        />
                                    }
                                </div>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Paper className="item-content item-content-one-chart">
                                <div className="item-title">
                                    <div className="title">
                                        <div className="left-content">
                                            预约 | 未来七天
                                        </div>
                                        <div className="right-content">
                                            <div className="subtitle">{appointmentLineData.date}</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {appointmentLineData.isLoading ? <div className="loading-content-little"> <CircularProgress /> </div>
                                        : <LineChart
                                            data={appointmentLineData.chartData}
                                            canSelect={true}
                                            lineType={'dashed'}
                                            getData={this.getOrderData}
                                            setDefaultSelect={setDefaultSelect}
                                        />
                                    }
                                </div>
                            </Paper>
                        </Grid>

                    </Grid>
                </div>
            </div>)
    }
}

export default ControlPage