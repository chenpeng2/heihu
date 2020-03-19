import React from "react"
import CustomActionTable from 'component/tables/cumtomActionTable'
import LogDialog from '../tables/scheduleLogDialog'
import Header from 'component/common/Header'
import request from 'utils/urlHelpers'
import { Select, Button } from 'antd';
import { exportXlsxStyleFile } from 'utils/exportFile';
//material component
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
// import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Table } from 'antd';
import { addThousands, tableStyles } from 'utils/formatHelper'

import Paper from '@material-ui/core/Paper'
//redux
import { getloginState } from 'redux/selectors/loginSelector'
import { connect } from "react-redux"
import moment from 'moment'

class productionSchedulePage extends React.Component {
    constructor(props) {
        super(props);
        this.table = React.createRef();
        this.state = {
            defaultDataParams: {
                page: 1,
                page_size: 100,
                sort: 'program_no',
                direaction: 'desc'
            },
            isDetailLoading: true,
            detailData: {},
            openDetailDialog: false,
            tableData: {
                isFetching: true,
            },
            filterData: {},
            factoryOptions: [],
            designNoList: [],
            logListData: {
                isFetching: true,
                list: []
            },
            programColumns: [
                {
                    title: 'Program General Information',
                    children: [
                        {
                            title: '字段名称',
                            dataIndex: 'generalTitle',
                            width: '15%',
                            key: 'generalTitle',
                            align: 'center',
                        }, {
                            title: '值',
                            dataIndex: 'generalValue',
                            key: 'generalValue',
                            width: 200,
                            render: (text, record, index) => {
                                if (index === 10) {
                                    return {
                                        children: this.state.detailData[record.generalKey],
                                        props: {
                                            colSpan: 3,
                                        },
                                    };
                                } else if (record.generalKey === 'revisionDate' && this.state.detailData[record.generalKey]) {
                                    return this.state.detailData[record.generalKey].split('.')[0]
                                } else {
                                    return this.state.detailData[record.generalKey]
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
                            align: 'center',
                            key: 'detailTitle',
                            width: '15%',
                            render: (text, record, index) => {
                                const obj = {
                                    children: record.detailTitle,
                                    props: {},
                                };
                                if (index === 10) {
                                    obj.props.colSpan = 0
                                }
                                return obj;
                            }
                        }, {
                            title: '值',
                            dataIndex: 'detailValue',
                            width: 200,
                            key: 'detailValue',
                            render: (text, record, index) => {
                                const obj = {
                                    children: this.state.detailData[record.detailKey],
                                    props: {},
                                };
                                if (index === 10) {
                                    obj.props.colSpan = 0
                                }
                                if (record.detailType === 'date') {
                                    obj.children = this.state.detailData[record.detailKey]
                                }
                                if (record.detailType === 'list') {
                                    obj.children = this.state.detailData[record.detailKey] && this.state.detailData[record.detailKey].join(',')
                                }
                                return obj
                            }
                        }
                    ],
                },
            ],
            ProgramRows: [
                { key: 1, generalTitle: 'Project Manager', generalKey: 'projectManager', detailTitle: 'Design No.', detailKey: 'designNo' },
                { key: 2, generalTitle: 'Vendor Name', generalKey: 'vendorName', detailKey: 'designName', detailTitle: 'Design Name' },
                { key: 3, generalTitle: 'Factory Name', generalKey: 'factoryName', detailKey: 'projectType', detailTitle: 'Project Type' },
                { key: 4, generalTitle: 'Factory City', generalKey: 'factoryCity', detailKey: 'regionList', detailTitle: 'Region', detailType: 'list' },
                { key: 5, generalTitle: 'Program Year', generalKey: 'programYear', detailKey: 'orderQty', detailTitle: 'Order Qty', generalType: 'getText' },
                { key: 6, generalTitle: 'Program No.', generalKey: 'programNo', generalType: 'getText', detailKey: 'lobsDate', detailTitle: 'LOBS Date' },
                { key: 7, generalTitle: 'Program Name', generalKey: 'programName', generalType: 'getText', detailKey: 'projectDate', detailTitle: 'Estimated Project Period', detailType: 'date' },
                { key: 8, generalTitle: 'Daily Rate', generalKey: 'dailyRate', generalType: 'number', detailTitle: 'Molding Period', detailKey: 'moldingDate', detailType: 'date' },
                { key: 9, generalTitle: 'Date of Revision', generalKey: 'revisionDate', detailTitle: 'Spraying Period', detailKey: 'sprayingDate', detailType: 'date' },
                { key: 10, generalTitle: 'Revision', generalKey: 'revision', detailTitle: 'Assembling/Packout Period', detailKey: 'packoutDate', detailType: 'date' },
                { key: 11, generalTitle: 'Remarks', generalKey: 'remarks' }
            ],
            weeklyListColumns: [
                {
                    title: 'week',
                    dataIndex: 'weekDate',
                    render: (text, record, index) => `${moment(record.weekStart).format('YYYY-MM-DD')} ~${moment(record.weekEnd).format('YYYY-MM-DD')}`
                },
                {
                    title: 'Molding Schedule',
                    children: [{
                        title: 'Weekly', dataIndex: 'moldingWeekly',
                    }, {
                        title: 'Cum.', dataIndex: 'moldingCum',
                    }]
                },
                {
                    title: 'Spraying Schedule',
                    children: [{
                        title: 'Weekly', dataIndex: 'sprayingWeekly',
                    }, {
                        title: 'Cum.', dataIndex: 'sprayingCum',
                    }]
                },
                {
                    title: 'Packout Schedule',
                    children: [{
                        title: 'Weekly', dataIndex: 'packoutWeekly',
                    }, {
                        title: 'Cum.', dataIndex: 'packoutCum',
                    }]
                },
                {
                    title: 'Intervention Schedule',
                    children: [{
                        title: 'Date', dataIndex: 'interventionDate',
                    },
                    {
                        title: 'Quantity', dataIndex: 'interventionQty',

                    },
                    {
                        title: 'Cum.', dataIndex: 'interventionCum',

                    }]
                }
            ],
            weeklyList: [],
            programList: [],
            logListColumns: [
                {
                    title: 'Vendor Name',
                    dataIndex: 'vendorName',
                }, {
                    title: 'Factory Name',
                    dataIndex: 'factoryName',
                }, {
                    title: 'Program Year',
                    dataIndex: 'programYear',
                }, {
                    title: 'Program No.',
                    dataIndex: 'programNo',
                }, {
                    title: 'Program Name.',
                    dataIndex: 'programName',
                }, {
                    title: 'Daily Rate',
                    dataIndex: 'dailyRate',
                    render: (text, record, index) => {
                        return addThousands(record.dailyRate)
                    }
                }, {
                    title: 'Revision',
                    dataIndex: 'revision',
                }, {
                    title: 'Date of Revision',
                    dataIndex: 'revisionDate',
                    render: (text, record, index) => record.revisionDate && record.revisionDate.split('.')[0]
                }, {
                    title: 'Design No.',
                    dataIndex: 'designNo',
                }, {
                    title: 'Remarks',
                    dataIndex: 'remarks',
                }, {
                    title: 'Design Name.',
                    dataIndex: 'designName',
                }, {
                    title: 'Project Type',
                    dataIndex: 'projectType',
                }, {
                    title: 'Region',
                    dataIndex: 'regionList',
                    render: (text, record, index) => {
                        return text && text.join(',')
                    }
                }, {
                    title: 'Order Qty',
                    dataIndex: 'orderQty',
                    render: (text, record, index) => {
                        return addThousands(record.orderQty)
                    }
                }, {
                    title: 'LOBS Date',
                    dataIndex: 'lobsDate',
                }, {
                    title: 'weeklyData',
                    dataIndex: 'weeklyCount',
                    width: 370,
                    render: (text, record, index) => {
                        return (
                            <React.Fragment>
                                <tr className="extension-table-row">
                                    <td>{'日期'}</td>
                                    <td>{'molding weekly'}</td>
                                    <td>{'spraying weekly'}</td>
                                    <td>{'packout weekly'}</td>
                                </tr>
                                {record.weeklyList.map((weekData, index) => {
                                    return (
                                        <tr key={index} className="extension-table-row">
                                            <td>{`${moment(weekData.weekStart).format('第W周')}`}</td>
                                            <td>{weekData.moldingWeekly && addThousands(weekData.moldingWeekly)}</td>
                                            <td>{weekData.sprayingWeekly && addThousands(weekData.sprayingWeekly)}</td>
                                            <td>{weekData.packoutWeekly && addThousands(weekData.packoutWeekly)}</td>
                                        </tr>
                                    )
                                })}
                            </React.Fragment>
                        )
                    }
                }, {
                    title: '修改时间',
                    dataIndex: 'updatedAt',
                    key: 'updatedAt',
                    render: (text, record, index) => {
                        return record.updatedAt && record.updatedAt.split('.')[0]
                    }
                },
                {
                    title: '修改用户',
                    dataIndex: 'userName',
                    key: 'userName',
                }
            ]
        }
    }

    componentDidMount() {
        const params = this.state.defaultDataParams
        this.getTableList(params)
        this.getDesignNoList('')
        this.getProgramList()
        if (this.props.location.pathname === '/productionSchedulePreview') {
            this.getFactoryList()
            this.setState({
                isTmsPage: true
            })
        }
    }

    getColumns = () => {
        const { isTmsPage } = this.state
        const logColumn = {
            title: '填报记录',
            field: 'inputHistory',
            sorting: false,
            editable: 'never',
            cellStyle: {
                padding: '7px 10px 7px 8px',
            },
            headerStyle: {
                padding: ' 14px 10px 7px 8px',
            },
            render: value => {
                return (
                    value.id ?
                        <a
                            onClick={() => this.viewLogList(value.id)}
                            className="table-button"
                        >  查看
                </a> :
                        <a disabled={true}>查看</a>
                )
            }
        }
        const columns = [{
            title: 'Vendor Name',
            field: 'vendorName',
            ...tableStyles,
        }, {
            title: 'Factory Name',
            field: 'factoryName',
            ...tableStyles,
        }, {
            title: 'Program Year',
            field: 'programYear',
            ...tableStyles,
        }, {
            title: 'Program No.',
            field: 'programNo',
            ...tableStyles,
            defaultSort: 'desc',
        }, {
            title: 'Program Name.',
            field: 'programName',
            align: 'left',
            ...tableStyles,
        }, {
            title: 'Design No.',
            field: 'designNo',
            align: 'left',
            defaultSort: 'desc',
            ...tableStyles,
        }, {
            title: 'Design Name.',
            field: 'designName',
            ...tableStyles,
        }, {
            title: '详情',
            field: 'inputHistory',
            sorting: false,
            editable: 'never',
            ...tableStyles,
            render: value => {
                return (
                    <a
                        onClick={() => this.viewDetails(value.id)}
                        className="table-button"
                    >  查看
                </a>
                )
            }
        }]
        return isTmsPage ? columns : columns.concat(logColumn)
    }

    getProgramList = () => {
        return request({
            url: `/productionschedules/programs`,
            method: 'GET',
            success: res => {
                if (res) {
                    const list = res.data
                    const programList = []
                    list && list.forEach(item => {
                        programList.push({ value: item.programNo, title: item.program })
                    })
                    this.setState({
                        programList,
                    })
                }
                return res
            }
        })
    }

    getDesignNoList = (programNo) => {
        const programParam = programNo ? `?program_no=${programNo}` : ''
        return request({
            url: `/productionschedules/designs${programParam}`,
            method: 'GET',
            success: res => {
                if (res) {
                    const list = res.data
                    const designNoList = []
                    list && list.forEach(item => {
                        designNoList.push({ value: item.designNo, title: item.design })
                    })
                    this.setState({
                        designNoList,
                    })
                }
                return res
            }
        })
    }

    getFactoryList = () => {
        return request({
            url: `/productionschedules/factories`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const list = res.data
                    const factoryOptions = []
                    list.forEach(item => {
                        factoryOptions.push({
                            value: item.factoryId,
                            title: item.factory,
                        })
                    })
                    this.setState({
                        factoryOptions,
                    })
                } else {
                    alert(res.msg)
                }
            },
            error: err => {
                this.setState({
                    tableData: {
                        isFetching: false,
                    }
                })
            }
        })
    }

