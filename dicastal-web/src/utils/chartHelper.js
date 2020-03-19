const colorsList = {
    'red': ['#f99494', '#f66364', '#f33334', '#dc0d0e', '#b90c0d', '#930a0a'],
    'green': ['#a1dbb1', '#71c989', '#4cba6b', '#3fa45b', '#358a4d', '#2a6d3c'],
    'yellow': ['#f8cc8c', '#f5b04d', '#f29b1d', '#de890d', '#c67a0c', '#a4650a'],
    'blue': ['#b2d4f5', '#93bfeb', '#74abe2', '#5899DA', '#367dc4', '#1866b4'],
}

const BarColorList = {
    '1': [colorsList['blue'][3]],
    '2':[colorsList['blue'][3], colorsList['blue'][1]],
    '3': [colorsList['blue'][4],colorsList['blue'][3], colorsList['blue'][1]],
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

const typeToText = {
    'used': '已占用',
    'heavy': '重货',
    'light': '抛货',
    'scan': '扫描',
    'voice': '声控',
    'jd': '京东',
    'super': '社区店',
    'hyper': '大卖场',
}

const timeOutText = {
    'h4': '超时4小时',
    'h10': '超时10小时',
    'h24': '超时24小时',
    'h48': '超时48小时',
}

export {
    typeToText,
    timeOutText,
    colorsList,
    chartConfig,
    BarColorList,
}