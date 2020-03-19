import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import BarLine from '../../charts/fenhuo/barLine'
import ActionInner from '../../action-inner'
import { connect } from 'react-redux'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        actionOpend: false,
        detail: [],
        total: null,
        utd: '',
        chartData: null,
        model: '分拣类型',
        models: ['分拣类型', '货物类型', '门店类型'],
        keyMap : {
            heavy: '重货',
            light: '抛货',
            limit: '满载',
            scan: '扫描类型',
            voice: '声控类型',
            hyper: '大卖场',
            super: '社区店',
            jd: '京东'
        }
      };
    }

    actionClick = (item, key) => {  // 切换
        this.getReceiptingDetail(key === 0 ? 2 : ( key === 1 ? 1 : 3 ))
        this.setState({
            model: item
        });
        this.refs.actionsPop.close()
    }

    getReceiptingDetail(category) {
        window.axios({
            url: '/chart/receipt/receipting/stored/detail?category=' + category,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data)
                this.setState({
                    total: data.total,
                    utd: data.utd,
                    detail: Object.keys(data).map( (item, key) => { 
                        if(item !== 'detail' && item !== 'total' && item !== 'utd') {
                            return { name: item, value: data[item] }
                        }
                    }),
                    chartData: this.formatChartData(data.detail)
                })
            })
        })
    }

    exchangeKey(data) {
        const { keyMap } = this.state
        return Object.keys(data).reduce((newData, key) => {
                    let newKey = keyMap[key] || key
                    newData[newKey] = data[key]
                    return newData
                }, {})
    }

    formatChartData = (data) => {
        if(!data || !data.length ) {
            return null
        }
        const chartData = {
            Ylist: [],
            series: {},
            series_1: {'满载': []},
            legend: [{name: '拥堵', type: 'bar'}, {name: '可能拥堵', type: 'bar'},{name: '通畅', type: 'bar'}, {name: '满载', type: 'line'}],
            used: []
        }
        let legend = [];
        let detail = {};
        const { keyMap } = this.state;
        data.forEach((item, key) => {
            chartData.Ylist.push('仓库' + item.whsId)
            for(let key in item) {
                if(key !== 'whsId' && key !== 'used' && key !== 'limit') {
                    const key_zh = keyMap[key]
                    if( !( key_zh in chartData.series ) ) {
                        chartData.series[key_zh] = []
                    }
                    chartData.series[key_zh].push(item[key])
                    if( key !== 'limit' ) {
                        if( !( key in detail ) ) {
                            detail[key] = 0;
                            legend.unshift({
                                name: key_zh,
                                type: 'bar'
                            })
                        }
                    }
                }
                if(key === 'limit') {
                    chartData.series_1['满载'].push(item[key])
                }
                if(key === 'used') {
                    chartData.used.push(item[key])
                }
            }
        })
        chartData.legend = chartData.legend.concat(legend)
        return chartData
    }

    componentDidMount() {
        this.getReceiptingDetail(2)
    }

    render() {
        const { model, models, actionOpend, chartData, detail, total, keyMap, utd } = this.state;
        const { pageLoaded } = this.props
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">收货缓冲区板数</div>
                        <div className="count"><span className="strong">{ total }</span> { utd }</div>
                        <span className="name">总计</span>
                    </div>
                    {
                        detail.map( (item, key) => 
                            <div className="meta" key={key} style={{ display: item ? 'block' : 'none' }}>
                                <span className="label">{ item && keyMap[item.name] }</span>
                                <div>{ item && item.value }{ item && utd }</div>
                            </div>
                        )
                    }
                </CardHeader>
                <CardContent>
                    <div>
                        <span className="chart-title">{ utd }数</span>
                        <span 
                        className="select-link"
                        onClick={ () => this.refs.actionsPop.open() }
                        >{ model }<i className="sap-icon icon-slim-arrow-down"></i></span>
                    </div>
                    { pageLoaded && chartData ? <BarLine chartData={chartData} /> : '' }

                    {
                        chartData && Object.keys(chartData.legend).map( (item, key) => {

                        })
                    }
                    <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                        {
                            actionOpend ? 
                            <ActionInner
                                handleClick={ this.actionClick } 
                                list={ models } /> : ''
                        }
                    </Actions>
                </CardContent>
            </Card>
        )
    }
};
const mapDispatch = (dispatch) => {
    return { }
}

const mapState = (state) => {
    return {
        pageLoaded: state.board.pageLoaded
    }
}

export default connect(mapState, mapDispatch)(CardContext)  