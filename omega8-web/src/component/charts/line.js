import React from 'react';
import '../../styles/charts.less'
import NativeSelect from '@material-ui/core/NativeSelect'
//echarts compoment
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
//utils
import { chartConfig, BootstrapInput } from 'utils/chartHelper'

class LineChart extends React.Component {
    constructor(props) {
        super()
        this.state = {
            type: '',
            EventsDict: {
                'click': this.onChartClick,
            }
        }
    }

    onChartClick = (params) => {
        const { isPreview } = this.props
        const { detailPath } = this.props
        const parms = {
            isNextDay: true
        }
        if (isPreview && this.props.getTodetail) {
            this.props.getTodetail(detailPath, parms)
        }
    }

    changeSelect = event => {
        const value = event.target.value
        this.setState({
            type: event.target.value
        },() => {
            this.props.getData && this.props.getData(value)
        })
    }

    componentWillReceiveProps (nextProps) {
        if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) {
            this.setState({
                type: '',
            })
        }
    }
   
    render() {
        const { data, canSelect } = this.props
        const myOptions = {
            tooltip: chartConfig.tooltip,
            legend: {
                data: data.legend || ['重货', '抛货', '总计'],
                ...chartConfig.legend,
            },
            grid: {
                left: '5%',
                right: '8%',
                bottom: '11%',
                top: '3%',
                containLabel: true
            },
            color: ['#009688', '#E8743B', '#19A979'],
            xAxis: {
                nameTextStyle: {
                    fontSize: 14
                },
                boundaryGap: false,
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    align: 'center',
                },
                data: data.Xlist,
            },
            yAxis: {
                axisTick: {
                    show: false,
                },
                minInterval: 1,
                type: 'value',
                // max: function(value) {
                //     return value.max + 10
                // },
                axisLabel: {
                    lineStyle: {
                        color: '#9B9B9B',
                    },
                    formatter: function (data) {
                        if (data >= 10000) {
                            return data / 1000 + 'K'
                        } else {
                            return data
                        }
                    }
                }
            },
            series: [],
        }
        if (data) {
            for (let key in data.series) {
                if (key !== 'time') {
                    myOptions.series.unshift({
                        name: key === 'total' ? '总计' : key,
                        type: 'line',
                        symbol: 'circle',
                        symbolSize: 10,
                        lineStyle: {
                            normal: {
                                width: 2,
                                type: this.props.lineType || 'dashed'
                            }
                        },
                        data: data.series[key]
                    })
                }
            }
        }
        return (
            <div className="charts-continer">
                <div className="chart-options">
                <span className="unit">{'箱数'}</span>
                {
                    canSelect && 
                    <NativeSelect
                    className="chart-select"
                    // defaultValue={''}
                    value={this.state.type}
                    onChange={this.changeSelect}
                    input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                >
                    <option value={''}>全部</option>
                    <option value={'XDK'}>XDK</option>
                    <option value={'SSTK'}>SSTK</option>
                </NativeSelect>
                }
                </div>
                <ReactEchartsCore
                    echarts={echarts}
                    option={myOptions}
                    notMerge={true}
                    onEvents={this.state.EventsDict}
                    style={{ width: '100%', height: '394px' }}
                />
            </div>)
    }
}

export default LineChart
