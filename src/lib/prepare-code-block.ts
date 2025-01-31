import { ChatGPTCodeDOM } from "./chatgpt-dom";
import { renderDiagram } from "./render-diagram";

export type PreparedCodeBlock = {
  //  The 'show diagram' button.
  showDiagramButton: HTMLDivElement;
  showCodeButton: HTMLDivElement;
  diagramTabContainer: HTMLDivElement;
};

export function prepareCodeBlock(
  document: Document,
  codeBlock: ChatGPTCodeDOM
): PreparedCodeBlock {
  //  Create the diagram tab container.
  const diagramTabContainer = document.createElement("div");
  diagramTabContainer.id = `chatgpt-diagram-container-${codeBlock.index}`;
  diagramTabContainer.classList.add("p-4", "overflow-y-auto");
  diagramTabContainer.style.backgroundColor = "#FAFAFA";
  diagramTabContainer.style.display = "none";

  // 创建内部居中容器
  const centerContainer = document.createElement("div");
  centerContainer.style.display = "flex";
  centerContainer.style.justifyContent = "center";
  diagramTabContainer.appendChild(centerContainer);

  codeBlock.codeContainerElement.after(diagramTabContainer);

  // //  Create the diagram 'after code' container.
  // const diagramContainer = document.createElement("div");
  // diagramContainer.id = `chatgpt-diagram-container-${codeBlock.index}`;
  // switch (displayMode) {
  //   case DisplayMode.BelowDiagram:
  //     //  Put the digram after the 'pre' element.
  //     codeBlock.preElement.after(diagramContainer);
  //     break;
  //   case DisplayMode.AsTabs:
  //     //  Set the style of the container to match the code block, then
  //     //  put into the code div.
  //     diagramContainer.classList.add("p-4", "overflow-y-auto");
  //     codeBlock.codeContainerElement.after(diagramContainer);
  //     //  Style the code block tab.
  //     codeBlock.codeContainerElement.style.display = "none";
  //     //  Style the diagram tab.
  //     diagramContainer.style.backgroundColor = "#FFFFFF";
  //     break;
  //   default:
  //     throw new Error(`Unknown diagram display mode '${displayMode}'`);

  //  Create the 'show diagram' button.
  const showDiagramButton = document.createElement("div");
  showDiagramButton.innerText = "Show diagram";
  showDiagramButton.style.backgroundColor = "rgba(var(--ds-rgba-transparent))";
  showDiagramButton.style.color = "inherit";
  showDiagramButton.style.cursor = "pointer";
  showDiagramButton.style.border = "none";
  showDiagramButton.style.margin = "0";
  showDiagramButton.style.padding = "0";
  showDiagramButton.onclick = () => {
    renderDiagram(
      diagramTabContainer,
      `${codeBlock.index}`,
      codeBlock.code,
      codeBlock.diagramType
    );
    codeBlock.codeContainerElement.style.display = "none";
    diagramTabContainer.style.display = "block";
    showDiagramButton.style.display = "none";
    showCodeButton.style.display = "inline-block";
  };

  //  Create the 'show code' button.
  const showCodeButton = document.createElement("div");
  showCodeButton.innerText = "Show code";
  showCodeButton.style.backgroundColor = "rgba(var(--ds-rgba-transparent))";
  showCodeButton.style.color = "inherit";
  showCodeButton.style.cursor = "pointer";
  showCodeButton.style.border = "none";
  showCodeButton.style.margin = "0";
  showCodeButton.style.padding = "0";
  showCodeButton.style.display = "none";
  showCodeButton.onclick = () => {
    codeBlock.codeContainerElement.style.display = "block";
    diagramTabContainer.style.display = "none";
    showDiagramButton.style.display = "inline-block";
    showCodeButton.style.display = "none";
  };

  const actionContainer = document.createElement("div");
  actionContainer.style.marginRight = "8px";
  actionContainer.classList.add("flex", "items-center", "gap-2");
  actionContainer.appendChild(showDiagramButton);
  actionContainer.appendChild(showCodeButton);
  codeBlock.actionElement.before(actionContainer);

  //  Add the 'chatgpt-diagrams' class to the code block - this means we will
  //  exclude it from later searches.
  codeBlock.preElement.classList.add("chatgpt-diagrams-processed");

  return {
    showDiagramButton,
    showCodeButton,
    diagramTabContainer,
  };
}
