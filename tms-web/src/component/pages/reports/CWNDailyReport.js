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
            <DailyReport reportUrl={'https://fine.blacklake.cn/webroot/decision/view/report?viewlet=%25E9%25BB%2591%25E6%25B9%2596%25E6%258A%25A5%25E8%25A1%25A8%252FTMS%252Fdaily_production2.cpt&ref_t=design&op=view&ref_c=f105adc3-7d0e-415c-a66a-7367b03a3039&area=100231'}/>
        </div>)
    }
}
  
export default SNDailyReport;