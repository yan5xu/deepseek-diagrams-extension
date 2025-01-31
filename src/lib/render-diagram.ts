import mermaid from "mermaid";
import plantumlEncoder from "plantuml-encoder";

export async function renderDiagram(
  container: HTMLElement,
  id: string,
  code: string,
  diagramType: "mermaid" | "plantuml"
) {
  try {
    if (diagramType === "mermaid") {
      //  Render the diagram using the Mermaid.js library, then insert into our
      //  container.
      //  Hack Part 1: Rather than giving mermaid our container element as the
      //  third parameter, we have to let it put error content in the document
      // body, then remove it ourselves. This is because I cannot get it to
      //  sucessfully use the JSDOM mocked document in this case - even through
      //  when _successfully_ rendering diagrams it works.
      mermaid.initialize({
        theme: "default",
      });

      const { svg } = await mermaid.render(`chatgpt-diagram-${id}`, code);

      // 创建居中容器
      const centerDiv = document.createElement("div");
      centerDiv.style.display = "flex";
      centerDiv.style.justifyContent = "center";
      centerDiv.style.width = "100%";
      centerDiv.innerHTML = svg;

      container.innerHTML = "";
      container.appendChild(centerDiv);
    } else if (diagramType === "plantuml") {
      // 使用 plantuml-encoder 编码图表内容
      const encoded = plantumlEncoder.encode(code);
      const url = `http://www.plantuml.com/plantuml/svg/${encoded}`;

      // 创建居中容器
      const centerDiv = document.createElement("div");
      centerDiv.style.display = "flex";
      centerDiv.style.justifyContent = "center";
      centerDiv.style.width = "100%";

      // 创建 img 元素显示图表
      const img = document.createElement("img");
      img.src = url;
      img.alt = `PlantUML diagram ${id}`;
      img.style.maxWidth = "100%"; // 确保图片不会溢出容器

      // 添加图片到居中容器
      centerDiv.appendChild(img);

      // 清空容器并添加居中容器
      container.innerHTML = "";
      container.appendChild(centerDiv);
    }
  } catch (err) {
    console.warn(`Error rendering ${diagramType} diagram:`, err);

    if (diagramType === "mermaid") {
      //  Hack Part 2: grab the error content added to the global document, move it
      //  into our container. Note the extra 'd' in the id below.
      const errorContent = global.document.body.querySelector(
        `#dchatgpt-diagram-${id}`
      );
      container.insertAdjacentHTML("beforeend", errorContent?.outerHTML || "");
      errorContent?.remove();
    } else {
      // plantuml 错误处理
      container.innerHTML = `<div class="error" style="color: red; padding: 10px;">Failed to render PlantUML diagram: ${
        err instanceof Error ? err.message : String(err)
      }</div>`;
    }
  }
}
