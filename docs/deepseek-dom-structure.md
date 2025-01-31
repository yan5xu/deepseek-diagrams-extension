# DeepSeek Chat DOM 结构分析

## 代码块结构

```html
<div class="md-code-block">
  <div class="md-code-block-banner-wrap">
    <div class="md-code-block-banner">
      <div class="md-code-block-infostring">mermaid</div>
      <div class="md-code-block-action">
        <div class="ds-markdown-code-copy-button">复制</div>
      </div>
    </div>
  </div>
  <pre>代码内容</pre>
</div>
```

## 关键元素

1. 代码块容器

   - 类名: `md-code-block`
   - 作用: 包含整个代码块的主容器

2. 语言标识

   - 类名: `md-code-block-infostring`
   - 作用: 显示代码语言（如 "mermaid"）
   - 位置: 在 banner 区域内

3. 复制按钮

   - 类名: `ds-markdown-code-copy-button`
   - 作用: 提供代码复制功能
   - 位置: 在 banner 的 action 区域内

4. 代码内容
   - 元素: `pre`
   - 位置: 在主容器的最底部

## 与 ChatGPT 的区别

1. 类名结构
   - 使用 `md-` 前缀的类名
   - 复制按钮使用 `ds-` 前缀
2. 布局结构
   - 有专门的 banner 区域
   - 语言标识和操作按钮都位于 banner 内
3. 复制按钮实现
   - 使用独立的 action 容器
   - 按钮文本为中文"复制"

## 适配建议

1. 选择器更新
   - 使用 `.md-code-block` 作为主要选择器
   - 通过 `.md-code-block-infostring` 识别 mermaid 代码块
2. 按钮插入

   - 在 `.md-code-block-action` 内插入渲染按钮
   - 保持与现有复制按钮相同的样式

3. 代码获取
   - 从 `pre` 元素中获取代码内容
   - 注意处理可能的语法高亮标记
