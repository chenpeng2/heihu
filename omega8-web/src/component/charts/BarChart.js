import React, { PureComponent } from 'react';
//echarts compoment
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
//material ui compoment
import NativeSelect from '@material-ui/core/NativeSelect'
import {  BootstrapInput } from 'utils/chartHelper'
import CircularProgress from '@material-ui/core/CircularProgress'
export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            EventsDict: {
                'click': this.onChartClick,
            },
        }
    }

    changeSelect = (event) => {
        const unit = event.target.value
        this.setState({
            unit,
        })
        this.props.changeUnit(unit)
    }

    onChartClick = (params) => {
        const { name } = params
        const { detailPath } = this.props
        const param = {
            area: name
        }
        this.props.getTodetail(detailPath, param)
    }

    render() {
        const { hideControl, data } = this.props
        const { unit } = this.state
        const options = {
            tooltip: {
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
            color: ['#dc0d0e', '#0e8c62', '#da5a1b'],
            grid: {
                left: '3%',
                right: '5%',
                top: '10%',
                bottom: 10,
                containLabel: true
            },
            yAxis: {
                name : unit === 'util' ? '百分比（%）' : '板数（板）',
                type: 'value',
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: true,
                },
                axisLabel: {
                    lineStyle: {
                        color: '#9B9B9B',
                    },
                    color: '#4A4A4A',
                    formatter: function (data) {
                        if (data >= 10000) {
                            return  data / 1000 + 'K'
                        } else {
                            return data
                        }
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: ['仓库1', '仓库2', '仓库3', '仓库4', '仓库5', '仓库6', '仓库7'],
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#9B9B9B'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#E5E5E5'
                    }
                },
                axisLabel: {
                    color: '#4A4A4A',
                }
            },
            series: unit === 'util' ?
                [{
                    name: '已占用',
                    type: 'bar',
                    stack: '总量',
                    barWidth: 36,
                    data: []
                }] : [
                    {
                        name: '已占用',
                        type: 'bar',
                        stack: '总量',
                        barWidth: 36,
                        data: []
                    }, {
                        name: '满载',
                        data: [],
                        type: 'line',
                        symbol: 'rect',
                        symbolSize: [32, 2],
                        itemStyle: {
                            color: '#1866B4'
                        },
                        lineStyle: {
                            color: 'transparent'
                        }
                    }
                ]
        }
        if (data) {
            options.xAxis.data = data && data.Ylist
            if (unit === 'util') {
                options.series[0].data = data.series.utilData
                options.series[0].itemStyle = {
                    color: function (param) {
                        if (param.value >= 80) {
                            return '#DC0D0E'
                        } else if (param.value > 50 && param.value < 80) {
                            return '#DE890D'
                        } else if (param.value <= 50) {
                            return '#3FA45B'
                        }
                    }
                }
                options.yAxis.max = 100
            } else {
                options.series[0].data = data.series.data
                options.series[0].itemStyle = {
                    color: function (param) {
                        if (data.series.utilData[param.dataIndex] >= 80) {
                            return '#DC0D0E'
                        } else if (data.series.utilData && data.series.utilData[param.dataIndex] > 50 && data.series.utilData[param.dataIndex] < 80) {
                            return '#DE890D'
                        } else if (data.series.utilData && data.series.utilData[param.dataIndex] <= 50) {
                            return '#3FA45B'
                        }
                    }
                }
                options.series[1].data = data.series.totalData
            }
        }
        return (
            <div className="charts-continer">
                {!hideControl && <NativeSelect
                    className="chart-select"
                    defaultValue={'All'}
                    onChange={this.changeSelect}
                    input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                >
                    <option value={'number'}>板数</option>
                    <option value={'util'}>百分比</option>
                </NativeSelect>}
                {this.props.isLoading ?
                    <div className="loading-content">
                        <CircularProgress />
                    </div>
                    : <ReactEchartsCore
                    echarts={echarts}
                    option={options}
                    lazyUpdate={true}
                    notMerge={true}
                    onEvents={this.state.EventsDict}
                    style={{ width: '100%', height: '368px' }}
                />}
                <div className="legend legend-last">
                    <div><span className="color red"></span>拥堵</div>
                    <div><span className="color warning"></span>可能拥堵</div>
                    <div><span className="color green"></span>通畅</div>
                    <div><span className="line blue"></span>满载</div>
                </div>
            </div>

        )
    }
}
