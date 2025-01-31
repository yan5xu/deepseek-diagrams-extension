import mermaid from "mermaid";

export async function renderDiagram(
  container: HTMLElement,
  id: string,
  code: string
) {
  try {
    //  Render the diagram using the Mermaid.js library, then insert into our
    //  container.
    //  Hack Part 1: Rather than giving mermaid our container element as the
    //  third parameter, we have to let it put error content in the document
    // body, then remove it ourselves. This is because I cannot get it to
    //  sucessfully use the JSDOM mocked document in this case - even through
    //  when _successfully_ rendering diagrams it works.
    // 初始化 mermaid 配置，使用暗黑主题
    mermaid.initialize({
      theme: "default",
    });

    const { svg } = await mermaid.render(`chatgpt-diagram-${id}`, code);
    container.innerHTML = svg;
  } catch (err) {
    //  In the future we will return an error, but for now we will let the
    //  mermaid error UI content sit in the container, as this is fairly clear
    //  for the user. Later we can add more of our own branding and content.
    console.warn("an error occurred rendering the diagram", err);

    //  Hack Part 2: grab the error content added to the global document, move it
    //  into our container. Note the extra 'd' in the id below.
    const errorContent = global.document.body.querySelector(
      `#dchatgpt-diagram-${id}`
    );
    container.insertAdjacentHTML("beforeend", errorContent?.outerHTML || "");
    errorContent?.remove();
  }
}
