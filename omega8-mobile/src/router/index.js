import menuHome from '../pages/home/index.jsx'; // 主页

import shippingBoard from '../pages/home/board/'; // 实时看板

import workAmount from '../pages/home/detail/work'; // 预计工作量
import CStatus from '../pages/home/detail/c-status'; // C区状态
import ShopStatus from '../pages/home/detail/shop-status'; // 门店满柜状态
import ShopStatusAll from '../pages/home/detail/shop-status-all'; // 所有门店
import ShopDetal from '../pages/home/detail/shop-detail';  // 门店详情
import Timeout from '../pages/home/detail/timeout'; // 超时待分拣
import Reserve from '../pages/home/detail/reserve';  // 预约未到货

import gm from '../pages/home/GM'

import stable from '../pages/home/stable'
import stableTimeout from '../pages/home/stable/timeout'
import stableRoad from '../pages/home/stable/road'
import stableStack from '../pages/home/stable/stack'

export default [
    {
        path: '/menu-home/',
        component: menuHome,    
    }, 
    {
        path: '/actual-board/',
        component: shippingBoard,    
    },
    {
        path: '/work-amount/',
        component: workAmount,    
    },
    {
        path: '/c-status/',
        component: CStatus,    
    },
    {
        path: '/shop-status/',
        component: ShopStatus,    
    },
    {
        path: '/shop-status-all/',
        component: ShopStatusAll,    
    },
    {
        path: '/shop-detail/',
        component: ShopDetal,    
    },
    {
        path: '/timeout/',
        component: Timeout,    
    },
    {
        path: '/reserve/',
        component: Reserve,    
    },
    {
        path: '/gm-page/',
        component: gm,    
    },
    {
        path: '/stable/',
        component: stable,    
    },
    {
        path: '/stable-timeout/',
        component: stableTimeout,    
    },
    {
        path: '/stable-road/',
        component: stableRoad,    
    },
    {
        path: '/stable-stack/',
        component: stableStack,    
    }
]