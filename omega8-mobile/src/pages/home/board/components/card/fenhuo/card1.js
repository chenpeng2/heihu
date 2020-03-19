import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent } from 'framework7-react';

import Bar from '../../charts/fenhuo/bar'
import Span from '../../../../../../components/span'

import { connect } from 'react-redux'


class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          detail: {},
          chartData: null,
          keyMap: {
              'past': '过去',
              'now': '现在'
          }
      }
    }

    getAppoinment() {
        window.axios({
            url: '/statistic/receipt/appointment',
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
            url: '/chart/receipt/appointment/time/overview',
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
            series: [[], []],
            total: []
        }
        const { keyMap } = this.state;
        data.map( (item, key) => {
            chartData.Ylist.push( (item.time in keyMap) ? keyMap[item.time] : item.time );
            chartData.series[0].push(item.heavy);
            chartData.series[1].push(item.light);
            chartData.total.push(item.total);
        })
        return chartData
    }

    componentDidMount() {
        this.getAppoinment();
        this.getOverview()
    }

    render() {
        const { chartData, detail } = this.state;
        const { pageLoaded, linkTo } = this.props;
        const time = new Date();
        const timeStr = time.getFullYear() + '年' + (time.getMonth() + 1) +'月' + time.getDate() + '日'
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">预约未到货量</div>
                        <div className="count"><span className="strong">{ detail.total }</span>  { detail.utd }</div>
                        <span className="name">总计</span>
                    </div>
                    <div className="meta">
                        <span className="label">重货</span>
                        <div>{ detail.heavy }{ detail.utd }</div>
                    </div>
                    <div className="meta">
                        <span className="label">抛货</span>
                        <div>{ detail.light }{ detail.utd }</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <span className="chart-title">{ (detail.utd ? detail.utd : '') + '数  今天 ' + timeStr }</span>
                    { pageLoaded && chartData ? <Bar chartData={ chartData } linkTo={ linkTo } /> : <div className="span-wrapper"><Span /></div> }
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