# 国际化注意事项

1. 增加新的中文的时候需要保持 key 的唯一性。

## key 前缀

- 韩贵峰：2
- 白冰: 9
- 吴文琦: 7
- 包泽峰：0
- 陈伟：4
- 柏海辉：6
- 吴鹏：8
- 王心钰：5

## key 格式

```
key-前缀-数字
```

## 项目中国际化的几种方式以及应用场景（从上往下推荐级别递减）

- 自定义组件，通过 injectIntl 自定义组件，再使用 intl 属性，通过 react-intl 的方法或自定义方法将文本国际化
- Context，利用 Antd 的 LocaleProvider,react-intl 的 IntlProvider 和自定义的 GcLocaleProvider 通过 context 获取 intl 等需要的方法或变量，最终完成文本的国际化
- changeChineseTemplateToLocale 方法，自定义的 FormattedMessage 组件可以将模板字符串国际化，适合字符串中有一些变量，同时变量不需要翻译的场景；如果是带样式的 span，推荐使用 FormattedMessage 组件
- changeChineseToLocale 方法将字符串国际化
- changeChineseToLocaleWithoutIntl 方法，绕过 intl 的框架直接利用 localStorage 和语言文件来获取对应的翻译，但是支持嵌套模板字符串的翻译，比如模板字符串中还有待翻译的字符串变量，纯方法或者纯对象无法使用组件时可以使用这个方法，比如 Antd 的 message.error 方法
