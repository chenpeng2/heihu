import React from "react"
import RingChart from 'component/charts/Ring'

class FlowChart extends React.Component {
    render() {
        const { data } = this.props
        return (
            <div>
                <div className="image">
                    <div className="col">
                        <div className="part1">
                            <div className="circle-content">
                                <div className="circle">
                                    <RingChart data={data.receipting}/>
                                    <i className="sap-icon icon-add-product"></i>
                                </div>
                                <span>收货部</span>
                            </div>
                            <div className="scroll-to">
                                <div className="line-grey"></div>
                                <i className="sap-icon icon-process"></i>
                                <div className="line-grey-right"></div>
                            </div>
                            <div className="circle-content">
                                <div className="circle">
                                    <RingChart data={data.filling}/>
                                    <i className="sap-icon icon-customer-and-supplier"></i>
                                </div>
                                <span>分货部</span>
                            </div>
                        </div>
                        <div className="scroll-to">
                            <div className="line-grey"></div>
                            <i className="sap-icon icon-process"></i>
                            <div className="line-grey-right"></div>
                        </div>
                        <div className="circle-content">
                            <div className="circle">
                                <RingChart data={data.shipping}/>
                                <i className="sap-icon icon-offsite-work"></i>
                            </div>
                            <span>出货部</span>
                        </div>
                    </div>
                    <div className="col col-2">
                        <div className="scroll-top-left">
                            <div className="line-grey"></div>
                        </div>
                        <div className="scroll-to">
                            <div className="line-grey"></div>
                            <i className="sap-icon icon-process" style={{transform: 'rotateZ(180deg)'}}></i>
                            <div className="line-grey-right"></div>
                        </div>
                        <div className="circle-content">
                            <div className="circle">
                                {/* <RingChart /> */}
                                <i className="sap-icon icon-fridge"></i>
                            </div>
                            <span>稳定库存部</span>
                        </div>
                        <div className="scroll-to">
                            <div className="line-grey"></div>
                            <i className="sap-icon icon-process"></i>
                            <div className="line-grey" style={{ width: '43%' }}></div>
                        </div>
                        <div className="scroll-top-right">
                            <div className="line-grey"></div>
                        </div>
                    </div>
                </div>
                <div className="legend-content">
                    <div className="legend">
                        <div><span className="color red"></span>拥堵</div>
                        <div><span className="color warning"></span>可能拥堵</div>
                        <div><span className="color green"></span>通畅</div>
                        <div><i className="sap-icon green icon-process"></i>流速合适</div>
                    </div>
                </div>
            </div>

        )
    }
}

export default FlowChart