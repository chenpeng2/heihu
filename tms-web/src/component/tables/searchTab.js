import React from "react"
import { Input, Button } from 'antd';
import Paper from '@material-ui/core/Paper'
import { toLowerLine } from 'utils/formatHelper'

class SearchTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filterData: {}
        }
    }

    inputChange = (event) => {
        const { searchName } = this.props
        const { filterData } = this.state
        filterData[searchName] = event.target.value
        this.setState({
            filterData,
        })
    }


    filterTable = () => {
        const { getTableList, defaultDataParams } = this.props
        const { filterData } = this.state
        let params = defaultDataParams
        for (let key in filterData ) {
            params[toLowerLine(key)] = filterData[key]
        }
        getTableList(params)
    }

    render() {
        let searchName = this.props.searchName
        return <Paper className="report-action-content">
            <div className="actions">
                <div className="input-content">
                    <label style={{textTransform: 'capitalize', minWidth: searchName.length * 8}}> {`${searchName.replace(/([A-Z])/g," $1").toLowerCase()} `} </label>
                    <Input className="tab-Input" onChange={this.inputChange} />
                </div>
                <Button type="primary" className="green-button" onClick={this.filterTable}>查询</Button>
            </div>
        </Paper >
    }
}

export default SearchTab