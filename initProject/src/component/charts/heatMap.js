import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'
import NoData from 'component/common/noData'

class HeatMapChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hours:[], //X轴
            days:[], //Y轴
            data:[]
        }
    }
    doPaintHotMap(nextProps){
        const paretoData = nextProps.paretoData;
        const hours =paretoData.xDimension;
        this.setState({hours});
        let daysArr = [], allDataArr = [];
        paretoData.resultList.length && paretoData.resultList[0].map((item,index)=>{
            daysArr.push(item.typeName)
        })
        //还要去查看在Y轴是第几行

        paretoData.resultList.map((item,index)=>{
            item.map((itm,idx)=>{
                const { xDimension, yDimension } = nextProps.headMapName;
                if(xDimension > yDimension){
                    allDataArr.push([index, idx ,itm.countNum ? itm.countNum : '-'])
                }else{
                    allDataArr.push([idx, index ,itm.countNum ? itm.countNum : '-'])
                }
            })
        })
        this.setState({days : paretoData.xDimension, hours: daysArr, data: allDataArr});
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.paretoData != this.props.paretoData){
            this.doPaintHotMap(nextProps)
        }
    }
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
        const {isParetoData,styleSheet,headMapName}=this.props;
        let { hours, days, data,leftDistance,rightDistance } = this.state;
        const xArr = ['轮毂类型','缺陷类型','报废原因','缺陷所在区域'],yArr = ['轮毂类型','缺陷类型','报废原因','缺陷所在区域','最大面积','最大长度','滑动评价区域最大缺陷面积'];
        const xDimension = headMapName&&headMapName.xDimension;
        const yDimension = headMapName&&headMapName.yDimension;
        const xBy = xDimension && (xDimension>yDimension);
        const xData = xBy ? days:hours;
        const yData = xBy ? hours:days;
        const axisLabelX ={
            show:true,
            interval: 0,
            rotate: xData.length > 15 ? 30 : 0,
            textStyle: {
                fontSize: xData.length > 15?10:13
            },
            formatter: function (value, index) {
                // 10 6 这些你自定义就行
                var v = value.substring(0, 6) + '...'
                return value.length > 10 ? v : value
            }
        }
        const axisLabelY ={
            show:true,
            interval: 0,
            formatter: function (value, index) {
                // 10 6 这些你自定义就行
                var v = value.substring(0, 6) + '...'
                return value.length > 10 ? v : value
            }
        }
        const myOptions = {
            tooltip: {
                position: 'top'
            },
            animation: false,
            grid: {
                left: styleSheet && this.props.styleSheet.left ? this.props.styleSheet.left : leftDistance,
                right: styleSheet && this.props.styleSheet.right ? this.props.styleSheet.right : rightDistance,
                bottom: styleSheet && this.props.styleSheet.bottom ? this.props.styleSheet.bottom : '20%',
            },
            color:['#5899DA', '#E8743B','#1AA979','#ED4A7B','#945ECF','#13A4B4','#525DF4','#6C8893','#EE6868','#2F6497'],
            xAxis: {
                type: 'category',
                name: xArr[this.props.headMapName.xDimension - 1] || xArr[0],
                data: xData,
                splitLine: {
                    show: true,
                },
                axisLabel: axisLabelX
            },
            yAxis: {
                type: 'category',
                name: yArr[this.props.headMapName.yDimension - 1] || yArr[1],
                data: yData,
                splitNumber: 100,
                splitLine: {
                    show: false,
                },
                splitArea:{
                    show:true
                },
                axisLabel: axisLabelY
            },
            dataZoom: [//给x轴设置滚动条
                {
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
                },
                {
                    type: 'slider',
                    yAxisIndex: 0,
                    filterMode: 'empty',
                    height: '60%',//组件高度
                    width: 20, //组件宽度
                    right: 8,//右边的距离
                    bottom: 26,//底部的距离
                    start: 0,
                    end: yDimension==1 ? 25 : 55,
                    handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: 20,
                    showDetail: false,
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'empty',
                    zoomOnMouseWheel: false,
                    moveOnMouseMove: true
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    filterMode: 'empty',
                    zoomOnMouseWheel: false,
                    moveOnMouseMove: true,
                    moveOnMouseWheel: true
                }
            ],
            visualMap: {
                top: 0,
                right: 5,
                pieces: [{
                    gt: 0,
                    lte: 50,
                    color: '#5899DA'
                }, {
                    gt: 50,
                    lte: 100,
                    color: '#E8743B'
                }, {
                    gt: 100,
                    lte: 150,
                    color: '#1AA979'
                }, {
                    gt: 150,
                    lte: 200,
                    color: '#ED4A7B'
                }, {
                    gt: 200,
                    lte: 300,
                    color: '#945ECF'
                }, {
                    gt: 300,
                    color: '#13A4B4'
                }],
                outOfRange: {
                    // color: '#525DF4'
                }
            },
            series: [{
                name: 'Punch Card',
                type: 'heatmap',
                zoom: 1, //当前视角的缩放比例
                roam: true, //是否开启平游或缩放
                scaleLimit: { //滚轮缩放的极限控制
                    min: 1,
                    max: 2
                },
                data: data,
                label: {
                    normal: {
                        show: true
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        return (
            <div className="charts-continer">
                {data.length?<ReactEcharts option={myOptions} style={{width: '100%',height: styleSheet.height}}/>
                    :<NoData height={styleSheet.height} isWheelScrapTrend={isParetoData}/>}
            </div>)
    }
}

export default HeatMapChart

