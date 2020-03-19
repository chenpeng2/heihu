import React from "react"
import { Input, Button, DatePicker, Select } from 'antd';
import Paper from '@material-ui/core/Paper'
import request from 'utils/urlHelpers'
import { toLowerLine } from 'utils/formatHelper'
class FilterTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filterData: {}
        }
    }
    componentDidMount() {
        this.getFilterData()
    }

    getFilterData() {
        request({
            url: `/programmasterdata/designnos`,
            method: 'GET',
            success: res => {
                if (res) {
                    const list = res.data
                    this.setState({
                        designNoList: list,
                    })
                }
            }
        })
        request({
            url: `/programmasterdata/programnos`,
            method: 'GET',
            success: res => {
                if (res) {
                    const list = res.data
                    this.setState({
                        programNoList: list,
                    })
                }
            }
        })
    }

    onChangeDate = (value, key) => {
        const { filterData } = this.state
        filterData[key] = value
        this.setState({
            filterData,
        })
    }

    onChangeSelect = (value, key) => {
        const { filterData } = this.state
        filterData[key] = value
        this.setState({
            filterData,
        })
    }

    inputChange = (event, key) => {
        const { filterData } = this.state
        filterData[key] = event.target.value
        this.setState({
            filterData,
        })
    }


    filterTable = () => {
        const { getTableList, defaultDataParams } = this.props
        const { filterData } = this.state
        let params = defaultDataParams
        for (let key in filterData) {
            params[toLowerLine(key)] = filterData[key]
        }
        getTableList(params)
    }

    render() {
        const { Option } = Select
        const { programNoList, designNoList } = this.state
        const { selectList, isMaster } = this.props
        return <Paper className="report-action-content">
            <div className="filter-tab-content">
                <div className="actions">
                    {
                        selectList.includes('programYear') &&
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'program Year'.length * 8 }}> program Year  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'programYear')} />
                        </div>
                    }
                    {
                        selectList.includes('date') &&
                        <div className="input-content">
                            <label>起始日期</label>
                            <DatePicker onChange={(date, dateString) => this.onChangeDate(dateString, 'startDay')} />
                        </div>
                    }
                    {
                        selectList.includes('date') &&
                        <div className="input-content">
                            <label>截止日期</label>
                            <DatePicker onChange={(date, dateString) => this.onChangeDate(dateString, 'endDay')} />
                        </div>
                    }
                    {
                        selectList.includes('programNo') &&
                        <div className="input-content">
                            <label> {'Program No. '} </label>
                            <Select
                                className="tab-select"
                                onSearch={(value) => this.onChangeSelect(value, 'programNo')}
                                onChange={(value) => this.onChangeSelect(value, 'programNo')}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                <Option value=''>全部</Option>
                                {
                                    programNoList && programNoList.map(options => {
                                        return <Option value={options} key={options}>{options}</Option>
                                    })
                                }
                            </Select>
                        </div>
                    }
                    {
                        selectList.includes('programName') &&
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'program Name'.length * 8.2 }}> program Name  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'programName')} />
                        </div>
                    }
                    {
                        selectList.includes('factoryName') &&
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'factory Name'.length * 8 }}> factory Name  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'factoryEn')} />
                        </div>
                    }
                    {
                        selectList.includes('factoryCity') &&
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'factory City'.length * 8 }}> factory City  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'factoryCity')} />
                        </div>
                    }
                    {
                        selectList.includes('factoryCn') &&
                        <div className="input-content">
                            <label style={{ width: '90px' }}> 工厂名称  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'factoryCn')} />
                        </div>

                    }
                    {
                        selectList.includes('vendorName') &&
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'vendor Name'.length * 8 }}> vendor Name  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'vendorName')} />
                        </div>
                    }
                    {
                        selectList.includes('designNo') &&
                        <div className="input-content">
                            <label> {'Design No.'} </label>
                            <Select
                                className="tab-select design-no-select"
                                showSearch
                                style={{ width: 310 }}
                                optionFilterProp="children"
                                onChange={value => this.onChangeSelect(value, 'designNo')}
                                onSearch={value => this.onChangeSelect(value, 'designNo')}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                <Option value=''>全部</Option>
                                {
                                    designNoList && designNoList.map(options => {
                                        return <Option value={options} key={options}>{options}</Option>
                                    })
                                }
                            </Select>
                        </div>
                    }
                    {
                        selectList.includes('designName') &&
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'design Name'.length * 8 }}> design Name  </label>
                            <Input className="tab-Input" style={{ minWidth: 230 }} onChange={event => this.inputChange(event, 'designName')} />
                        </div>
                    }
                </div>
                
                <Button type="primary" className="green-button" onClick={this.filterTable}>查询</Button>
            </div>
            {
                    isMaster &&
                    <div style={{display: 'flex'}}>
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'factory Name'.length * 8 }}> factory Name  </label>
                            <Input className="tab-Input" onChange={event => this.inputChange(event, 'factoryEn')} />
                        </div>
                        <div className="input-content">
                            <label> {'Design No.'} </label>
                            <Select
                                className="tab-select design-no-select"
                                showSearch
                                style={{ width: 310 }}
                                optionFilterProp="children"
                                onChange={value => this.onChangeSelect(value, 'designNo')}
                                onSearch={value => this.onChangeSelect(value, 'designNo')}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                <Option value=''>全部</Option>
                                {
                                    designNoList && designNoList.map(options => {
                                        return <Option value={options} key={options}>{options}</Option>
                                    })
                                }
                            </Select>
                        </div>
                        <div className="input-content">
                            <label style={{ textTransform: 'capitalize', minWidth: 'design Name'.length * 8 }}> design Name  </label>
                            <Input className="tab-Input" style={{ minWidth: 230 }} onChange={event => this.inputChange(event, 'designName')} />
                        </div>
                    </div>

                }

        </Paper>
    }
}

export default FilterTab