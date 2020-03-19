## 如何使用

- 启动项目: npm run start
- 启动项目 without eslint(因为在 commit 的时候会对改变的代码做一遍 eslint,所以如果你为了开发速度可以使用该命令): npm start:disable-eslint

## git flow

- 请确保你的版本 Node >= 8.6.0 and Git >= 2.13.2
- 开发新功能请从 test checkout, 分支名命名规则为 feature/your-feature;
- hotfix 请从 master checkout, 分支名命名规则为 hotfix/your-bug, 最好先合到 test 先让测试测一遍;
- 请确保你的分支是从 test checkout 出来的;
- 可参考 https://github.com/nvie/gitflow;
- commit 规范参考[angular](https://www.jianshu.com/p/c7e40dab5b05)的代码提交规范,

```
     feat：新功能（feature）
     fix：修补bug
     docs：文档（documentation）
     style： 格式（不影响代码运行的变动）
     refactor：重构（即不是新增功能，也不是修改bug的代码变动）
     test：增加测试
     chore：构建过程或辅助工具的变动
```

- 命令行中执行 `npm run cm` 可在提交代码的出现一个可交互的提交,
  与 angular 的规范不同之处在于 Footer 中我们并不选择关闭 issue,而是填写对应的 jira 号,
  如果该是跟 jira 任务有关联的, **请务必运行**`npm run cm`(此处没有做成 git commit 时候弹出来为了不破坏各位的习惯)在最后一步中填写对应 jira 号,
  否则之后 CHANGELOG 不会关联到对应的 jira 链接上去,之后可供生成 CHANGELOG 的时候自动带出 jira 链接
- CHANGELOG 中会生成 feat 和 fix 开头的 commit, 因此我建议如果不是对于线上版本的 bug 请不要使用 fix 开头的前缀. 当你接到一个新需求的时候,你可以在第一次做完该功能的时候
  做一次 commit,如果后续有 bug 需要修复,可以合理使用 fixup 命令
- fixup 使用方法:  
  例如有以下的 commit
  ```
    fadsf23 Feature A is done
    123dsf mess commit
    4123dfs mess commit
  ```
  后续在合到 feat 的时候会给测试做测试,因此如果后续需要修改,可以使用 git commit --fixup fadsf23, 会生成一个基于 fadsf23 的 commit,如果后续还要更改还是同理,
  会形成 commit 如下
  ```
    fdsaf213 fixup! Feature A is done
    fadsf23 Feature A is done
    123dsf mess commit
    4123dfs mess commit
  ```
  之后 feat 上测试的差不多要合到 test 之后, 可以做一次 git rebase -i --autosquash 123dsf (Feature A is done 的前一个 commit hash),
  可以将 fixup 的 commit 合成一个, 如果你比较熟悉 git rebase -i 当然由你喜欢可合并多个 commit

## 版本

- 版本采用 大版本号.需求版本号.fix 版本号, 例如这次需求上线时间为 8.28,本次版本号初始版本为 3.828.0, 后续如果 3.828.0 有 bug 需要修复,
  版本号在最后小版本基础上 + 0.0.1,例如 3.828.1, 3.828.1...
- 如果有线上的 bug 需要修复, 请在解决完成 bug 提交 commit 之后(非常重要),运行下`npm run patch`这条命令,此命令会同步更新 git tag 和 package.json 的版本号
  如果 push 失败请手动执行命令 npm run postversion, 或者手动 push commit 和 tag 到仓库上

## prettier

- 项目中使用 prettier@1.16 和 统一的.prettierrc 来进行代码的格式化, commit 代码过程中会对代码进行一次 prettier
- vscode 配置 prettier: https://marketplace.visualstudio.com/itemdetails?itemName=esbenp.prettier-vscode
- webStorm 配置 prettier: 最新版 webStorm 插件中已集成 Prettier 插件(Use the “Reformat with Prettier” action (Alt-Shift-Cmd-P on macOS or Alt-Shift-Ctrl-P on Windows and Linux) or find it using the “Find Action” popup (Cmd/Ctrl-Shift-A))

## 国际化

```
xxx.contextTypes = {
  changeChineseToLocale: (text) => text after translate, // 翻译中文
  changeChineseTemplateToLocale: (template text, template value) => text after translate, // 翻译模板语言
  changeLanguageType: (next language type) , // 改变当前语言类型
};
```

## 后端环境配置

开发过程中需要连接 dev,feat,test 等不同的环境,可以在 src/config/env 中进行配置,提交代码的时候需要三个环境都是 false,若不是则无法提交
