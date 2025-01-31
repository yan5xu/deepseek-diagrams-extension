# deepseek-diagrams

本项目 fork 自[chatgpt-diagrams](https://github.com/dwmkerr/chatgpt-diagrams-extension)，修改为支持 DeepSeek Chat 并添加了 PlantUML 支持。

## 特性

- 支持在 DeepSeek Chat 中渲染 Mermaid.js 图表
- 新增 PlantUML 图表支持
- 点击按钮即可内联渲染图表

## 快速开始

```bash
git clone git@github.com:yan5xu/deepseek-diagrams-extension.git
npm install
npm run build
```

在 Chrome 扩展页面加载`./dist`文件夹中的未打包扩展，然后访问 https://chat.deepseek.com/

## 开发

```bash
npm start    # 开发模式
npm test     # 运行测试
npm run build # 生产构建
```

## 许可证

MIT
