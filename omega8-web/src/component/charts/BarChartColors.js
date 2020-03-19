import React, { PureComponent } from 'react';
//echarts compoment
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
//material ui compoment
import NativeSelect from '@material-ui/core/NativeSelect'
//utils
import { chartConfig, BarColorList, BarRedColorList, BarYelllowColorList, BarGreenColorList, BootstrapInput } from 'utils/chartHelper'
const PREVIEW_CHART_HEIGHT = '366px'


export default class BarColors extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: '2',
            typeNameList: {
                '1': ['重货', '抛货'],
                '2': ['扫描类型', '声控类型'],
                '3': ['京东', '社区店', '大卖场'],
            },
        }
    }

    _getChartOverScreenHeight(options) {
        return options.series[0].data.length * 60
    }

    componentWillReceiveProps (nextProps) {
        if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) {
            this.setState({
                type: '2',
            })
        }
    }

    changeSelect = (event) => {
        const { getData } = this.props
        const type = event.target.value
        this.setState({
            type,
        }, () => {
            getData(type)
        })
    }

    render() {
        const { data, isManyColor, defaultType, manyType, hasFull, isPreview, isFullScreent, unit, selectList, changeType, showLegend } = this.props
        const { type, typeNameList } = this.state
        let showSeries = []
        if (manyType) {
            //多个颜色的深浅度按照数组的顺序排序
            typeNameList[defaultType || type].forEach(name => {
                if (data.series[name]) {
                    showSeries.push({
                        name: name,
                        data: data.series[name]
                    })
                }
            })
        } else {
            for (let key in data.series) {
                if (data.series[key].length) {
                    showSeries.push({
                        name: key,
                        data: data.series[key]
                    })
                }
            }
        }
        const list = showSeries.filter(item => item.name !== 'total' && item.name !== 'limit')
        const colorLength = list.length
        const options = {
            tooltip: {
                ...chartConfig.tooltip,
                show: true
            },
            legend: {
                selectedMode: false,
                right: 10,
                textStyle: {
                    fontSize: '12',
                },
                itemWidth: 16,
                itemHeight: 16,
                top: 0,
                orient: 'vertical',
                show: isManyColor ? false : showLegend,
                data: data.legend || ['重货', '抛货']
            },
            grid: {
                left: '2%',
                right: '5%',
                top: '10px',
                bottom: '3%',
                containLabel: true,
            },
            yAxis: {
                nameTextStyle: {
                    align: 'left'
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    color: '#4A4A4A',
                    interval: 0,
                    formatter: function (data) {
                        if (data >= 10000) {
                            return data / 1000 + 'K'
                        } else {
                            return data
                        }
                    }
                },
                type: 'value',
            },
            xAxis: {
                type: 'category',
                data: data.Xlist,
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
                    interval: 0
                }
            },
            color: BarColorList[colorLength],
            series: [
                {
                    name: '满载',
                    data: hasFull ? data.series.limit : [],
                    type: 'line',
                    symbol: 'rect',
                    symbolSize: [20, 2],
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
            showSeries.forEach(series => {
                let currentRedColor = BarRedColorList[colorLength] && BarRedColorList[colorLength][Math.min(options.series.length - 1, colorLength - 1)]
                let currentGreedColor = BarGreenColorList[colorLength] && BarGreenColorList[colorLength][Math.min(options.series.length - 1, colorLength - 1)]
                let currentYellowColor = BarYelllowColorList[colorLength] && BarYelllowColorList[colorLength][Math.min(options.series.length - 1, colorLength - 1)]
                if (series.name !== 'total' && series.name !== 'limit') {
                    options.series.push({
                        name: series.name,
                        type: 'bar',
                        stack: '总量',
                        itemStyle: {
                            color: isManyColor ? function (param) {
                                // 多种颜色表示状态的情况，根据limit 和 total 判断柱状图的阳色
                                if (data.series.total[param.dataIndex] / data.series.limit[param.dataIndex] >= 0.8) {
                                    return currentRedColor
                                } else if (data.series.total[param.dataIndex] / data.series.limit[param.dataIndex] > 0.5) {
                                    return currentYellowColor
                                } else {
                                    return currentGreedColor
                                }
                            } : options.color[options.series.length - 1] // 单一状态使用蓝色
                        },
                        barWidth: 38,
                        data: series.data
                    })
                }
            })
        }
        let chartHeight = PREVIEW_CHART_HEIGHT
        if (!isPreview) {
            chartHeight = isFullScreent ?
                window.document.body.offsetHeight - 100
                : window.document.body.offsetHeight - 300
        }
        return (
            <div className="charts-continer">
                <div className="chart-options">
                    <span className="unit" style={{ marginLeft: !isPreview ? '30px' : '' }}>{`${unit}数` || '板数'}</span>
                    {selectList && <NativeSelect
                        className="chart-select"
                        defaultValue={'All'}
                        onChange={this.changeSelect}
                        value={this.state.type}
                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                    >
                        {
                            selectList && selectList.map((option, index) => {
                                return <option key={index} value={option.value}>{option.title}</option>
                            })
                        }
                    </NativeSelect>}
                </div>

                <ReactEchartsCore
                    echarts={echarts}
                    option={options}
                    lazyUpdate={true}
                    notMerge={true}
                    style={{ width: '100%', height: chartHeight }}
                />
                {isManyColor &&
                    <div className="legend-content">
                        <div className="legend">
                            <div><span className="color red"></span>拥堵</div>
                            <div><span className="color warning"></span>可能拥堵</div>
                            <div><span className="color green"></span>通畅</div>
                            <div><span className="line blue"></span>满载</div>
                        </div>
                        {changeType && type === '2' &&
                            <div className="legend">
                                <div><span className="color grey-dark"></span>扫描类型</div>
                                <div><span className="color grey-light"></span>声控类型</div>
                            </div>
                        }
                        {changeType && type === '1' &&
                            <div className="legend">
                                <div><span className="color grey-dark"></span>重货</div>
                                <div><span className="color grey-light"></span>抛货</div>
                            </div>
                        }
                        {changeType && type === '3' &&
                            <div className="legend">
                                <div><span className="color grey-dark-most"></span>京东</div>
                                <div><span className="color grey-dark"></span>社区店</div>
                                <div><span className="color grey-light"></span>大卖场</div>
                            </div>}
                    </div>
                }
            </div>

        )
    }
}