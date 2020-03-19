import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import ParetoChart from 'component/charts/pareto'
import Dashboard from 'component/charts/dashboard'
import PieChart from 'component/charts/pie'
import LineChart from 'component/charts/line'

class ControlPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            wheelScrapPareto: {}, //X光检测轮毂报废数量
            wheelScrapPie: [], //报废原因饼状图
            wheelScrapTrend: [], //报废数量趋势折线图
        }
    }
    render() {
        const {wheelScrapPareto,wheelScrapPie,wheelScrapTrend,isWheelScrapPareto,isWheelScrapPie,isWheelScrapTrend} = this.state;
        return (
        <div>
            {/*<div className="subtitle-panel">*/}
                {/*X光检测监控*/}
            {/*</div>*/}
            <div className="main-panel-dark">
                <Dashboard />
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md10 ms-lg8">
                        <div className="chart-title">
                            报废数量积累
                            <p className="time-text">2019-06-12 12:03</p>
                        </div>
                        <ParetoChart paretoData={wheelScrapPareto} isWheelScrapPareto={isWheelScrapPareto} styleSheet={{ height: '600px', bottom: '140' }}/>
                    </div>
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md2 ms-lg4">
                        <div className="chart-title">
                            报废原因
                            <p className="time-text">2019-06-12 12:03</p>
                        </div>
                        <PieChart wheelScrapPie={wheelScrapPie} isWheelScrapPie={isWheelScrapPie} styleSheet={{ height: '600px' }}/>
                    </div>
                </div>
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <div className="chart-title">
                            报废数量趋势
                            <p className="time-text">2019-06-12 12:03</p>
                        </div>
                        <LineChart wheelScrapTrend={wheelScrapTrend} isWheelScrapTrend={isWheelScrapTrend} styleSheet={{ height: '300px' }}/>
                    </div>
                </div>
                
            </div>
        </div>)
    }
}

const mapStateToProps = (state) => {
    return {
      list: state,
    }
}
  
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(RouteActionCreators, dispatch);
}
  
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ControlPage);