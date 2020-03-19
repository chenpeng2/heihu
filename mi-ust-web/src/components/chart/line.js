import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import Mock from 'mockjs';
class LineChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        const data = Mock.mock({
            "array|1000-1000": [
                '12:00'
            ]
        })
        const myOptions = {
            tooltip: {
                trigger: 'axis'
            },
            grid:{
              left:'5%',
              right:'5%'
            },
            color: ['#5899DA', '#E8743B','#19A979','#945ECF','#945ECF','#13A4B4','#525DF4','#6C8893','#EE6868','#2F6497'],
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.array
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: false
                }
            },
            visualMap: {
                show: false,
                dimension: 0,
                pieces: [{
                    lte: 2,
                    color: '#5899DA'
                }, {
                    gt: 2,
                    lte: 3,
                    color: 'red'
                }, {
                    gt: 3,
                    lte: 14,
                    color: '#5899DA'
                },{
                    gt: 14,
                    color: '#5899DA'
                }]
            },
            series: [
                {
                    name:'温度',
                    type:'line',
                    showSymbol: false,
                    data:Mock.Random.range(1000),
                    markLine: {
                                data: [[
                                    {coord:['12:00',0],symbol:'symbol',symbolSize:12,symbolRotate:180},
                                    {coord:['12:00',1000],symbol:'none',symbolSize:0}//如何获取grid上侧最大值，目前是写死的
                                ]],
                                lineStyle:{
                                    type:'dashed'
                                }
                    }
                }
            ]
            // series: {
            //     name: 'Beijing AQI',
            //     type: 'line',
            //     data: data.map(function (item) {
            //         return item[1];
            //     }),
            //     symbol: 'circle',
            //     symbolSize: 0,
            //     lineStyle: {
            //         normal: {
            //             width: 2
            //         }
            //     },
            //
            //     markLine: {
            //         data: [[
            //             {coord:['12:00',0],symbol:'symbol',symbolSize:12,symbolRotate:180},
            //             {coord:['12:00',150],symbol:'none',symbolSize:0}//如何获取grid上侧最大值，目前是写死的
            //         ]],
            //         lineStyle:{
            //             type:'dashed'
            //         }
            //     }
            // }
        }
        return (
            <div className="chart-line">
                <ReactEcharts option={myOptions}/>
            </div>
        )
    }
}

export default LineChart
