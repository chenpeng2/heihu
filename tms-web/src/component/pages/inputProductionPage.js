import React from "react"
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom'
// my component
import Header from 'component/common/Header'
import request from 'utils/urlHelpers'
import { getQueryString } from 'utils/userApi'
import Paper from '@material-ui/core/Paper'
import { Table, Card, Button, Input, DatePicker, Spin, Select } from 'antd';
import moment from 'moment'
import { getloginState } from 'redux/selectors/loginSelector'
import { removeThousands, addThousands } from 'utils/formatHelper'

const dateFormat = 'YYYY-MM-DD';
const { Option } = Select;
class inputProductionPage extends React.Component {
    constructor(props) {
        super(props)
        this.myInputRef = React.createRef();
        this.programColumns = [
            {
                title: 'Program General Information',
                children: [
                    {
                        title: '字段名称',
                        dataIndex: 'generalTitle',
                        width: '15%',
                        key: 'generalTitle',
                        className: 'mi-input-td',
                        align: 'center',
                    }, {
                        title: '值',
                        dataIndex: 'generalValue',
                        key: 'generalValue',
                        width: 200,
                        render: (text, record, index) => {
                            const obj = {
                                children: <Input name={record.generalKey} value={this.state.formData[record.generalKey] || ''} onChange={this.handleInputChange} />,
                                props: {},
                            };
                            if (index === 10) {
                                obj.props.colSpan = 3
                                return obj;
                            } else {
                                if (record.generalType === 'getText' || record.generalType === 'text') {
                                    if (record.generalKey === 'revisionDate' && this.state.formData[record.generalKey]) {
                                        return <Input value={this.state.formData[record.generalKey].split('.')[0]} disabled />
                                    }
                                    return <Input name={record.generalKey} value={this.state.formData[record.generalKey] || ''} disabled />
                                } else if (record.generalType === 'search') {
                                    return <Select
                                        showSearch
                                        optionFilterProp="children"
                                        value={this.state.formData[record.generalKey] || ''}
                                        onChange={value => this.setSearchValue(record.generalKey, value)}
                                        onSearch={value => this.setSearchValue(record.generalKey, value)}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {this.state.projectList.map((suggestion, index) => {
                                            return <Option key={index} value={suggestion}>{suggestion}</Option>
                                        })}

                                    </Select>
                                } else if (record.generalType === 'number') {
                                    return <Input name={record.generalKey} value={this.state.formData[record.generalKey] || ''} onChange={this.handleInputChange} />
                                } else {
                                    return <Input name={record.generalKey} value={this.state.formData[record.generalKey]} onChange={this.handleInputChange} />
                                }
                            }
                        }
                    }
                ],
            },
            {
                title: 'Program Detail Information',
                children: [
                    {
                        title: '字段名称',
                        dataIndex: 'detailTitle',
                        className: 'mi-input-td',
                        align: 'center',
                        key: 'detailTitle',
                        width: '15%',
                        render: (value, row, index) => {
                            const obj = {
                                children: value,
                                props: {},
                            };
                            if (index === 7 || index === 8 || index === 9) {
                                obj.props.colSpan = 2
                            } else if (index === 10) {
                                obj.props.colSpan = 0
                            }
                            return obj;
                        },
                    }, {
                        title: '值',
                        dataIndex: 'detailValue',
                        width: 200,
                        key: 'detailValue',
                        render: (text, record, index) => {
                            const obj = {
                                children: text,
                                props: {},
                            };
                            if (index === 7 || index === 8 || index === 9 || index === 10) {
                                obj.props.rowSpan = 0
                                return obj
                            } else {
                                if (record.detailType === 'search') {
                                    return <Select
                                        showSearch
                                        optionFilterProp="children"
                                        defaultValue={this.state.formData[record.detailKey] || ''}
                                        onChange={record.detailKey === 'designNo' ? value => this.searchDesignInfo(value) : value => this.setSearchValue(record.detailKey, value)}
                                        onSearch={record.detailKey === 'designNo' ? value => this.searchDesignInfo(value) : value => this.setSearchValue(record.detailKey, value)}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {record.detailSuggestions.map((suggestion, index) => {
                                            return <Option key={index} value={suggestion}>{suggestion}</Option>
                                        })}
                                    </Select>
                                } else if (record.detailType === 'search_multi') {
                                    return <Select
                                    showSearch
                                    mode="multiple"
                                    optionFilterProp="children"
                                    defaultValue={this.state.formData[record.detailKey]}
                                    onChange={value => this.setSearchValue(record.detailKey, value)}
                                    onSearch={value => this.setSearchValue(record.detailKey, value)}
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {record.detailSuggestions.map((suggestion, index) => {
                                        return <Option key={index} value={suggestion}>{suggestion}</Option>
                                    })} 
                                </Select>
                                } else if (record.detailType === 'getText' || record.detailType === 'text') {
                                    return <Input name={record.detailKey} value={this.state.formData[record.detailKey]} disabled onChange={this.handleInputChange} />
                                } else if (record.detailType === 'date') {
                                    return <DatePicker
                                        onChange={(value, dateStr) => this.onChangeDate(value, dateStr, record.detailKey)}
                                        placeholder="选择日期"
                                        format={dateFormat}
                                        value={this.state.formData[record.detailKey] ? moment(this.state.formData[record.detailKey], dateFormat) : null}
                                    />                      
                                } else if (record.detailType === 'dateRange') {
                                    return (
                                        <React.Fragment>
                                            <DatePicker
                                                onChange={this.onChangeStartDate}
                                                placeholder="开始日期"
                                                disabledDate={this.disabledStartDate}
                                                allowClear={false}
                                                onOpenChange={this.handleStartOpenChange}
                                                value={this.state.formData.projectStart ? moment(this.state.formData.projectStart, dateFormat) : null}
                                            />
                                            <span style={{ margin: '0 10px' }}>～</span>
                                            <DatePicker
                                                onChange={this.onChangeEndDate}
                                                placeholder="结束日期"
                                                disabledDate={this.disabledEndDate}
                                                open={this.state.endOpen}
                                                allowClear={false}
                                                onOpenChange={this.handleEndOpenChange}
                                                value={this.state.formData.projectEnd ? moment(this.state.formData.projectEnd) : null}
                                            />
                                        </React.Fragment>)
                                } else if (record.detailType === 'number') {
                                    return <Input name={record.detailKey} value={this.state.formData[record.detailKey] || ''} onChange={this.handleInputChange} />
                                } else {
                                    return <Input name={record.detailKey} value={this.state.formData[record.detailKey] || ''} onChange={this.handleInputChange} />
                                }
                            }
                        }
                    }
                ],
            },
        ]
        this.state = {
            formData: {
                weeklyList: []
            },
            numberKeys: ['orderQty', 'dailyRate', 'interventionQty', 'interventionCum', 'moldingWeekly', 'moldingCum', 'moldingWeekly', 'moldingCum', 'packoutWeekly', 'packoutCum', 'sprayingWeekly', 'sprayingCum'],
            totalWeekly: { weekDate: 'Total', moldingWeekly: 0, sprayingWeekly: 0, packoutWeekly: 0, interventionQty: 0 },
            isLoading: true,
            projectList: [],
            designNoList: [],
            projectTypeList: [],
            regionList: [],
            ProgramRows: [
                { generalTitle: 'Project Manager', generalKey: 'projectManager', generalType: 'search', detailTitle: 'Design No.', detailKey: 'designNo', detailType: 'search', detailSuggestions: [] },
                { generalTitle: 'Vendor Name', generalKey: 'vendorName', generalType: 'text', generalValue: '', detailKey: 'designName', detailTitle: 'Design Name', detailType: 'getText' },
                { generalTitle: 'Factory Name', generalKey: 'factoryName', generalType: 'text', generalValue: '', detailKey: 'projectType', detailTitle: 'Project Type', detailType: 'search', detailSuggestions: [] },
                { generalTitle: 'Factory City', generalKey: 'factoryCity', generalType: 'text', generalValue: '', detailKey: 'regionList', detailTitle: 'Region', detailType: 'search_multi', detailSuggestions: [] },
                { generalTitle: 'Program Year', generalKey: 'programYear', detailKey: 'orderQty', detailTitle: 'Order Qty', generalType: 'getText', detailType: 'number' },
                { generalTitle: 'Program No.', generalKey: 'programNo', generalType: 'getText', detailKey: 'lobsDate', detailTitle: 'LOBS Date', detailType: 'date' },
                { generalTitle: 'Program Name', generalKey: 'programName', generalType: 'getText', detailKey: 'EstimatedProjectPeriod', detailTitle: 'Estimated Project Period', detailType: 'dateRange' },
                { generalTitle: 'Daily Rate', generalKey: 'dailyRate', generalType: 'number', detailTitle: '-', detailValue: '-' },
                { generalTitle: 'Date of Revision', generalKey: 'revisionDate', generalType: 'text', generalValue: '', detailTitle: '-', detailValue: '-' },
                { generalTitle: 'Revision', generalKey: 'revision', detailTitle: '-', detailValue: '-' },
                { generalTitle: 'Remarks', generalKey: 'remarks', detailTitle: '-', detailValue: '-' }
            ],
            weekDataColumns: [
                { title: 'week', dataIndex: 'weekDate', className: 'mi-input-td', render: (text, record, index) => text ? text : `${moment(record.weekStart).format('YYYY-MM-DD')} ~${moment(record.weekEnd).format('YYYY-MM-DD')}` },
                {
                    title: 'Molding Schedule',
                    children: [{
                        title: 'Weekly', dataIndex: 'moldingWeekly', className: 'mi-input-td',
                        render: (text, record, index) => {
                            return <Input name={`moldingWeekly_${index}`} value={this.state.formData.weeklyList[index].moldingWeekly} onChange={this.onWeekDataChange} />
                        }
                    }
                    ]
                },
                {
                    title: 'Spraying Schedule',
                    children: [{
                        title: 'Weekly', dataIndex: 'sprayingWeekly', className: 'mi-input-td',
                        render: (text, record, index) => {
                            return <Input name={`sprayingWeekly_${index}`} value={this.state.formData.weeklyList[index].sprayingWeekly} onChange={this.onWeekDataChange} />
                        }
                    }]
                },
                {
                    title: 'Packout Schedule',
                    children: [{
                        title: 'Weekly', dataIndex: 'packoutWeekly', className: 'mi-input-td',
                        render: (text, record, index) => {
                            return <Input name={`packoutWeekly_${index}`} value={this.state.formData.weeklyList[index].packoutWeekly} onChange={this.onWeekDataChange} />
                        }
                    }]
                },
                {
                    title: 'Intervention Schedule',
                    children: [{
                        title: 'Date', dataIndex: 'interventionDate', className: 'mi-input-td',
                        render: (text, record, index) => {
                            return <DatePicker
                                name={`interventionDate_${index}`}
                                onChange={(date, dateString) => this.onChangeWeekDate(date, dateString, `interventionDate_${index}`)}
                                placeholder="选择日期"
                                value={this.state.formData.weeklyList[index].interventionDate ? moment(this.state.formData.weeklyList[index].interventionDate) : null}
                            />
                        }
                    },
                    {
                        title: 'Quantity', dataIndex: 'interventionQty',
                        render: (text, record, index) => {
                            return <Input name={`interventionQty_${index}`} value={this.state.formData.weeklyList[index].interventionQty} onChange={this.onWeekDataChange} />
                        }
                    }]
                }
            ],
        }
    }

