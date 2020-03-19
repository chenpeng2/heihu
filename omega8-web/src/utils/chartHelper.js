import { withStyles } from '@material-ui/core/styles'
import InputBase from '@material-ui/core/InputBase'

const colorsList = {
    'red': ['#f99494', '#f66364', '#f33334', '#dc0d0e', '#b90c0d', '#930a0a'],
    // 'green': ['#a1dbb1', '#71c989', '#4cba6b', '#3fa45b', '#358a4d', '#2a6d3c'],
    'green': ['#a1dbb1', '#71c989', '#4cba6b', '#00AF98', '#358a4d', '#2a6d3c'],
    // 'yellow': ['#f8cc8c', '#f5b04d', '#f29b1d', '#de890d', '#c67a0c', '#a4650a'],
    'yellow': ['#f8cc8c', '#f5b04d', '#f29b1d', '#FCC51E', '#c67a0c', '#a4650a'],
    'blue': ['#b2d4f5', '#93bfeb', '#74abe2', '#5899DA', '#367dc4', '#1866b4'],
}

const BarColorList = {
    '1': [colorsList['blue'][3]],
    '2':[colorsList['blue'][5], colorsList['blue'][1]],
    '3': [colorsList['blue'][5],colorsList['blue'][3], colorsList['blue'][0]],
}

const BarRedColorList = {
    1: [colorsList['red'][3]],
    2:[colorsList['red'][5], colorsList['red'][1]],
    3: [colorsList['red'][5],colorsList['red'][3],colorsList['red'][0]],
}

const BarYelllowColorList = {
    1: [colorsList['yellow'][3]],
    2:[colorsList['yellow'][5], colorsList['yellow'][1]],
    3: [colorsList['yellow'][5], colorsList['yellow'][3],colorsList['yellow'][0]],
}

const BarGreenColorList = {
    1: [colorsList['green'][3]],
    2:[colorsList['green'][5], colorsList['green'][1]],
    3: [colorsList['green'][5], colorsList['green'][3],colorsList['green'][0]],
} 

const chartConfig = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        backgroundColor: '#ffffff',
        borderColor: '#d5d5d5d5',
        padding: [5, 10],
        borderWidth: 1,
        textStyle: {
            color: '#32363A',
            fontSize: 12,
        }
    },
    legend: {
        selectedMode: false,
        left: 10,
        heigth: '5px',
        textStyle: {
            fontSize: '12',
        },
        itemWidth: 12,
        itemHeight: 7,
        bottom: 10,
    },
    grid: {
        left: '3%',
        right: '5%',
        top: '3%',
        containLabel: true
    },
    xAxis: {
        axisTick: {
            show: false,
        },
        axisLabel: {
            color: '#4A4A4A',
            interval: 0
        }
    },
    yAxis: {
        axisTick: {
            show: false,
        },
        axisLine: {
            lineStyle: {
                color: '#9B9B9B'
            }
        },
        splitLine: {
            lineStyle: {
                color: '#E5E5E5'
            }
        },
        axisLabel: {
            color: '#4A4A4A',
            interval: 0
        }
    },
    barLabel: {
        normal: {
            show: true,
            position: 'top',
            distance: 10,
            color: '#666',
            rotate: '45'
        }
    },
    title: {
        textStyle: {
            color: '#32363A',
            fontSize: 14,
            fontWeight: 400
        }
    }
}

const BootstrapInput = withStyles(theme => ({
    root: {
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 2,
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: '1px solid #ced4da',
      fontSize: 14,
      padding: '4px 16px 6px 4px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
        borderRadius: 2,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }))(InputBase);

const typeToText = {
    'used': '已占用',
    'heavy': '重货',
    'light': '抛货',
    'scan': '扫描类型',
    'voice': '声控类型',
    'jd': '京东',
    'super': '社区店',
    'hyper': '大卖场',
    'count': '已完成',
    'appointmentCount': '预约数量',
    'poCount': 'po数量',
    'received': '收货',
    'unit': '箱数',
}

const timeOutText = {
    'h4': '超时4小时',
    'h10': '超时10小时',
    'h24': '超时24小时',
    'h48': '超时48小时',
}

const departmentToText = {
    '0': '收货部',
    '1': '分货部',
    '2': '稳定库存',
}

const valueToText = {
    'untrail': '未摆柜',
    'totrail': '等待摆柜',
    'trailed': '已摆柜',
    'loading': '装柜中',
    'rest': '未完成量',
    'picking': '正在拣货量',
    'total': '需拣货总量',
}

//部门的下拉选择框由这个维护
const textToDepartValue = {
    '所有部门': '',
    '收货部': '0',
    '分货部': '1',
    '稳定库存': '2',
}

const unitText = {
    '板数': 'plt',
    '箱数': 'unit'
}

const REFRESH_TIME = 1000 * 60 * 10

export {
    typeToText,
    timeOutText,
    colorsList,
    chartConfig,
    BarColorList,
    BarRedColorList,
    BarYelllowColorList,
    BarGreenColorList,
    departmentToText,
    textToDepartValue,
    valueToText,
    unitText,
    BootstrapInput,
    REFRESH_TIME
}