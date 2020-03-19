import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
class LineChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        const data =['12:00','12:00','12:00','12:00','12:00','12:00','12:00'];
        const myOptions = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['温度1','温度2','温度3','温度4'],
                top:40,
                right:'1%',
                orient: 'vertical',
                icon:'rect',
                itemGap:20
            },
            grid:{
                left:'5%',
                right:'5%'
            },
            color: ['#5899DA', '#E8743B','#19A979','#945ECF','#945ECF','#13A4B4','#525DF4','#6C8893','#EE6868','#2F6497'],
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data
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
                    name:'温度1',
                    type:'line',
                    showSymbol: false,
                    data:[120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name:'温度2',
                    type:'line',
                    showSymbol: false,
                    data:[220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name:'温度3',
                    type:'line',
                    showSymbol: false,
                    data:[150, 232, 201, 154, 190, 330, 410]
                },
                {
                    name:'温度4',
                    type:'line',
                    showSymbol: false,
                    data:[820, 932, 901, 934, 10, 330, 130],
                    markLine: {
                        data: [[
                            {coord:['12:00',0],symbol:'symbol',symbolSize:12,symbolRotate:180},
                            {coord:['12:00',1500],symbol:'none',symbolSize:0}//如何获取grid上侧最大值，目前是写死的
                        ]],
                        lineStyle:{
                            type:'dashed'
                        }
                    }
                }
            ]
        }
        return (
            <div className="chart-line">
                <ReactEcharts option={myOptions}/>
            </div>
        )
    }
}

export default LineChart
