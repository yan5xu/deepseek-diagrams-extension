import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { JSDOM } from "jsdom";
import { elementByTestId } from "./test-utils";
import { renderDiagram } from "./render-diagram";

describe("render-diagram", () => {
  describe("renderDiagram", () => {
    beforeEach(() => {
      //  It seems that jsdom doesn't handle the SVGElement 'getBBox' function.
      //  Return a box of any old size and the tests will function.
      //  @ts-expect-error - TS knows SVGElement doesn't have getBBox
      window.SVGElement.prototype.getBBox = () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });

    afterEach(() => {
      //  @ts-expect-error - TS knows SVGElement doesn't have getBBox
      delete window.SVGElement.prototype.getBBox;

      //  Clean out any content we've created so far.
      document.body.innerHTML = "";
    });

    test("can render simple graph in 'BelowDiagram' mode", async () => {
      document.body.innerHTML = `
        <div>
            <p>Here's a simple diagram:</p>
            <pre>
                <div>
                    <div>
                        <span>mermaid</span>
                        <button>Show Diagram</button>
                        <button>Copy code</button>
                    </div>
                    <div>
                        <code>graph LR
                            A[Browser] --&gt; B{Send HTTP Request}
                        </code>
                    </div>
                </div>
            </pre>
            <!-- This is an example of a 'below' container div to hold the diagram. -->
            <div data-test-id="container"></div>
            <p>This flowchart illustrates a basic web request.</p>
        </div>
      `;

      const id = "1";
      const container = elementByTestId(document, "container");
      const code = document.querySelector("code")?.textContent || "";

      await renderDiagram(container, id, code, "mermaid");

      const svg = container.querySelector("svg") as SVGElement;
      expect(svg.id).toContain(`chatgpt-diagram-${id}`);

      //  We don't need to go overboard, but check that the SVG at least
      //  contains two node labels as expected (otherwise an empty SVG would
      //  pass the test, fixes GH issue #22).
      const [label1, label2] = svg.querySelectorAll(".nodeLabel");
      expect(label1.textContent).toEqual("Browser");
      expect(label2.textContent).toEqual("Send HTTP Request");
    });

    test("does not pollute the global docucment body when rendering fails", async () => {
      const chatHTML = `
        <div id="test-sample-3">
            <p>Here's an invalid diagram:</p>
            <pre>
                <div>
                    <div>
                        <span>mermaid</span>
                        <button>Show Diagram</button>
                        <button>Copy code</button>
                    </div>
                    <div>
                        <code>
                          type Vector2D = {
                            x: number;
                            y: number;
                          };
                        </code>
                    </div>
                </div>
            </pre>
            <!-- This is an example of a 'below' container div to hold the diagram. -->
            <div data-test-id="container"></div>
            <p>This flowchart illustrates a basic web request.</p>
        </div>
      `;

      //  Ensure the global document has not had error content added by mermaid,
      //  which is its default behaviour.
      expect(global.document.body.innerHTML).toEqual("");
      const dom = new JSDOM(chatHTML);
      const id = "1";
      const container = elementByTestId(dom.window.document, "container");
      const code = dom.window.document.querySelector("code")?.textContent || "";

      await renderDiagram(container, id, code, "mermaid");

      expect(global.document.body.innerHTML).toEqual("");
    });

    test("shows mermaidjs error content in the diagram container when rendering fails", async () => {
      const chatHTML = `
        <div id="test-sample-4">
            <p>Here's an invalid diagram:</p>
            <pre>
                <div>
                    <div>
                        <span>mermaid</span>
                        <button>Show Diagram</button>
                        <button>Copy code</button>
                    </div>
                    <div>
                        <code>
                          type Vector2D = {
                            x: number;
                            y: number;
                          };
                        </code>
                    </div>
                </div>
            </pre>
            <!-- This is an example of a 'below' container div to hold the diagram. -->
            <div data-test-id="container"></div>
            <p>This flowchart illustrates a basic web request.</p>
        </div>
      `;

      //  Setup the dom, get the code block, render the diagram.
      const dom = new JSDOM(chatHTML);
      const id = "1";
      const container = elementByTestId(dom.window.document, "container");
      const code = dom.window.document.querySelector("code")?.textContent || "";

      await renderDiagram(container, id, code, "mermaid");

      //  Check for the mermaid.js error output in the container.
      expect(container.querySelector(".error-text")?.textContent).toMatch(
        /Syntax error in text/
      );
    });
  });
});