    componentDidMount() {
        const editId = getQueryString(this.props.location.search, 'id')
        const isCopy = getQueryString(this.props.location.search, 'isCopy')
        if (editId) {
            this.getEditData(editId, isCopy)
        } else {
            this.getFactoryInfo()
        }
        Promise.all(
            [
                this.getProjectList(),
                this.getDesignNoList(),
                this.getProjectTypeList(),
                this.getRegionList(),
            ]
        ).then(res => {
            this.setState({
                isLoading: false
            })
        })
    }


    formateDetailNumber(detailData) {
        const { numberKeys } = this.state
        const { weeklyList } = detailData
        // 数字增加千分位
        for (let detailKey in detailData) {
            if (numberKeys.includes(detailKey)) {
                detailData[detailKey] = detailData[detailKey] && addThousands(detailData[detailKey])
            }
        }
        // weekly 数据中的数字增加千分位
        weeklyList.forEach(weekly => {
            for (let key in weekly) {
                if (numberKeys.includes(key)) {
                    weekly[key] = weekly[key] && addThousands(weekly[key])
                }
            }
        })
        return detailData
    }

    setDefaultTotal(weeklyList) {
        const { totalWeekly } = this.state
        for (let name in totalWeekly) {
            if (name !== 'weekDate') {
                totalWeekly[name] = 0
                weeklyList.forEach((weekData, index) => {
                    if (weekData[name] && !weekData.weekDate) {
                        totalWeekly[name] += Number(removeThousands(weekData[name]))
                    }
                })
            }

        }
        for (let key in totalWeekly) {
            totalWeekly[key] = addThousands(totalWeekly[key])
        }
        this.setState(totalWeekly)
    }

