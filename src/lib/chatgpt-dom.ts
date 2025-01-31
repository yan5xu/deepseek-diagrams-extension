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

      return {
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
    })
    .filter((block): block is ChatGPTCodeDOM => block !== null);
}
