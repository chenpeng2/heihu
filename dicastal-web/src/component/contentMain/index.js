import React from 'react'
//引入路由
import {Route, Switch, Redirect} from 'react-router-dom'
//pages
import ReportPage from 'component/pages/Report'
import MainPage from 'component/pages/Main'
import ControlPage from 'component/pages/ControlPage'
//分析工具
import DisAnalysisPage from 'component/pages/ShareTools/DisAnalysisPage'
import ParetoAnalysisPage from 'component/pages/ShareTools/ParetoAnalysisPage'
import InputDataPage from 'component/pages/InputData'
//原始数据
import HubPicData from 'component/pages/OriginalData/HubPicData'
import HubResult from 'component/pages/OriginalData/HubResult'
import HubStandard from 'component/pages/OriginalData/HubStandard'
//数据报告
import HubScrap from 'component/pages/DataReport/HubScrap'
import HubDefect from 'component/pages/DataReport/HubDefect'
//实时监控
import hubScrapMonitor from 'component/pages/TimeMonitor/hubScrapMonitor'
import hubDefectMonitor from 'component/pages/TimeMonitor/hubDefectMonitor'
class ContentMain extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path="/main" component={MainPage} />
                    <Route path="/control" component={ControlPage} />
                    {/*<Route path="/report" component={ReportPage} />*/}
                    {/*分析工具*/}
                    <Route path="/distributionAnalysis" component={DisAnalysisPage} />
                    <Route path="/paretoAnalysis" component={ParetoAnalysisPage} />
                    {/*原始数据*/}
                    <Route path="/hubPicData" component={HubPicData}></Route>
                    <Route path="/hubResult" component={HubResult}></Route>
                    <Route path="/hubStandard" component={HubStandard}></Route>
                    {/*数据报告*/}
                    <Route path="/hubScrap" component={HubScrap}></Route>
                    <Route path="/hubDefect" component={HubDefect}></Route>
                    {/*实时监控*/}
                    <Route path="/hubScrapMonitor" component={hubScrapMonitor}></Route>
                    <Route path="/hubDefectMonitor" component={hubDefectMonitor}></Route>
                    {/*<Route path="/inputData" component={InputDataPage}></Route>*/}
                    <Redirect path="/" to="/hubScrapMonitor" />
                </Switch>
            </div>
        )
    }
}

export default ContentMain