import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress'
import Progress from 'component/common/Progress'
import { BootstrapInput } from 'utils/chartHelper'
import NativeSelect from '@material-ui/core/NativeSelect'
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'

export default class ListCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            department: 'All',
            outTime: 4,
            isLoading: false,
            searchText: '',
        }
    }

    componentDidMount() {
        this.setState({
            selectText: this.props.subtitle,
        })
    }

    changeSelect = (event) => {
        const { getData, list } = this.props
        const value = event.target.value
        let selectList = []
        let selectText = ''
        list.forEach(item => {
            if (item.type === 'select') {
                selectList = item.selectList
            }
        })
        selectList.forEach(item => {
            if (item.value + '' === value) {
                selectText = item.title + '完成量'
            }
        })
        this.setState({
            selectText,
            selectValue: value,
        }, () => {
            getData(value)
        })
    }

    onSearchChanged = (value) => {
        this.setState({
            searchText: value,
        })
        if (!value) {
            this.setState({
                selectText: value,
            })
            this.props.clearData()
        }
    }

    searchStore = () => {
        const { getData } = this.props
        const { searchText } = this.state
        this.setState({
            selectText: searchText,
        })
        getData(searchText)
    }

    goTodetail = () => {
        const { goTodetail, detailPath } = this.props
        if (goTodetail) {
            goTodetail(detailPath)
        }
    }


    componentWillReceiveProps (nextProps) {
        if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) {
            const { list } = this.props
            let selectList = []
            list.forEach(item => {
                if (item.type === 'select') {
                    selectList = item.selectList
                }
            })
            this.setState({
                selectValue: selectList[0].value,
                selectText: this.props.subtitle,
            })
        }
    }

    render() {
        const { list, title, type, total, unit, detail, noSearchData } = this.props
        return (
            <List style={{ padding: 0 }} component="nav" aria-label="mailbox folders">
                {
                    this.state.isLoading ? <div className="loading-content-little"> <CircularProgress /> </div>
                        :
                        <div>
                            <div className="item-title" onClick={this.goTodetail}>
                                <div className="title">
                                    <div className="left">
                                        {title} {type ? `|${type}` : ''}
                                    </div>
                                    <div className="right">
                                        {/* <div className="title-little">12:00 07/29</div> */}
                                    </div>
                                </div>
                                <div className="value">
                                    <div className="left">
                                        {total && <div className="number-content">
                                            <span>
                                                <span className="number">
                                                    {total}</span>
                                                <span className="text">{unit}</span>
                                            </span>
                                        </div>}
                                        {this.state.selectText && <div className="subtitle">{this.state.selectText}</div>}
                                    </div>
                                    <div className="right">
                                        {detail &&
                                            <div className="detail-value">
                                                <div className="item-detail">
                                                    <div className="label">缓存利用率</div>
                                                    <div>{parseInt(detail * 100)}%</div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>

                            </div>
                            {
                                list && list.length ?
                                    <div className="list-content-total">
                                        {list.map((item, index) => {
                                            return (<div key={index}>
                                                <Divider />
                                                {
                                                    item.type === 'search' &&
                                                    <div className="search-item">
                                                        <TextField
                                                            className="search-content"
                                                            value={this.state.searchText}
                                                            onChange={event => this.onSearchChanged(event.target.value)}
                                                            placeholder={'输入门店号查询'}
                                                            color="inherit"
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        {this.state.searchText && <IconButton
                                                                            className={this.state.searchText ? 'active-search' : ''}
                                                                            onClick={() => this.onSearchChanged("")}
                                                                        >
                                                                            <i className="sap-icon icon-close" ></i>
                                                                        </IconButton>}
                                                                        <IconButton
                                                                            disabled={!this.state.searchText}
                                                                            className={this.state.searchText ? 'active-search' : ''}
                                                                            onClick={this.searchStore}
                                                                        >
                                                                            <i className="sap-icon icon-search" ></i>
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                }
                                                {item.type !== 'search' && 
                                                <div key={index}>
                                                    {
                                                        item.type === 'select' &&
                                                        <ListItem className="list-item">
                                                            <NativeSelect
                                                                className="chart-item-select"
                                                                onChange={this.changeSelect}
                                                                value={this.state.selectValue}
                                                                input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                                                            >
                                                                {item.selectList.map(select => {
                                                                    return <option key={select.value} value={select.value}>{select.title}</option>
                                                                })
                                                                }
                                                            </NativeSelect>
                                                        </ListItem>
                                                    }
                                                    {
                                                        item.type === 'progress' &&
                                                        <ListItem> <div className="list-item"><Progress percentageNum={item.rate} height={'13px'} color={'#0A6ED1'} /></div></ListItem>
                                                    }
                                                    {
                                                        item.type === 'text' &&
                                                        <ListItem>
                                                            <div className="list-item list-content">
                                                                <div>
                                                                    <div className="list-title">{item.title}</div>
                                                                </div>
                                                                <div className="value">{noSearchData ? '--' : item.value + (item.utd ? item.utd : unit)}</div>
                                                            </div>
                                                        </ListItem>
                                                    }
                                                </div>}
                                            </div>)
                                        })}
                                    </div>
                                    :
                                    <div className="charts-continer-little  empty-content">
                                        没有数据
                                    </div>
                            }</div>
                }
            </List>
        )
    }
}