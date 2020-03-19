import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress'
class NoData extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {const {isWheelScrapTrend,isWheelScrapPie,isWheelScrapPareto} =this.props;
        const isH = isWheelScrapTrend || isWheelScrapPie ||isWheelScrapPareto;
        return (
            <div className={isH?"no-data no-data-loading":"no-data-loading"} style={{height:this.props.height?this.props.height:'300px'}}>
                <div style={{lineHeight:this.props.height?this.props.height:'300px'}}>{isH?'暂无数据':<div className="loading-content no-data"> <CircularProgress /> </div>}</div>
            </div>
        );
    }

}
export default NoData