    getEditData(editId, isCopy) {
        return request({
            url: `/productionschedules/${editId}`,
            method: 'GET',
            success: res => {
                if (res && res.data) {
                    const formData = this.formateDetailNumber(res.data)
                    this.setDefaultTotal(formData.weeklyList)
                    this.setState({
                        formData,
                        editId,
                        isCopy,
                        isLoading: false,
                    })
                }
                return res
            }
        })
    }

    searchDesignInfo = (value) => {
        const getTextList = ['programYear', 'programNo', 'programName', 'designName']
        const { formData } = this.state
        return request({
            url: `/programmasterdata?design_no=${value}`,
            method: 'GET',
            success: res => {
                if (res.data) {
                    formData.designNo = value
                    const otherData = res.data[0]
                    for (let key in otherData) {
                        if (getTextList.includes(key)) {
                            formData[key] = otherData[key]
                            formData[key] = otherData[key]
                        }
                    }
                    this.setState({
                        formData,
                    })
                }
                return res
            }
        })
    }

    getProjectList = () => {
        return request({
            url: `/projectmanagers/projectmanagers`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const data = res.data
                    this.setState({
                        projectList: data,
                    })
                }
                return res
            }
        })
    }

    getDesignNoList = () => {
        const { ProgramRows } = this.state
        const { orgId } = this.props.userInfo
        let sugessionIndex = ProgramRows.findIndex((item) => item.detailKey === 'designNo')
        return request({
            url: `/programmasterdata/designnos?factory_id=${orgId}`,
            method: 'GET',
            success: res => {
                if (res) {
                    const list = res.data
                    const selectList = []
                    list && list.forEach(item => {
                        selectList.push({ 'label': item })
                    })
                    ProgramRows[sugessionIndex].detailSuggestions = list || []
                    this.setState({
                        ProgramRows,
                    })
                }
                return res
            }
        })
    }

    getProjectTypeList() {
        const { ProgramRows } = this.state
        let sugessionIndex = ProgramRows.findIndex((item) => item.detailKey === 'projectType')
        return request({
            url: `/projecttypes/projecttypes`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const data = res.data
                    const projectTypeList = []
                    data.forEach(item => {
                        projectTypeList.push({ 'label': item })
                    })
                    ProgramRows[sugessionIndex].detailSuggestions = data || []
                    this.setState({
                        ProgramRows,
                    })
                }
                return res
            }
        })
    }

    getRegionList() {
        const { ProgramRows } = this.state
        let sugessionIndex = ProgramRows.findIndex((item) => item.detailKey === 'regionList')
        return request({
            url: `/regions/regions`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const data = res.data
                    ProgramRows[sugessionIndex].detailSuggestions = data || []
                    this.setState({
                        ProgramRows,
                    })
                }
                return res
            }
        })
    }

    getFactoryInfo = () => {
        const { orgId } = this.props.userInfo
        return request({
            url: `/factories?factory_id=${orgId}`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const { formData } = this.state
                    const factoryInfo = res.data[0]
                    if (factoryInfo) {
                        formData.vendorName = factoryInfo.vendorName
                        formData.factoryCity = factoryInfo.factoryCity
                        formData.factoryName = factoryInfo.factoryEn
                    }
                    this.setState({
                        formData,
                    })
                }
                return res
            }
        })
    }

    handleInputChange = (event) => {
        const { formData, numberKeys } = this.state
        const target = event.target
        const value = target.value
        const name = target.name
        if (numberKeys.includes(name)) {
            formData[name] = addThousands(value)
        } else {
            formData[name] = value
        }

        this.setState({
            formData,
        })
    }

    onChangeWeekDate = (date, dateString, name) => {
        const { formData } = this.state
        const { weeklyList } = formData
        const key = name.split('_')[0]
        const index = name.split('_')[1]
        weeklyList[index][key] = dateString
        formData.weeklyList = weeklyList
        this.setState({
            formData,
        })
    }

    _getInputInfo(event) {
        const target = event.target
        const value = target.value
        const name = target.name.split('_')[0]
        const index = target.name.split('_')[1]
        return { value, name, index }
    }

    onWeekDataChange = (event) => {
        const { formData, totalWeekly } = this.state
        const { weeklyList } = formData
        const { value, name, index } = this._getInputInfo(event)
        weeklyList[index][name] = addThousands(value)
        totalWeekly[name] = 0
        weeklyList.forEach((weekData, index) => {
            if (weekData[name] && index !== weeklyList.length - 1) {
                totalWeekly[name] += Number(removeThousands(weekData[name]))
            }
        })
        totalWeekly[name] = addThousands(totalWeekly[name])
        this.setState({
            formData,
            weeklyList,
            totalWeekly,
        })
    }

    setSearchValue = (name, value) => {
        const { formData } = this.state
        formData[name] = value
        this.setState({
            formData,
        });
    }

    addData = (data) => {
        return request({
            url: `/productionschedules`,
            method: 'POST',
            data,
        })
    }

    updateData = (editId, data) => {
        return request({
            url: `/productionschedules/${editId}`,
            method: 'PUT',
            data,
        })
    }

    handleSubmit = (form) => {
        const { editId, formData, isCopy, numberKeys } = this.state
        const calculationValues = ['moldingStart', 'moldingEnd', 'packoutStart', 'packoutEnd', 'sprayingStart', 'sprayingEnd']
        const weekCums = ['interventionCum', 'moldingCum', 'packoutCum', 'sprayingCum']
        // 计算所得的值，在编辑保存时，不能传给后端，影响后端计算
        calculationValues.forEach(valueKey => {
            delete formData[valueKey]
        })
        for (let detailKey in formData) {
            if (numberKeys.includes(detailKey)) {
                formData[detailKey] = formData[detailKey] && removeThousands(formData[detailKey])
            }
        }
        // weekly 数据中的数字去掉千分位保存
        formData.weeklyList.forEach(weekly => {
            for (let key in weekly) {
                if (numberKeys.includes(key)) {
                    weekly[key] = weekly[key] && removeThousands(weekly[key])
                }
            }
            // 计算所得的值，在编辑保存时，不能传给后端，影响后端计算
            weekCums.forEach(cum => {
                delete weekly[cum]
            })
        })
        formData.weeklyList.pop()
        if (editId && !isCopy) {
            this.updateData(editId, formData).then(res => {
                if (res && res.code === 0) {
                    this.props.history.push({
                        pathname: `/productionSchedule`,
                    })
                } else {
                    alert((res && res.msg) || '请输入正确的数据')
                }
            })
        } else {
            this.addData(formData).then(res => {
                if (res && res.code === 0) {
                    this.props.history.push({
                        pathname: `/productionSchedule`,
                    })
                } else {
                    alert((res && res.msg) || '请输入正确的数据')
                }
            })
        }
    }

    disabledStartDate = (current) => {
        return current && current.isoWeekday() !== 1
    }
    disabledEndDate = (current) => {
        return current && (current.isoWeekday() !== 7)
    }

    onChangeDate = (date, dateStr, key) => {
        const { formData } = this.state
        formData[key] = dateStr
        this.setState({
            formData,
        })
    }

    onChangeStartDate = (date, dateString) => {
        const { formData } = this.state
        const { projectEnd } = formData
        if (projectEnd && moment(projectEnd) < date) {
            alert('开始时间不能大于结束时间')
        }
        formData.projectStart = dateString
        this.setState({
            formData,
        }, () => {
            this.getWeeks()
        })
    }

    onChangeEndDate = (date, dateString) => {
        const { formData } = this.state
        const { projectStart } = formData
        if (projectStart && moment(projectStart) > date) {
            alert('开始时间不能大于结束时间')
            this.setState({ endOpen: true });
        }
        formData.projectEnd = dateString
        this.setState({
            formData,
        }, () => {
            this.getWeeks()
        })
    }

    getWeeks = () => {
        let weeklyBefore = this.state.formData.weeklyList
        const WEEK_DAYS = 7
        const WORK_DATE_DIFF = 6 // 周一到周五的时间差为 4 
        const { formData } = this.state
        const { projectStart, projectEnd } = formData
        const weeklyList = []
        if (projectStart && projectEnd) {
            const days = moment(projectEnd).diff(moment(projectStart), 'days')
            const weekNumber = Math.ceil((days + (WEEK_DAYS - WORK_DATE_DIFF)) / WEEK_DAYS) // 开始时间为周一，结束时间为周五，但是计算周数要按照7天来计算
            for (let i = 1; i <= weekNumber; i++) {
                let weekEnd = '', weekStart = projectStart, weekData = {}
                // 第一周的时候直接根据开始时间加4就是第一周的结束时间，及当前周的周五
                if (i === 1) {
                    weekEnd = moment(projectStart).add(WORK_DATE_DIFF, 'days').format('YYYY-MM-DD')
                } else {
                    // weekStart 必须为周一， weekEnd 必须为周五
                    weekStart = moment(projectStart).add(WEEK_DAYS * (i - 1), 'days').format('YYYY-MM-DD')
                    weekEnd = moment(weekStart).add(WORK_DATE_DIFF, 'days').format('YYYY-MM-DD')
                }
                weekData = {
                    weekStart,
                    weekEnd,
                }
                // 保留原来 weekly 里面的数组，在新数组里替换为原来的值
                let index = weeklyBefore.findIndex(weekly => moment(weekly.weekStart).format('W') === moment(weekStart).format('W'))
                if (index > -1) {
                    weekData = weeklyBefore[index]
                }
                weeklyList.push(weekData)
            }
            this.setDefaultTotal(weeklyList)
            formData.weeklyList = weeklyList
            this.setState({
                weekNumber,
                formData,
            })
        }
    }

    handleStartOpenChange = open => {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }

    handleEndOpenChange = open => {
        this.setState({ endOpen: open });
    }

    render() {
        const { editId, isCopy, isLoading, formData, totalWeekly } = this.state
        const { weeklyList } = formData
        const totalIndex = weeklyList.findIndex(weekly => weekly.weekDate)
        if (totalIndex === -1 && weeklyList.length) {
            weeklyList.push(totalWeekly)
        } else if (totalIndex === weeklyList.length - 1) {
            weeklyList[weeklyList.length - 1] = totalWeekly
        } else if (totalIndex !== weeklyList.length - 1) {
            // 修改日期时间段
            weeklyList.splice(totalIndex, 1)
            weeklyList.push(totalWeekly)
        }
        return (
            <div>
                <Header />
                <div className="main-panel-light">
                    <Paper>
                        {isLoading ? <div className="loading-content"><Spin /></div>
                            : <form>
                                <Card
                                    title={editId && !isCopy ? '编辑数据' : '添加数据'}
                                    bordered={true}
                                    actions={[<Button type="primary" onClick={() => this.handleSubmit(this.form)}>提交</Button>]}
                                    style={{ width: '100%', marginBottom: '30px' }}>
                                    <Table
                                        rowKey={(record, index) => index}
                                        tableLayout="fixed"
                                        columns={this.programColumns}
                                        dataSource={this.state.ProgramRows}
                                        bordered
                                        size="small"
                                        pagination={false}
                                        className="input-table"
                                    />
                                    <Table
                                        rowKey={(record, index) => index}
                                        columns={this.state.weekDataColumns}
                                        dataSource={weeklyList}
                                        bordered
                                        size="small"
                                        pagination={false}
                                        className="input-table"
                                    />
                                </Card>
                            </form>}
                    </Paper>
                </div>
            </div>)
    }
}

const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
        userInfo,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(inputProductionPage))