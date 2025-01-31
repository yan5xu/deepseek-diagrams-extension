// 存储所有的观察器，以便在需要时断开连接
const observers: MutationObserver[] = [];

export type ChatGPTCodeDOM = {
  //  If 'true' indicates that we have already created the diagram.
  isProcessed: boolean;

  //  The index of the block, i.e. the zero based order of the block in the
  //  document. This is used to create unique IDs.
  index: number;

  //  The actual code in the sample.
  code: string;

  //  The overall container div that holds the code block.
  codeBlockElement: HTMLDivElement;

  //  The banner action div where we'll insert our button.
  actionElement: HTMLDivElement;

  //  The pre element that contains the actual code.
  preElement: HTMLPreElement;

  //  The copy code button element.
  copyCodeButton: HTMLDivElement;

  //  The container element that holds the code content.
  codeContainerElement: HTMLPreElement;

  //  The type of diagram (mermaid or plantuml)
  diagramType: "mermaid" | "plantuml";
};

/**
 * queryFindExactlyOneElement.
 *
 * @param {} document - the DOM document
 * @param {} xpathQuery - the XPath query to run
 * @param {} contextNode - the context node to start the query from, or null
 */
export function queryFindExactlyOneElement(
  document: Document,
  xpathQuery: string,
  contextNode: Element
) {
  //  Run the xpath query, retrieving a snapshop.
  const snapshot = document.evaluate(
    xpathQuery,
    contextNode,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  //  If we did not find the expected number of results, bail.
  if (snapshot.snapshotLength !== 1) {
    const errorMessage = `failed to find exactly one element when running query '${xpathQuery}' - ${snapshot.snapshotLength} element(s) were found`;
    throw new Error(errorMessage);
  }

  //  Return the element we found.
  return snapshot.snapshotItem(0);
}

/**
 * 监听代码块内容变化
 * @param preElement pre 元素
 * @param callback 回调函数
 */
function observeCodeContent(
  preElement: HTMLPreElement,
  callback: (mutations: MutationRecord[]) => void
) {
  const observer = new MutationObserver(callback);
  observer.observe(preElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  return observer;
}

/**
 * 断开所有观察器的连接
 */
export function disconnectAllObservers() {
  observers.forEach((observer) => observer.disconnect());
  observers.length = 0;
}

export function findCodeBlocks(document: Document): Array<ChatGPTCodeDOM> {
  // 查找所有代码块容器
  const codeBlocks = Array.from(document.querySelectorAll(".md-code-block"));

  return codeBlocks
    .map((block, index) => {
      const codeBlockElement = block as HTMLDivElement;
      const actionElement = block.querySelector(
        ".md-code-block-action"
      ) as HTMLDivElement;
      const preElement = block.querySelector("pre") as HTMLPreElement;
      const infoElement = block.querySelector(
        ".md-code-block-infostring"
      ) as HTMLDivElement;
      const copyCodeButton = block.querySelector(
        ".ds-markdown-code-copy-button"
      ) as HTMLDivElement;
      const codeContainerElement = preElement;

      // 获取代码块类型信息
      const infoText = infoElement?.textContent?.toLowerCase() || "";

      // 判断图表类型
      let diagramType: "mermaid" | "plantuml" | null = null;
      if (infoText.includes("mermaid")) {
        diagramType = "mermaid";
      } else if (infoText.includes("plantuml")) {
        diagramType = "plantuml";
      }

      // 如果不是支持的图表类型，返回 null
      if (!diagramType) {
        return null;
      }

      // 获取代码内容
      const code = preElement?.textContent?.trim() || "";

      // 创建代码块对象
      const codeBlock: ChatGPTCodeDOM = {
        isProcessed: preElement.classList.contains(
          "chatgpt-diagrams-processed"
        ),
        index,
        code,
        codeBlockElement,
        actionElement,
        preElement,
        copyCodeButton,
        codeContainerElement,
        diagramType,
      };

      // 如果是图表类型，设置内容变化监听
      if (diagramType) {
        observeCodeContent(preElement, (mutations) => {
          // 检查内容是否真的发生变化
          const newCode = preElement.textContent?.trim() || "";
          if (newCode !== code) {
            // 移除处理标记，允许重新处理
            preElement.classList.remove("chatgpt-diagrams-processed");
            codeBlock.isProcessed = false;
            codeBlock.code = newCode;

            // 移除之前添加的按钮容器
            const actionContainer = codeBlock.codeBlockElement.querySelector(
              ".chatgpt-diagrams-action-container"
            );
            actionContainer?.remove();
          }
        });
      }

      return codeBlock;
    })
    .filter((block): block is ChatGPTCodeDOM => block !== null);
}
