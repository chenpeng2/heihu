import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent } from 'framework7-react';

import Line from '../../charts/fenhuo/line'
import { connect } from 'react-redux'

class CardContext extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            detail: {},
            chartData: null
         };
    }

    getAppoinment() {
        window.axios({
            url: '/statistic/receipt/appointment?isnextday=true',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({
                    detail: JSON.parse(res.data)
                })
            })
        })
    }

    getOverview() {
        window.axios({
            url: '/chart/receipt/appointment/time/detail?isnextday=true',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({
                    chartData: this.formatChartData(JSON.parse(res.data))
                })
            })
        })
    }
    formatChartData(data) {
        if(!data || !data.length) {
            return null
        }
        let chartData = {
            Ylist: [],
            series: [[], [], []]
        }
        data.map( (item, key) => {
            chartData.Ylist.push(item.time);
            chartData.series[0].push(item.heavy);
            chartData.series[1].push(item.light);
            chartData.series[2].push(item.total);
        })
        return chartData
    }

    componentDidMount() {
        this.getAppoinment();
        this.getOverview()
    }

    render() {
        const { pageLoaded, linkTo } = this.props;
        const { chartData, detail } = this.state
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">明日预约未到货量</div>
                        <div className="count"><span className="strong">{ typeof detail.total === 'undefined' ? '--' : detail.total }</span> { detail.utd }</div>
                        <span className="name">总计</span>
                    </div>
                    <div className="meta">
                        <span className="label">重货</span>
                        <div>{ typeof detail.heavy === 'undefined' ? '--' : detail.heavy }{ detail.utd }</div>
                    </div>
                    <div className="meta">
                        <span className="label">抛货</span>
                        <div>{ typeof detail.light === 'undefined' ? '--' : detail.light  }{ detail.utd }</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div style={{ marginBottom: '10px', color: '#4A4A4A', fontSize: '14px' }}>{ detail.utd }数</div>
                    { pageLoaded && chartData ? <Line chartData={chartData} linkTo={ linkTo } /> : '' }
                </CardContent>
            </Card>
        )
    }
  };  
  const mapDispatch = (dispatch) => {
    return {
        
    }
    }

    const mapState = (state) => {
        return {
        depart: state.department.depart,
        pageLoaded: state.board.pageLoaded
        }
    }

  export default connect(mapState, mapDispatch)(CardContext)