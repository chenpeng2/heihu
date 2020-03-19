import React from 'react'
//引入路由
import {Route, Switch, Redirect, withRouter} from 'react-router-dom'
//pages
import CommonDailyReport from 'component/pages/reports/CommonDailyReport'
import QCDataPage from 'component/pages/QCData'
import WeeboReport from 'component/pages/reports/historyReport'
import SNDailyReport from 'component/pages/reports/SNdailyReport'
import CWNDailyReport from 'component/pages/reports/CWNDailyReport'
import WHDailyReport from 'component/pages/reports/WHdailyReport'
import HXDailyReport from 'component/pages/reports/HXdailyReport'
import MasterDataPage from 'component/pages/masterData'
import delayDataPage from 'component/pages/delayData'
import factoryDataPage from 'component/pages/factoryData'
import regionDataPage from 'component/pages/regionData'
import projectTypeDataPage from 'component/pages/projectTypeData'
import projectManagerDataPage from 'component/pages/projectManagerData'
import productionSchedulePage from 'component/pages/productionData'
import inputProductionPage from 'component/pages/inputProductionPage'
import ErrorPage from 'component/pages/403Page'
import { getloginState } from 'redux/selectors/loginSelector'
import { connect } from "react-redux"
class ContentMain extends React.Component {
    render() {
        const { userInfo } = this.props
        const { userRole } = userInfo || {}
        const errorPage = localStorage.getItem('error_page')
        const productionSchedule = ({ match }) => (
            <div>
              <Route path={`${match.url}/addData`} component={inputProductionPage} exact/>
              <Route path={`${match.url}`} component={productionSchedulePage} exact/>
              <Route path={`${match.url}/editData`} component={inputProductionPage} exact/>
            </div>
        ) 
        return (
            <div>
                <Switch>
                    <Route path='/qcData' exact component={QCDataPage}></Route>
                    <Route path='/masterData' component={MasterDataPage}></Route>
                    <Route path='/dailyReport' component={CommonDailyReport}></Route>
                    <Route path='/WeeboReport' component={WeeboReport}></Route>
                    <Route path='/SNReport' component={SNDailyReport}></Route>
                    <Route path='/delayData' component={delayDataPage}></Route>
                    <Route path='/CWNDailyReport' component={CWNDailyReport}></Route>
                    <Route path='/WHDailyReport' component={WHDailyReport}></Route>
                    <Route path='/HXDailyReport' component={HXDailyReport}></Route>
                    <Route path='/factoryData' component={factoryDataPage}></Route>
                    <Route path='/regionData' component={regionDataPage}></Route>
                    <Route path='/projectTypeData' component={projectTypeDataPage}></Route>
                    <Route path='/projectManagerData' component={projectManagerDataPage}></Route>
                    <Route path='/productionSchedule' component={productionSchedule}></Route>
                    <Route path='/productionSchedulePreview' component={productionSchedule}></Route>
                    <Route path='/403error' component={ErrorPage} />
                    {
                        userRole.includes('TMS-QC') &&
                        <Redirect path="/" to={{pathname: '/qcData'}} />
                    }
                    {
                        userRole.includes('TMS-MASTER') && 
                        <Redirect path="/" to={{pathname: '/masterData'}} />
                    }
                    { 
                        (errorPage ||  (!userRole.includes('TMS-MASTER') && !userRole.includes('TMS-QC')) ) && 
                        <Redirect path="/*" to={{pathname: '/403error'}} />
                    }
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
      userInfo,
    }
  }
  
  const mapDispatchToProps = (dispatch) => {
    return {}
  }
  
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ContentMain))