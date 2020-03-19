## 何时使用

- 需要选择框动态搜索的时候

## 注意事项

- SearchSelect 默认不会在页面加载的时候拉数据,在 onFocus 的时候会拉取数据吗,因此如果是编辑的时候需要让后端返回对应的 label
- 当你在 SearchSelect 中加入了新的 type 的时候注意更新这里的文档

## SearchSelect 类型

| type              | label | key       | 描述                        |
| ----------------- | ----- | --------- | --------------------------- |
| wareHouse         | 仓库  | 仓库 id   | 启用中的需要加参数 status=1 |
| wareHouseWithCode | 仓库  | 仓库 code | 用法同 wareHouse            |

## api

- 需要加参数的意思为在 props 的 params 属性中加入
