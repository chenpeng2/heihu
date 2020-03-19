import React from "react"

class Report extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            windowHeight: window.document.body.offsetHeight,
        }
    }

    componentDidMount() {
        window.onresize = () => {
            this.setState({
                windowHeight: window.document.body.offsetHeight
            })
        }
    }

    render() { 
        const { windowHeight } = this.state 
        const { reportUrl }= this.props
        return (
            <div className="main-panel-light iframe-content">
                <iframe width="100%"title="report" height={windowHeight - 150} src={reportUrl}></iframe>
            </div>
        )
    }
}
  
export default Report;