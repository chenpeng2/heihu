import React from 'react'
//引入路由
import {Route, Switch, Redirect} from 'react-router-dom'
//pages
import outControlPage from 'component/pages/outDepartment/ControlPage'
import DoorCabinetPage from 'component/pages/outDepartment/DoorCabinet'
import WillComePage from 'component/pages/outDepartment/WillCome'
import CZonePage from 'component/pages/outDepartment/CZone'

//pages
import splitControlPage from 'component/pages/splitDepartment/ControlPage'
import GMControlPage from 'component/pages/GM/ControlPage'
import AppartmentPage from 'component/pages/splitDepartment/Appartment'
import TimeOutDetailPage from 'component/pages/splitDepartment/TimeOutDetail'
import SSTKControlPage from 'component/pages/SSTK/ControlPage'
import PickingPage from 'component/pages/SSTK/PickingPage'
import PickingTimeOutPage from 'component/pages/SSTK/Pickingtimeout'

class ContentMain extends React.Component {
    render() {
        const { changeTitle } = this.props
        return (
            <div>
                <Switch>
                    <Route path="/GMControl" onEnter={changeTitle} component={GMControlPage} />
                    <Route path="/splitControl" onEnter={changeTitle} component={splitControlPage} />
                    <Route path="/outControl" onEnter={changeTitle} component={outControlPage} />
                    <Route path="/doorCabinet" onEnter={changeTitle} component={DoorCabinetPage} />
                    <Route path="/willCome" onEnter={changeTitle} component={WillComePage} />
                    <Route path="/cZone" onEnter={changeTitle}  component={CZonePage} />
                    <Route path="/appartment" onEnter={changeTitle} component={AppartmentPage} />
                    <Route path="/timeoutDetail" onEnter={changeTitle} component={TimeOutDetailPage} />
                    <Route path="/SSTKOverview" onEnter={changeTitle} component={SSTKControlPage} />
                    <Route path="/SSTKPick" onEnter={changeTitle} component={PickingPage} />
                    <Route path="/pickTimeOut" onEnter={changeTitle} component={PickingTimeOutPage} />
                    <Redirect path="/" to={{pathname: '/GMControl'}} />
                </Switch>
            </div>
        )
    }
}

export default ContentMain
