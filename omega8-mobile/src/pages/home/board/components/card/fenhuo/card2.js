import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent } from 'framework7-react';

import BarLine from '../../charts/fenhuo/barLine';
import { connect } from 'react-redux'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          data: {},
          chartData: null
      };
    }

    getFillingDetail() {
        window.axios({
            url: '/chart/receipt/filling/stored/detail',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data)
                this.setState({
                    data,
                    chartData: this.formatChartData(data.detail)
                })
            })
        })
    }

    formatChartData = (data) => {
        if(!data || !data.length ) {
            return null
        }
        const chartData = {
            Ylist: [],
            used: [],
            series: {'占用': []},
            series_1: {'满载': []},
            legend: [{name: '拥堵', type: 'bar'}, {name: '可能拥堵', type: 'bar'},{name: '通畅', type: 'bar'}, {name: '满载', type: 'line'}]
        }
        data.forEach((item, key) => {
            chartData.Ylist.push('仓库' + item.whsId);
            chartData.series['占用'].push(item.used);
            chartData.series_1['满载'].push(item.limit);
            chartData.used.push(item.used);
        })
        return chartData
    }

    componentDidMount() {
        this.getFillingDetail()
    }

    render() {
        const { pageLoaded } = this.props;
        const { chartData, data } = this.state;
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">分货部待转C区板数</div>
                        <div className="count"><span className="strong">{ data.total }</span> { data.utd }</div>
                        <span className="name">总计</span>
                    </div>
                    <div className="meta">
                        <span className="label">一期</span>
                        <div>{ data.group1 }{ data.utd }</div>
                    </div>
                    <div className="meta">
                        <span className="label">二期</span>
                        <div>{ data.group2 }{ data.utd }</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <span className="chart-title">{ data.utd }数</span>
                    { pageLoaded && chartData ? <BarLine chartData={chartData} /> : '' }
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