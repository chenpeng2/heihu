import React from 'react'
import '../../styles/charts.less'
import  moment from 'moment'
class Dashboard extends React.Component {
    // getOtionTem() {
       
    //     return option;
    // }
    renderItem(dashboardItem) {   
         return (
                <div className="dashboard-item-panel charts-continer ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                    <p>{dashboardItem.name}</p>
                    <p>{dashboardItem.time}</p>
                    <p>{dashboardItem.value}</p>
                </div>
            )        
    }
    render() {
        let { dashboardList } = this.props;
        dashboardList = dashboardList?dashboardList:[];
        return (
            <div className="dashboard-continer ms-sm12 ms-md12 ms-lg12">
                {
                    dashboardList.map((dashboardItem, index) => {
                        return (
                            <div key={index} className="dashboard-item-panel ms-sm12 ms-md6 ms-lg3">
                                <div className="item-top">
                                    <div className="title">
                                        {dashboardItem.name}
                                        <div className="time-text">{dashboardItem.time}</div>
                                    </div>
                                    {this.props.showArrow ? <div className="range" style={{color: dashboardItem.isImprove ? '#107e3e': '#BB0000'}}>
                                        {dashboardItem.isImprove ?
                                            <img src={require('../../asstes/images/arrow-green.png')} />
                                            : <img src={require('../../asstes/images/arrow-red.png')} />}
                                        {dashboardItem.chanegRange}
                                    </div> : null}

                                </div>

                                { index === 1 && <div className="positive-text value-text" >{dashboardItem.value}</div>}
                                { index === 3 && <div className="negative-text value-text" >{dashboardItem.value}</div>}
                                { (index === 0 ||  index === 2) && <div className="value-text" >{dashboardItem.value}</div> }
                            </div>
                        )
                    })

                }
                
            </div>
        )
    }
}


export default Dashboard
