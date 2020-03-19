import * as React from 'react';
import Modal from '@material-ui/core/Modal'
import Swiper from 'swiper/dist/js/swiper.js'
import 'swiper/dist/css/swiper.min.css'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import '../../styles/card.less'
import NativeSelect from '@material-ui/core/NativeSelect'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Progress from './Progress'
import {  BootstrapInput } from 'utils/chartHelper'

const keyToText = {
    loadFactor: '当前柜已装载重量',
    allContent: '当前柜已装载体积',
    residualContent: 'C区剩余数量',
    receiptCache: '收货整板',
    sub: '分货缓存区',
    subCache: '分货已组板',
    inventory: '稳定库存',
    unit: '箱',
    plt: '板'
}

const keyToIcon = {
    receiptCache: 'icon-add-product',
    sub: 'icon-customer-and-supplier',
    subCache: 'icon-customer-and-supplier',
    inventory: 'icon-offsite-work',
}
export default class SwiperModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShow: false,
            totla: 30,
        }
    }

    formateData(data) {
        const dataItem = {
            plt: {},
            unit: {},
            currentUnit: 'plt'
        }
        if (data) {
            dataItem.storeId = data.store
            dataItem.doorId = data.door
            dataItem.loadStart = data.loadStart
            dataItem.plt = {
                ownDepartment: {
                    loadFactor: data.wgt,
                    allContent: data.cube,
                    residualContent: data.plt.valid || 0
                },
                otherDepartment: {
                    receiptCache: data.plt.rCount,
                    sub: data.plt.sCount,
                    subCache: data.plt.scCount,
                    inventory: data.plt.ssCount,
                }
            }
            dataItem.unit = {
                ownDepartment: {
                    loadFactor: data.wgt,
                    allContent: data.cube,
                    residualContent: data.unit.valid || 0
                },
                otherDepartment: {
                    receiptCache: data.unit.rCount,
                    sub: data.unit.sCount,
                    subCache: data.unit.scCount,
                    inventory: data.unit.ssCount,
                }
            }
        }
        return dataItem
    }

    componentDidMount() {
        const { data } = this.props
        let listData = data ? data.map((item, index) => {
            return this.formateData(item)
        }) : []
        listData = listData.slice(0, 19)
        this.setState({
            isShow: this.props.isShow,
            listData,
        }, () => {
            setTimeout(() => {
                new Swiper('.swiper-container', {
                    slidesPerView: 'auto',
                    loop: false,  //循环
                    autoplay: false,
                    pagination: {  //分页器
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    // slidesPerView: 4,
                    spaceBetween: 48,
                    observer: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
            }, 100)
        })
    }

    clickBg = () => {
        this.props.closeModal()
    }

    changeFullunit = (event, index) => {
        const { listData } = this.state
        listData[index].currentUnit = event.target.value
        this.setState({
            listData,
        })
    }

    render() {
        const { listData } = this.state
        const { from } = this.props
        return (
            <Modal
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.state.isShow}
                onClose={this.handleModalClose}
                onBackdropClick={this.clickBg}
            >
                <div className="modal-content">
                    <div className="swiper-container">
                        <div className="title" >
                            <a className="link-btn" onClick={() => this.props.getTodetail('doorCabinet', {tag: '即将满柜', from,})}>全部即将满柜门店</a>
                            <a className="close-btn" onClick={this.clickBg}>X</a>
                        </div>
                        <div className="swiper-wrapper">
                            {
                                listData && listData.map((detailInfo, index) => {
                                    return (
                                        <div key={index} className="swiper-slide swiper-card-content" data-id={index}>
                                            <Card >
                                                <div className="card-title">
                                                    <div className="list-avatar">
                                                        <i className="sap-icon icon-shipping-status"></i>
                                                    </div>
                                                    <div className="list-content">
                                                        <div className="list-title">门店{detailInfo.storeId}({detailInfo.doorId})</div>
                                                        <div className="list-subtitle">装柜开始时间 {detailInfo.loadStart}</div>
                                                    </div>
                                                </div>

                                                <CardContent>
                                                    <NativeSelect
                                                        className="chart-select"
                                                        onChange={(e) => this.changeFullunit(e, index)}
                                                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                                                    >
                                                        <option value={'plt'}>板数</option>
                                                        <option value={'unit'}>箱数</option>
                                                    </NativeSelect>
                                                    <List className="list-states">
                                                        <span className="list-title">门店目前状态</span>
                                                        {
                                                            Object.keys(detailInfo[detailInfo.currentUnit].ownDepartment).map((key, index) => {
                                                                return (
                                                                    <ListItem key={index} className="item-own">
                                                                        <div className="state-list-subtitle">{keyToText[key]}</div>
                                                                        {(key === 'loadFactor' || key === 'allContent') ?
                                                                            <div className="prograss">{<div className="progress-content">
                                                                                <Progress percentageNum={detailInfo[detailInfo.currentUnit].ownDepartment[key]} /></div>}</div>
                                                                            : <div className={detailInfo[detailInfo.currentUnit].ownDepartment[key] > 10 ? 'balck' : 'red-text'}>{detailInfo[detailInfo.currentUnit].ownDepartment[key]}{keyToText[detailInfo.currentUnit]}</div>
                                                                        }
                                                                    </ListItem>
                                                                )
                                                            })
                                                        }
                                                    </List>
                                                    <List className="list-states">
                                                        <span className="list-title">其他部门相关货物状态</span>
                                                        {
                                                            Object.keys(detailInfo[detailInfo.currentUnit].otherDepartment).map((key, index) => {
                                                                return (
                                                                    <ListItem key={index} className="item-other">
                                                                        <i className={'sap-icon ' + keyToIcon[key]}></i>
                                                                        <div className="list-left">
                                                                            <div className="state-list-title">{keyToText[key]}</div>
                                                                            <div className="state-list-subtitle">可用货物</div>
                                                                        </div>
                                                                        <div className={detailInfo[detailInfo.currentUnit].otherDepartment[key] > 10 ? 'green-text' : 'red-text'}>{detailInfo[detailInfo.currentUnit].otherDepartment[key]}{keyToText[detailInfo.currentUnit]}</div>
                                                                    </ListItem>
                                                                )
                                                            })
                                                        }
                                                    </List>
                                                </CardContent>
                                            </Card>
                                        </div>

                                    )
                                })
                            }
                            <div key="last" className="swiper-slide swiper-card-content" data-id="last">
                                <Card className="empty-swiper-card">
                                    <CardContent>
                                        <i className="sap-icon icon-diplay-more"></i>
                                        <a  onClick={() => this.props.getTodetail('doorCabinet', {tag: '即将满柜', from,})}>在详细页查看全部{this.props.data && this.props.data.length}个即将满柜门店</a>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                        <div className='swiper-pagination'></div>

                    </div>
                    <div className='swiper-button-warp'>
                        <div className="swiper-button-next"></div>
                        <div className="swiper-button-prev"></div>
                    </div>
                </div>


            </Modal>
        )
    }
};