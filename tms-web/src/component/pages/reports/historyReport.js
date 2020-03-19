import React from "react"
import Header from 'component/common/Header'
import DailyReport from 'component/common/DailyReport'

class WeeboReport extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() { 
        return (
        <div>
            <Header />
           <DailyReport reportUrl={'https://fine.blacklake.cn/webroot/decision/view/report?viewlet=%25E9%25BB%2591%25E6%25B9%2596%25E6%258A%25A5%25E8%25A1%25A8%252FTMS%252Fdaily_production2.cpt&ref_t=design&op=view&ref_c=680f3f9e-c24d-478b-a76e-77d83f33835a'}/>
        </div>)
    }
}
  
export default WeeboReport;