    formateDetailNumber(detailData) {
        const { weeklyList } = detailData
        const numberKeys = ['orderQty', 'dailyRate', 'interventionQty', 'interventionCum', 'moldingWeekly', 'moldingCum', 'moldingWeekly', 'moldingCum', 'packoutWeekly', 'packoutCum', 'sprayingWeekly', 'sprayingCum']
        const dateRangeKeys = ['projectDate', 'sprayingDate', 'moldingDate', 'packoutDate']
        // 数字增加千分位
        for (let detailKey in detailData) {
            if (numberKeys.includes(detailKey)) {
                detailData[detailKey] = detailData[detailKey] && addThousands(detailData[detailKey])
            }
        }
        // 时间段拼接
        dateRangeKeys.forEach(dateRange => {
            var dateName = dateRange.match(/(\S*)Date/)[1]
            detailData[dateRange] = detailData[`${dateName}Start`] && detailData[`${dateName}End`] ? `${moment(detailData[`${dateName}Start`]).format('YYYY-MM-DD')} ~ ${moment(detailData[`${dateName}End`]).format('YYYY-MM-DD')}` : '-'
        })
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

    getDetailData = (editId) => {
        request({
            url: `/productionschedules/${editId}`,
            method: 'GET',
            success: res => {
                if (res && res.data) {
                    const detailData = this.formateDetailNumber(res.data)
                    this.setState({
                        weeklyList: detailData.weeklyList,
                        isDetailLoading: false,
                        detailData,
                    })
                }
            }
        })
    }

    addData = () => {
        this.props.history.push({
            pathname: `/productionSchedule/addData`,
        })
    }

    editData = (value) => {
        this.props.history.push({
            pathname: `/productionSchedule/editData/`,
            search: `id=${value}`
        })
    }

    copyData = (value) => {
        this.props.history.push({
            pathname: `/productionSchedule/addData`,
            search: `id=${value}&isCopy=true`
        })
    }

    getTableList = (params) => {
        const { tableData } = this.state
        let strParams = ''
        tableData.isFetching = true
        this.setState({
            tableData,
        })
        for (let key in params) {
            if (params[key]) {
                strParams += `&${key}=${params[key]}`
            }
        }
        strParams = strParams.substring(1, strParams.length)
        return request({
            url: `/productionschedules?${strParams}`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    this.setState({
                        tableData: {
                            list: res.data,
                            isFetching: false,
                            pageInfo: {
                                pageCount: res.pageCount,
                                page: res.pageNo,
                                pageSize: res.pageSize,
                                total: res.totalRecord,
                            }
                        }
                    })
                } else {
                    alert('请求数据失败')
                    this.setState({
                        tableData: {
                            isFetching: false,
                        }
                    })
                }
            },
            error: err => {
                this.setState({
                    tableData: {
                        isFetching: false,
                    }
                })
            }
        })
    }

    deleteTableList = (id) => {
        return request({
            url: `/productionschedules/${id}`,
            method: 'DELETE',
            success: res => {
                return res
            }
        })
    }


    viewLogList = (key) => {
        this.setState({
            showLogList: true,
            logListData: {
                isFetching: true,
            }
        })
        return request({
            url: `/productionschedulehistories?oId=${key}`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const list = res.data
                    list.forEach(item => {
                        const weeklyCount = item.weeklyList.length
                        item.weeklyCount = weeklyCount
                    })
                    this.setState({
                        logListData: {
                            list: res.data
                        }
                    })
                }
            }
        })
    }

    viewDetails = (id) => {
        this.getDetailData(id)
        this.setState({
            openDetailDialog: true,
        })
    }

    closeLogListModal = () => {
        this.setState({
            showLogList: false,
        })
    }


    handleClose = () => {
        this.setState({
            openDetailDialog: false,
        })
    }

    onChangeDate = (date, dateString, key) => {
        const { filterData } = this.state
        filterData[key] = dateString
        this.setState({
            filterData,
        })
    }

    filterTable = () => {
        const { filterData } = this.state
        let params = this.state.defaultDataParams
        params = {
            ...params,
            ...filterData,
        }
        this.getTableList(params)
    }

    onChangeSelect = (value, key) => {
        const { filterData } = this.state
        filterData[key] = value
        if (key === 'program_no') {
            this.getDesignNoList(value)
            filterData['design_no'] = ''
        }
        this.setState({
            filterData,
        })
    }

    exportProjectXlsx = async () => {
        const weekDataMergeData = [{//合并第一行数据[B1,C1,D1,E1]
            s: {//s为开始
                c: 0,//开始列
                r: 0//开始取值范围
            },
            e: {//e结束
                c: 0,//结束列
                r: 1//结束范围
            },
        }, {
            s: {
                c: 1,
                r: 0
            },
            e: {
                c: 2,
                r: 0
            }
        }, {
            s: {
                c: 3,
                r: 0
            },
            e: {
                c: 4,
                r: 0
            }
        }, {
            s: {
                c: 5,
                r: 0
            },
            e: {
                c: 6,
                r: 0
            }
        }, {
            s: {
                c: 7,
                r: 0
            },
            e: {
                c: 8,
                r: 0
            }
        }]
        const programMergeData = [{//合并第一行数据[B1,C1,D1,E1]
            s: {//s为开始
                c: 0,//开始列
                r: 0//开始取值范围
            },
            e: {
                c: 1,
                r: 0
            },
        }, {
            s: {
                c: 2,
                r: 0
            },
            e: {
                c: 3,
                r: 0
            }
        }]
        const { weeklyListColumns, programColumns, detailData } = this.state
        const generaData = this.state.ProgramRows;
        const weekData = detailData.weeklyList;
        const generalHeaders = []
        const detailHeaders = []
        programColumns.forEach(item => {
            if (item.children) {
                generalHeaders.push(`${item.title}`)
                for (let i = 1; i < item.children.length; i++) {
                    generalHeaders.push(' ')
                }
            } else {
                generalHeaders.push(item.title)
            }
        });
        weeklyListColumns.forEach(item => {
            if (item.children) {
                detailHeaders.push(`${item.title}`)
                for (let i = 1; i < item.children.length; i++) {
                    detailHeaders.push(' ')
                }
            } else {
                detailHeaders.push(item.title)
            }
        });
        const generalBody = this.formatProgramColumns(programColumns, generaData, detailData);
        const detailBody = this.formatColumnsToXlsx(weeklyListColumns, weekData);
        detailBody.splice(0, 0, ['', 'weekly', 'Cum.', 'weekly', 'Cum.', 'weekly', 'Cum.', 'weekly', 'Cum.'])
        exportXlsxStyleFile([[generalHeaders, ...generalBody], [detailHeaders, ...detailBody]], `production_schedule_detail_${moment(new Date()).format('YYYY-MM-DD')}`, ['program_info', 'weekly_info'], 'xlsx',
            { colsWidth: 200 },
            [programMergeData, weekDataMergeData]
        );
    };

    formatProgramColumns = (columns, data, detailData) => {
        return data.map(record => {
            const col = [];
            columns.forEach(({ dataIndex, render, children }) => {
                if (render) {
                    col.push(render('', record).children);
                } else if (children) {
                    children.forEach(item => {
                        if (item.render) {
                            const renderValue = item.render('', record)
                            if (renderValue && typeof renderValue === 'object' && renderValue.hasOwnProperty('children')) {
                                col.push(item.render('', record).children)
                            } else {
                                col.push(item.render('', record))
                            }
                        } else {
                            col.push(record[item.dataIndex])
                        }
                    })
                } else {
                    col.push(record);
                }
            });
            return col;
        });
    };

    formatColumnsToXlsx = (columns, data) => {
        return data.map((record, index) => {
            const col = [];
            columns.forEach(({ dataIndex, title, render, children }) => {
                if (render) {
                    col.push(render(record[dataIndex], record));
                } else if (children) {
                    children.forEach(item => {
                        if (item.render) {
                            col.push(item.render(record[item.dataIndex]))
                        } else {
                            col.push(record[item.dataIndex])
                        }
                    })
                } else {
                    col.push(record[dataIndex]);
                }
            });
            return col;
        });
    };



    render() {
        const { showLogList, tableData, programList, isTmsPage, designNoList, logListData, openDetailDialog, isDetailLoading, factoryOptions } = this.state
        const { userInfo } = this.props
        const { userRole } = userInfo
        const { Option } = Select;
        return (
            <div>
                <Header />
                <div className="main-panel-light">
                    
                        <Paper className="report-action-content">
                            <div className="actions">
                            {
                                userRole.includes('TMS-MASTER') && isTmsPage &&
                                <div className="input-content">
                                    <label>工厂：</label>
                                    <Select
                                        className="tab-select-max"
                                        onSearch={(value) => this.onChangeSelect(value, 'factory_id')}
                                        onChange={(value) => this.onChangeSelect(value, 'factory_id')}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        value={this.state.filterData.factory_id || ''}
                                    >
                                        <Option value=''>全部</Option>
                                        {
                                            factoryOptions.map(options => {
                                                return <Option value={options.value} key={options.value}>{options.title}</Option>
                                            })
                                        }
                                    </Select>
                                </div>
                            }
                            <div className="input-content">
                                <label>Program：</label>
                                <Select
                                    className="tab-select-max"
                                    onSearch={(value) => this.onChangeSelect(value, 'program_no')}
                                    onChange={(value) => this.onChangeSelect(value, 'program_no')}
                                    value={this.state.filterData.program_no || ''}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    <Option value=''>全部</Option>
                                    {
                                        programList.map(options => {
                                            return <Option value={options.value} key={options.value}>{options.title}</Option>
                                        })
                                    }
                                </Select>
                            </div>
                            <div className="input-content">
                                <label>Design：</label>
                                <Select
                                    className="tab-select-max"
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={value => this.onChangeSelect(value, 'design_no')}
                                    onSearch={value => this.onChangeSelect(value, 'design_no')}
                                    value={this.state.filterData.design_no || ''}
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    <Option value=''>全部</Option>
                                    {
                                        designNoList.map(options => {
                                            return <Option value={options.value} key={options.value}>{options.title}</Option>
                                        })
                                    }
                                </Select>
                            </div>
                            <Button type="primary" className="green-button" onClick={this.filterTable}>查询</Button>
                        </div>
                    </Paper>
                    <Dialog
                        open={openDetailDialog}
                        onClose={this.handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        fullWidth={true}
                        maxWidth="xl"
                    >
                        <DialogTitle id="confirmation-dialog-title">
                            <div className="dialog-title">
                                <div className="title ">数据详情</div>
                            </div>
                        </DialogTitle>
                        <DialogContent dividers>
                            <div className="table-actions">
                                <Button type="primary" className="right export-button" onClick={this.exportProjectXlsx}>导出数据</Button>
                            </div>
                            <Table
                                ref={this.table}
                                tableLayout="fixed"
                                columns={this.state.programColumns}
                                dataSource={this.state.ProgramRows}
                                bordered
                                size="small"
                                pagination={false}
                                className="input-table"
                                loading={isDetailLoading}
                            />
                            <Table
                                columns={this.state.weeklyListColumns}
                                dataSource={this.state.weeklyList}
                                bordered
                                size="small"
                                pagination={false}
                                className="input-table"
                                loading={isDetailLoading}
                                rowKey={record => moment(record.weekStart).format('W')}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button type="link" onClick={this.handleClose}>
                                关闭
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Paper>
                        <CustomActionTable
                            columns={this.getColumns()}
                            data={tableData || {}}
                            title={`Production Schedule 主界面`}
                            addData={this.addData}
                            editData={this.editData}
                            copyData={this.copyData}
                            deleteData={this.deleteTableList}
                            getTableList={this.getTableList}
                            isFetching={this.state.tableData.isFetching}
                            hasOperations={userRole.includes('TMS-QC')}
                            filterData={this.state.filterData || {}}
                            tableType={'masterData'}
                        />
                    </Paper>
                    {
                        showLogList &&
                        <LogDialog
                            logList={logListData}
                            columns={this.state.logListColumns}
                            defaultVisible={this.state.showLogList}
                            closeModal={this.closeLogListModal}
                        />
                    }
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(productionSchedulePage)
