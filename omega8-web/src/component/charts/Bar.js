import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts'; 
import '../../styles/charts.less'
import { BarColorList } from 'utils/chartHelper'

class BarChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            EventsDict: {
                'click': this.onChartClick,
            },
        }
    }

    onChartClick = (params) => {
        const { detailPath } = this.props
        this.props.getTodetail(detailPath, { isNextDay: false})
    }
    
    changeSelect = event => {
        const { getData } = this.props
        getData(event.target.value)
    }
    render() {
        const { data, unit } = this.props
        const myOptions = {
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
            legend: {
                data: ['重货', '抛货'],
                left: 10,
                heigth: '5px',
                textStyle: {
                    fontSize: '10',
                },
                itemWidth: 12,
                itemHeight: 7,
                bottom: 10,
            },
            grid: {
                left: '3%',
                right: '5%',
                top: '12%',
                containLabel: true
            },
            xAxis: {
                type : 'category',
                data : data.Xlist,
                axisLine: {
                    show: true,
                },
                axisTick: {
                    show: false,
                },
            },
            yAxis: {
                minInterval: 1,
                type: 'value',
                name: `${unit}数`
,               axisTick: {
                    show: false,
                },
                axisLabel: {
                    lineStyle: {
                        color: '#9B9B9B',
                    },
                    formatter: function (data) {
                        if (data >= 10000) {
                            return  data / 1000 + 'K'
                        } else {
                            return data
                        }   
                    }
                }
            },
            color: BarColorList[2],
            series: [
                {
                    name: '重货',
                    type: 'bar',
                    stack: '总量',
                    barWidth: 36,
                    data: data.series.heavy
                },{
                    name: '抛货',
                    type: 'bar',
                    stack: '总量',
                    barWidth: 36,
                    data: data.series.light
                }
            ]
        }
        return (
            <div className="charts-continer">
                <ReactEchartsCore
                    echarts={echarts}
                    lazyUpdate={true}
                    notMerge={true}
                    option={myOptions} 
                    onEvents={this.state.EventsDict} 
                    style={{ width: '100%', height: '450px' }} 
                />
            </div>
        )
    }
}

export default BarChart
