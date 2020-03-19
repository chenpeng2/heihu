const colorsList = {
    'red': ['#f99494','#f66364','#f33334','#dc0d0e','#b90c0d','#930a0a'],
    'green': ['#a1dbb1','#71c989','#4cba6b','#3fa45b','#358a4d','#2a6d3c'],
    'yellow':['#f8cc8c','#f5b04d','#f29b1d','#de890d','#c67a0c','#a4650a'],
    'blue': ['#b2d4f5','#93bfeb','#74abe2','#5899DA','#367dc4','#1866b4'],
}
export default {
    blueColorList : {
        '1': [colorsList['blue'][3]],
        '2':[colorsList['blue'][5], colorsList['blue'][1]],
        '3': [colorsList['blue'][5],colorsList['blue'][3], colorsList['blue'][0]],
    },
    redColorList: {
        '1': [colorsList['red'][3]],
        '2':[colorsList['red'][5], colorsList['red'][1]],
        '3': [colorsList['red'][5],colorsList['red'][3], colorsList['red'][0]],
    },
    yellowColorList: {
        '1': [colorsList['yellow'][3]],
        '2':[colorsList['yellow'][5], colorsList['yellow'][1]],
        '3': [colorsList['yellow'][5],colorsList['yellow'][3], colorsList['yellow'][0]],
    },
    greenColorList: {
        '1': [colorsList['green'][3]],
        '2':[colorsList['green'][5], colorsList['green'][1]],
        '3': [colorsList['green'][5],colorsList['green'][3], colorsList['green'][0]],
    },
    tooltip : {
        trigger: 'axis',
        triggerOn: 'click',
        axisPointer : {            
            type : 'shadow'
        },
        showContent: true
    },
    legend: {
        left: 'left',
        x: 'left',
        heigth: '5px',
        textStyle: {
            fontSize: '10',
        },
        itemWidth: 12,
        itemHeight: 7,
        bottom: 20,
        selectedMode: false
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
    barLabel : {
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