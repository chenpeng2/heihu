import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import '../../styles/charts.less'
import NativeSelect from '@material-ui/core/NativeSelect'
//utils
import { BarColorList, BootstrapInput } from 'utils/chartHelper'



const FULL_CHART_HEIGHT = window.document.body.offsetHeight - 100
const NORMAL_CHART_HEIGHT = window.document.body.offsetHeight - 300
const PREVIEW_CHART_HEIGHT = '406px'

class BarListChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            department: '',
            EventsDict: {
                'click': this.onChartClick,
                'legendselectchanged': this.onChartLegendselectchanged
            }
        }
    }

    _getChartOverScreenHeight(options) {
        return options.series[0].data.length * 60
    }

    getChartData() {
        const { getData, isPreview } = this.props
        if (isPreview) {
            getData(this.state.department)
        }
    }

    onChartClick = (params) => {
        const { isPreview } = this.props
        const { name, seriesName } = params
        const { detailPath } = this.props
        const parms = {
            area: name,
            department: seriesName,
        }
        if (isPreview && this.props.getTodetail) {
            this.props.getTodetail(detailPath, parms)
        }
    }

    changeSelect = (event) => {
        this.setState({
            department: event.target.value,
        }, () => {
            this.getChartData()
        })
    }

    componentWillReceiveProps (nextProps) {
        if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) {
            const { isPreview } = this.props
            if (isPreview) {
                this.setState({
                    department: '',
                })
            }
            
        }
    }

    render() {
        const { isPreview, showLegend, isFull, data, selectList } = this.props
        const myOptions = {
            tooltip: {
                show: true,
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                backgroundColor: '#ffffff',
                borderColor: '#d5d5d5d5',
                padding: [5, 10],
                borderWidth: 1,
                textStyle: {
                    color: '#32363A',
                    fontSize: 12,
                }
            },
            legend: isPreview ? {
                selectedMode: false,
                left: 10,
                heigth: '5px',
                textStyle: {
                    fontSize: '12',
                },
                itemWidth: 12,
                itemHeight: 7,
                bottom: 10,
            } :
                {
                    show: showLegend,
                    selectedMode: false,
                    heigth: '15px',
                    textStyle: {
                        fontSize: '12',
                    },
                    itemWidth: 16,
                    itemHeight: 16,
                    top: 10,
                    right: 10,
                    orient: 'vertical'
                },
            grid: isPreview ?
                {
                    left: '3%',
                    right: '5%',
                    top: '5%',
                    containLabel: true
                } : {

                    left: '3%',
                    right: '9%',
                    bottom: '3%',
                    containLabel: true
                },
            xAxis: {
                type: 'value',
                position: isPreview ? 'bottom' : 'top',
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    formatter: function (data) {
                        if (data >= 10000) {
                            return  data / 1000 + 'K'
                        } else {
                            return data
                        }   
                    }
                },
                axisTick: {
                    show: false,
                },
                // max: 3000,
            },
            yAxis: {
                type: 'category',
                data: data && data.Ylist,
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    lineStyle: {
                        color: '#9B9B9B',
                    },
                }
            },
            series: [],
        }
        if (data && data.series) {
            for (let key in data.series) {
                if (data.series[key].length) {
                    if (key !== 'total' && key !== 'limit') {
                    myOptions.series.push({
                        name: key,
                        type: 'bar',
                        stack: '总量',
                        barWidth: 36,
                        data: data.series[key]
                    })
                }
                }
            }
            myOptions.color = BarColorList[myOptions.series.length]
        }
        let chartHeight = PREVIEW_CHART_HEIGHT
        if (!isPreview) {
            chartHeight = isFull ?
                Math.max(FULL_CHART_HEIGHT, this._getChartOverScreenHeight(myOptions))
                : Math.max(NORMAL_CHART_HEIGHT, myOptions.series[0] && this._getChartOverScreenHeight(myOptions))
        }
        return (
            <div className={"charts-continer"}>
                {selectList &&
                    <NativeSelect
                        className="chart-select"
                        value={this.state.department}
                        onChange={this.changeSelect}
                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                    >
                        {
                            selectList && selectList.map((option, index) => {
                                return <option key={index} value={option.value}>{option.title}</option>
                            })
                        }
                    </NativeSelect>}
                <ReactEchartsCore
                    echarts={echarts}
                    option={myOptions}
                    notMerge={true}
                    // showLoading={this.props.isLoading}
                    onEvents={this.state.EventsDict}
                    style={{
                        width: this.props.width,
                        height: chartHeight
                    }}
                />
            </div>
        )
    }
}

export default BarListChart
