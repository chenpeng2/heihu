import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'
import NoData from 'component/common/noData'

class ParetoChart extends React.Component {
    getLocalItem(){
        const smallView = localStorage.getItem('smallView');
        const leftDistance = smallView?'120px':'6.2%';
        const rightDistance = smallView?'120px':'6.2%';
        this.setState({leftDistance,rightDistance})
    }
    UNSAFE_componentWillMount(){
        this.getLocalItem()
        window.addEventListener('resize',() => {
            this.getLocalItem()
        })
    }
    render() {
        const { paretoData, styleSheet, isWheelScrapPareto } = this.props;
        const xDimension = paretoData && paretoData.xDimension?paretoData.xDimension:[];
        const countNum = paretoData && paretoData.countNum?paretoData.countNum:[];
        let countPercent = paretoData && paretoData.countPercent?paretoData.countPercent:[], newCountPercent = [];
        if(countPercent.length){
            countPercent.map((item, index) => {
                newCountPercent.push((item * 100).toFixed(1))
            })
        }
        const {leftDistance,rightDistance}=this.state;
        const myOptions = {
            title: {
                text:'缺陷类型',
                x:'center',
                bottom: 0
            },
            legend: {
                data:['发生次数','占比'],
                right: 190,
                top: 0
            },
            grid: {
                top: '60',
                bottom: styleSheet && this.props.styleSheet.bottom ? this.props.styleSheet.bottom : '100px',
                left: styleSheet && this.props.styleSheet.left ? this.props.styleSheet.left : leftDistance,
                right: styleSheet && this.props.styleSheet.right ? this.props.styleSheet.right : rightDistance,
            },
            axisPointer: {
                label: {
                    precision: 0
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            color: ['#286EB4', '#E9730C'],
            xAxis: [
                {
                    type: 'category',
                    data: xDimension,
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisPointer: {
                        type: 'shadow'
                    },
                    axisLabel: {
                        margin: 28,
                        rotate: xDimension.length > 15 ? 30 : 0,
                        formatter: function (value, index) {
                            // 10 6 这些你自定义就行
                            var v = value.substring(0, 6) + '...'
                            return value.length > 10 ? v : value
                        }
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '发生次数',
                    min: 0,
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                {
                    type: 'value',
                    name: '占比',
                    min: 0,
                    max: 100,
                    interval: 20,
                    axisLabel: {
                        formatter: '{value} %'
                    }
                }
            ],
            series: [
                {
                    name:'发生次数',
                    type:'bar',
                    data:countNum.sort(function (a, b) {
                        return b - a
                    }),
                    barMaxWidth: '40',
                },
                {
                    name:'占比',
                    type:'line',
                    yAxisIndex: 1,
                    data:newCountPercent.sort(function (a, b) {
                        return a - b
                    })
                }
            ]
        }        
        return (
        <div className="charts-continer">
            {xDimension.length?<ReactEcharts option={myOptions} style={{width: '100%',height: styleSheet ? styleSheet.height:'300px'}}/>
            :<NoData height={styleSheet.height} isWheelScrapPareto={isWheelScrapPareto}/>}
        </div>)
    }
}

export default ParetoChart
