import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import ActionInner from '../../action-inner';
import BarLine from '../../charts/fenhuo/barLineV'
import { connect } from 'react-redux'

import { setSorting } from '../../../../../../redux/action'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        actionOpend: false,
        total: '',
        utd: '',
        chartData: null,
        model: '分拣类型',
        models: ['分拣类型', '货物类型'],
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
        this.getStoredDone(key === 0 ? 2 : 1)
        this.setState({
            model: item
        });
        this.refs.actionsPop.close()
    }

    getStoredDone(category) {
        window.axios({
            url: '/chart/receipt/receipting/stored/done?category=' + category,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data)
                this.setState({
                    total: data.total,
                    utd: data.utd,
                    chartData: this.formatChartData(data.detail)
                })
                this.props.setSorting(data.total)
            })
        })
    }

    formatChartData = (data) => {
        if(!data || !data.length ) {
            return null
        }
        const chartData = {
            Ylist: [],
            series: {},
            legend: []
        }
        let total = 0;
        const { keyMap } = this.state;
        data.forEach((item, key) => {
            chartData.Ylist.push('仓库' + item.whsId);
            for(let key in item) {
                if(key !== 'whsId' && key !== 'used') {
                    const key_zh = keyMap[key]
                    if( !( key_zh in chartData.series ) ) {
                        chartData.series[key_zh] = []
                        chartData.legend.unshift(key_zh)
                    }
                    chartData.series[key_zh].push(item[key])
                }
            }
            total += item.used
        })
        this.setState({
            total
        })
        return chartData
    }

    componentDidMount() {
        this.getStoredDone(2)
    }

    render() {
        const { pageLoaded } = this.props;
        const { models, model, actionOpend, chartData, total, utd } = this.state
        return (
            <Card>
                    <CardHeader>
                        <div className="top">
                            <div className="title">当日累计分拣货量</div>
                            <div className="count"><span className="strong">{ total }</span> { utd }</div>
                            <span className="name">总计</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <span 
                            className="select-link"
                            onClick={ () => this.refs.actionsPop.open() }
                            >{ model }<i className="sap-icon icon-slim-arrow-down"></i></span>
                            { pageLoaded && chartData ? <BarLine chartData={chartData} /> : '' }
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
    return {
        setSorting(sorting) {
            return dispatch(setSorting(sorting))
        }
    }
}

const mapState = (state) => {
    return {
        pageLoaded: state.board.pageLoaded
    }
}

export default connect(mapState, mapDispatch)(CardContext)