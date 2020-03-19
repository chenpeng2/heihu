import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'
import NoData from 'component/common/noData'
import  moment from 'moment'
class ScatterChart extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            chart:''
        }
    }
    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.hotData !== this.props.hotData) {
            return true
        }
        return false
    }
    onChartReadyCallback = (chart) => {
        const _this = this;
        chart.dispatchAction({
            type: 'brush',
            areas: [
                {
                    brushType: 'lineX',
                    coordRange:  [],
                    xAxisIndex: 0
                }
            ]
        });
        const dd = this.props.hotData;
        //第一次去改变开始结束时间
        _this.props.changeTime(dd,1)
        if(dd.xDimension && dd.xDimension.length){
            chart.dispatchAction({
                type: 'brush',
                areas: [
                    {
                        brushType: 'lineX',
                        coordRange:  [dd.xDimension[0],dd.xDimension[1]],
                        xAxisIndex: 0
                    }
                ]
            });
        }
        chart.on('brushSelected', function (params) {
            //选择拖动区域，时间在变
            _this.props.changeTime(params)
        });
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        const chooseTime = nextProps.chooseTime;
        const {startTime,endTime} = chooseTime;
        this.setState({startTime,endTime})
    }
    getLocalItem(){
        const smallView = localStorage.getItem('smallView');
        const leftDistance = smallView?'120px':'6.2%';
        const rightDistance = smallView?'120px':'6.2';
        this.setState({leftDistance,rightDistance})
    }
    UNSAFE_componentWillMount(){
        this.getLocalItem()
        window.addEventListener('resize',() => {
            this.getLocalItem()
        })
    }
    render() {
        const { hotData,isParetoData,styleSheet} = this.props;
        const {leftDistance,rightDistance}=this.state;
        const options = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                triggerOn:'click',
                formatter:(params) => {
                    const nowClick=moment(params[0].name).valueOf();
                    const {startTime,endTime} = this.state;
                    const startTimeClick=moment(startTime).valueOf();
                    const endTimeClick=moment(endTime).valueOf();
                    if(nowClick<startTimeClick||nowClick>endTimeClick){return}
                    const startT = moment(startTime).format('YYYY-MM-DD');
                    const endT = moment(endTime).format('YYYY-MM-DD');
                    return [
                        '开始时间: ' + startT + '<hr size=1 style="margin: 3px 0">',
                        '结束时间: ' + endT + '<br/>'
                    ].join('');
                }
            },
            legend: {
                show: true,
                data:[]
            },
            grid: {
                left: styleSheet && this.props.styleSheet.left ? this.props.styleSheet.left : leftDistance,
                right: styleSheet && this.props.styleSheet.right ? this.props.styleSheet.right : rightDistance,
            },
            axisPointer: {
                link: {xAxisIndex: 'all'},
                label: {
                    backgroundColor: '#5899DA'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {},
                    brush: {
                        type: ['lineX', 'clear']
                    },
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            brush: {
                xAxisIndex: 'all',
                brushLink: 'all',
                outOfBrush: {
                    colorAlpha: 0.5
                }
            },
            dataZoom: [{
                type: 'inside',
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: true
            }, {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'empty',
                height: 20,//组件高度
                left: '5%', //左边的距离
                right: '5%',//右边的距离
                bottom: 0,//右边的距离
                start: 0,
                end: 50,
                handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handSize: 20,
                showDetail: false,
            }],
            xAxis: {
                type: 'category',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                data: hotData && hotData.xDimension ? hotData.xDimension : []
            },
            color: ['#5899DA', '#E8743B','#1AA979','#ED4A7B','#945ECF','#13A4B4','#525DF4','#6C8893','#EE6868','#2F6497'],
            yAxis: {
                name: '报废数量',
                splitLine: {
                },
                axisLine: {
                    show: false,
                }},
            series: [{
                name: '报废数量',
                type:'scatter',
                data: hotData && hotData.countNum ? hotData.countNum : [],
                label: {
                    emphasis: {
                        show: true,
                        position: 'right',
                        textStyle: {
                            color: 'blue',
                            fontSize: 16
                        }
                    }
                }
            }]
        }
        return (
            <div className="charts-continer">
                {hotData && hotData.xDimension && hotData.xDimension.length?<ReactEcharts option={options}
                                           style={{width: '100%'}}
                                           onChartReady={this.onChartReadyCallback}
                    />
                    :<NoData height={styleSheet.height} isWheelScrapTrend={isParetoData}/>}

            </div>)
    }
}

export default ScatterChart

