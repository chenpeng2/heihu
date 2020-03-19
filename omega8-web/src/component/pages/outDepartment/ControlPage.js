import React from "react"
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
//material component
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
// my component
import MTable from 'component/tables/MaterialTable'
import List from 'component/tables/List'
import PieChart from 'component/charts/pie'
import BarListChart from 'component/charts/BarList'
import BarChart from 'component/charts/BarChart'
import SwiperModal from 'component/common/SwiperModal'
import { departmentToText, typeToText, textToDepartValue, valueToText, unitText, REFRESH_TIME } from 'utils/chartHelper'
//action
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { getWarehouseList } from 'redux/selectors/outPartSelector'
import request from 'utils/urlHelpers'
import { message } from 'antd'

// }
class outControlPage extends React.Component {
    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            willComeData: {
                isLoading: true,
            },
            areaData: {
                isLoading: true,
            },
            fullData: {
                isLoading: true,
            },
            statusData: {
                isLoading: true,
            },
            outTimeList: {
                isLoading: true,
            },
            fullList: {
                isLoading: true,
            },
            doneData: {
                isLoading: true,
            },
            doorData: {
                isLoading: true,
            },
            department: '',
            isShowDetail: false,
            CUnit: 'number',
            columns: [{
                title: '门',
                field: 'door',
                sorting: false,
            }, {
                title: '等待装柜时间',
                field: 'waitTrail',
                sorting: false,
                render: (props) => {
                    return this.formateTime(props.waitTrail)
                }
            }, {
                title: 'C区剩余货量(板)',
                field: 'cStored',
                sorting: false,
            }, {
                title: 'C区容量(板)',
                field: 'cTotal',
                sorting: false,
            }]
        }
    }

    formateChartData(data, department) {
        const chartData = {
            Ylist: [],
            series: {},
        }
        const keys = {
            ...data[0].departmentInfo
        }
        delete keys.whsId // whsId 是X轴坐标，不需要放入series data中
        for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
            const key = departmentToText[dataKey] ? departmentToText[dataKey] : dataKey
            if (dataKey !== 'whsId') {
                chartData.series[key] = [] 
            }
        }
        data && data.forEach(item => {
            chartData.Ylist.unshift(`仓库${item.whsId}`)
            if (department) {
                chartData.series[departmentToText[department]].unshift(item.departmentInfo[department] || 0)
            } else {
                for (let key in departmentToText) {
                    chartData.series[departmentToText[key]] && chartData.series[departmentToText[key]].unshift(item.departmentInfo[key] || 0)
                }
            }
        })
        if (department) {
            for (let key in chartData.series) {
                if (key !== departmentToText[department]) {
                    delete chartData.series[key]
                }
            }
        }
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

    formatCAreaChartData(data) {
        const { detail } = data
        const chartData = {
            Ylist: [],
            series: {
                data: [],
                totalData: [],
                utilData: []
            },
            overview: {
                ...data.overview,
                group1Rate: parseInt(data.overview.group1Rate * 100),
                group2Rate: parseInt(data.overview.group2Rate * 100),
                storedRate: parseInt(data.overview.storedRate * 100),
            }
        }
        detail.forEach(item => {
            chartData.Ylist.push(`仓库${item.whsId}`)
            chartData.series.data.push(item.pltTotal)
            chartData.series.totalData.push(item.slotTotal)
            chartData.series.utilData.push(parseInt(item.utilization * 100))
        })
        return chartData
    }

    formateTime(time) {
        if (time) {
          let hour = parseInt(time / 3600) ? `${parseInt(time / 3600)}小时` : ''
          let minnut = parseInt(time % 3600 / 60) ? `${parseInt(time % 3600 / 60)}分钟` : ''
          // let second = parseInt(time % 60)
          return `${hour} ${minnut}`
        } else {
          return 0
        }
      }

    getWillComeData = (department) => {
        const param = department ? `?department=${department}` : ''
        return request({
            url: `/chart/warehouse/expectedarrival${param}`,
            method: 'GET'
        }).then(res => {
            if (res && res.code === 0) {
                const data = JSON.parse(res.data)
                const willComeData = data
                willComeData.chartData = this.formateChartData(data.detail, department)
                this.setState({
                    willComeData,
                })
                return JSON.parse(res.data)
            } else {
                return {
                    fetchError: true,
                }
            }
        })
    }

    getCAreaData() {
        return request({
            url: `/chart/warehouse/c-status`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                this.setState({
                    areaData: this.formatCAreaChartData(data)
                })
            }
        })
    }

    getFullSatus() {
        return request({
            url: `/statistic/doors/fullcontainer`,
            method: 'GET'
        }).then(res => {
            const data = JSON.parse(res.data)
            const { all, full } = data
            const fullData = {
                all,
                full,
            }
            this.setState({
                fullData,
            })
        })
    }

    getDoorData() {
        return request({
            url: `/chart/doors/detail?unit=plt&pageNum=1&pageSize=11&filter=4`,
            method: 'GET'
        }).then(res => {
            if (res && res.code === 0) {
                const list = JSON.parse(res.data)
                const { doorData } = this.state
                doorData.list = list
                doorData.isLoading = false
                this.setState({
                    doorData,
                })
            }
        })
    }

    getStatusData = (whsId) => {
        const whsIdParam = whsId ? `?whsId=${whsId}` : ''
        return request({
            url: `/chart/doors/doorstatus${whsIdParam}`,
            method: 'GET'
        }).then(res => {
            const data = JSON.parse(res.data)
            const statusData = {
                ...data,
                legend: ['未摆柜', '等待摆柜', '已摆柜', '装柜中']
            }
            this.setState({
                statusData,
            })
        })
    }

    getOutTimeData = (time) => {
        return request({
            url: `/chart/doors/loadtimeout?timelimit=${time || 4}`,
            method: 'GET'
        }).then(res => {
            const outTimeList = JSON.parse(res.data)
            this.setState({
                outTimeList,
            })
        })
    }

    getFullDoor() {
        return request({
            url: `/chart/store/fulleddoor`,
            method: 'GET'
        }).then(res => {
            this.setState({
                fullList: JSON.parse(res.data),
            })
        })
    }

    getDoneJob = (unit) => {
        const unitParam = unit ? `?unit=${unit}` : ''
        return request({
            url: `/chart/warehouse/donejob${unitParam}`,
            method: 'GET'
        }).then(res => {
            const data = JSON.parse(res.data)
            const doneData = data
            doneData.chartData = this.formateBarListData(data.detail)
            this.setState({
                doneData,
            })
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
                _this.getWillComeData(_this.state.department),
                _this.props.getWareHouseList(),
                _this.getCAreaData(),
                _this.getFullSatus(),
                _this.getStatusData(),
                _this.getFullDoor(),
                _this.getOutTimeData(),
                _this.getDoneJob('plt'),
                _this.getDoorData(),
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

    formatDate = () => {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var second = date.getSeconds();
        second = second < 10 ? ('0' + second) : second;
        var timastamp = y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
        this.setState({ timastamp })
        // return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
    }

    componentDidMount() {
        const _this = this
        Promise.all(
            [
                _this.getWillComeData(_this.state.department),
                _this.props.getWareHouseList(),
                _this.getCAreaData(),
                _this.getFullSatus(),
                _this.getStatusData(),
                _this.getFullDoor(),
                _this.getOutTimeData(),
                _this.getDoneJob('plt'),
                _this.getDoorData()
            ]
        ).then(res => {

        }).catch((error) => {
            message.error('数据请求异常！')
        })
        const departSelect = []
        const unitSelect = []
        for (let key in textToDepartValue) {
            departSelect.push({
                value: textToDepartValue[key],
                title: key
            })
        }

        for (let key in unitText) {
            unitSelect.push({
                value: unitText[key],
                title: key
            })
        }
        this.setState({
            departSelect,
            unitSelect,
        })
        this.formatDate()
        this.timer = setInterval(this.refreshData, REFRESH_TIME)
        // this.timer2 =setInterval(this.formatDate, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
        clearInterval(this.timer2)
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

    changeSelect = (event) => {
        this.setState({
            department: event.target.value
        })
    }

    changeCAreaUnit = unit => {
        this.setState({
            CUnit: unit,
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
        const { setDefaultSelect, willComeData, departSelect, areaData, CUnit, fullData, statusData, fullList, doneData, outTimeList, doorData, unitSelect } = this.state
        const { warehouseList } = this.props
        return (
            <div>
                {this.state.isShowDetail &&
                    <SwiperModal data={fullList} isShow={this.state.isShowDetail} getTodetail={this.getTodetail} closeModal={this.closeModal} />}
                <div className="main-panel-light">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6} className="content-10-4">
                            {willComeData.isLoading ?
                                <div className="loading-content"> <CircularProgress /> </div>
                                :
                                <Paper className="item-content content-chart-big">
                                    <div className="chart-title" onClick={() => this.getTodetail('willCome')}>
                                        <div className="left-content">
                                            预计到来工作量/板数
                                        <div className="number-content">
                                                {this.formateTotal(willComeData.total)}
                                                <span className="text">{willComeData.utd}</span>
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                    </div>

                                    <BarListChart
                                        setDefaultSelect={setDefaultSelect}
                                        selectList={departSelect}
                                        getData={this.getWillComeData}
                                        getTodetail={this.getTodetail}
                                        detailPath={'willCome'}
                                        isPreview={true}
                                        data={willComeData.chartData} />

                                </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} className="content-10-4">
                            {areaData.isLoading ?
                                <div className="loading-content"> <CircularProgress /> </div>
                                : <Paper className="item-content content-chart-big">
                                    <div className="chart-title" onClick={() => this.getTodetail('cZone')}>
                                        <div className="left-content">
                                            当前C区状态
                                        <div className="number-content">
                                                {areaData.overview && CUnit === 'number' ? this.formateTotal(areaData.overview.storedTotal) : this.formateTotal(areaData.overview.storedRate)}
                                                {areaData.overview&& <span className="text">{CUnit === 'number' ? areaData.overview.utd : '%'}</span>
                                                }
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                        <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">一期</div>
                                                <div className="little-value">
                                                    {areaData.overview && CUnit === 'number' ? areaData.overview.group1 : areaData.overview.group1Rate }
                                                    <span className="text">{CUnit === 'number' ? areaData.overview.utd : '%'}</span>
                                                </div>            
                                            </div>
                                            <div className="item">
                                                <div className="title-little">二期</div>
                                                <div className="little-value">
                                                {areaData.overview && CUnit === 'number' ? areaData.overview.group2 : areaData.overview.group2Rate}
                                                <span className="text">{CUnit === 'number' ? areaData.overview.utd : '%'}</span>
                                                </div>
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>
                                    <BarChart 
                                        setDefaultSelect={setDefaultSelect}
                                        getTodetail={this.getTodetail} 
                                        data={areaData} 
                                        detailPath={'cZone'} 
                                        isPreview={true} 
                                        changeUnit={this.changeCAreaUnit}
                                        />
                                </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} className="content-10-2">
                            <Paper>
                                {fullData.isLoading ?
                                    <div className="loading-content-label"> <CircularProgress /> </div> :
                                    <div className="state-content">
                                        <div className="left-content">
                                            <div className="title">即将满柜</div>
                                            <div className="subtitle">货柜容量即将达到【80%】</div>
                                            <a className="more-button" onClick={() => this.getTodetail('doorCabinet', { tag: '即将满柜' })}>查看全部</a>
                                        </div>
                                        <div className="right-content">
                                            <div className="value-content">
                                                <div className="value">{fullData.full}</div>
                                                <div onClick={this.showDetailModal}>
                                                    <i className="sap-icon icon-dimension"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                            </Paper>
                            {statusData.isLoading ?
                                <div className="loading-content-little"> <CircularProgress /> </div> :
                                <Paper className="item-content-chart">
                                    <div className="chart-title" onClick={() => this.getTodetail('doorCabinet')}>
                                        <div className="left-content">
                                            装柜与摆柜状态
                                        <div className="number-content"><span className="number">{fullData && fullData.full}</span></div>
                                            <div className="title-little">即将满柜数量</div>
                                        </div>
                                        <div className="right-content">
                                            <div className="item">
                                                <div className="title-little">总计柜门数量</div>
                                                <div className="little-value">{fullData && fullData.all}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <PieChart setDefaultSelect={setDefaultSelect} valueToText={valueToText} getTodetail={this.getTodetail} getData={this.getStatusData} data={statusData} warehouseList={warehouseList} detailPath={'doorCabinet'} />
                                </Paper>
                            }
                        </Grid>
                        <Grid item xs={12} sm={6} md={8} className="content-10-4">
                            {doneData.isLoading ?
                                <div className="loading-content-little"> <CircularProgress /> </div> :
                                <Paper className="item-content">
                                    <div className="chart-title">
                                        <div className="left-content">
                                            已完成工作量
                                        <div className="number-content">
                                                {doneData && this.formateTotal(doneData.total) } 
                                                {doneData && <span className="text">{doneData.utd}</span>}
                                            </div>
                                            <div className="title-little">总计</div>
                                        </div>
                                    </div>
                                    <BarListChart
                                        setDefaultSelect={setDefaultSelect}
                                        selectList={unitSelect}
                                        getData={this.getDoneJob}
                                        isPreview={true}
                                        data={doneData.chartData} />
                                    {/* <BarListChart data={doneData.chartData} getData={this.getDoneJob} /> */}
                                </Paper>}
                        </Grid>
                        <Grid item xs={12} sm={6} md={8} className="content-10-4">
                            <Paper className="containerHeight">
                                <div className="table-title" onClick={() => this.getTodetail('doorCabinet', { tag: '已摆柜' })}>
                                    <div className="left-content">
                                        已摆柜柜门状态
                                    </div>
                                    <div className="right-content">
                                        <div className="item">
                                            <div className="title-little">{doorData.list && doorData.list.length ? `11 of ${doorData.list.length}` : ''}</div>
                                        </div>
                                    </div>
                                </div>
                                <MTable
                                    isPreview={true}
                                    columns={this.state.columns}
                                    rows={doorData.list}
                                    className="preview-table"
                                    canAction={false}
                                    isLoading={doorData.isLoading}
                                    getData={(pageParam) => this.getData(pageParam)}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} className="content-10-2">
                            {outTimeList.isLoading ?
                                <div className="loading-content-little"> <CircularProgress /> </div> :
                                <Paper className="item-content">
                                    <div className="chart-title">
                                        <div className="left-content" onClick={() => this.getTodetail('doorCabinet', { tag: '超时' })}>
                                            <div className="title">装柜超时</div>
                                            <div className="subtitle">根据装柜时长查看</div>
                                        </div>
                                        <div className="right-content">
                                            {/* <span className="title-little">{outTimeList.length ? `4 of ${outTimeList.length}` : ''}</span> */}
                                        </div>
                                    </div>
                                    <List setDefaultSelect={setDefaultSelect} list={outTimeList || []} getTodetail={this.getTodetail} getData={this.getOutTimeData} />
                                </Paper>
                            }
                        </Grid>
                    </Grid>

                </div>
            </div>)
    }
}

const mapStateToProps = (state) => {
    const list = getWarehouseList(state)
    return {
        warehouseList: list
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withRouter(outControlPage));
