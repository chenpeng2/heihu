import React from "react"
import DailyReport from 'component/common/DailyReport'
import Header from 'component/common/Header'

class SNDailyReport extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() { 
        return (
        <div>
            <Header />
            <DailyReport reportUrl={'https://fine.blacklake.cn/webroot/decision/view/report?viewlet=%25E9%25BB%2591%25E6%25B9%2596%25E6%258A%25A5%25E8%25A1%25A8%252FTMS%252Fdaily_production2.cpt&ref_t=design&op=view&ref_c=a5808b31-5b7c-41a2-9cbb-52ed254ea64c&area=100002'}/>
        </div>)
    }
}
  
export default SNDailyReport;