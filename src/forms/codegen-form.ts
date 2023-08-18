import { customElement, query, state } from "lit/decorators.js";
import { CPSForm } from "../logic/cps-form";
import { TemplateResult, css, html, unsafeCSS } from "lit";
import { NDXBuilderDefaultShowAndFocus } from "..";
import { FormStepBar } from "../basic-elems";
import { Initializers } from "../nwb/spec-defaults";
import codegen from "../codegen/codegen";
import { Namespace } from "../nwb/spec";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import styles from "highlight.js/styles/atom-one-dark.css?inline";
hljs.registerLanguage("python", python);

@customElement("codegen-form")
export class CodegenForm extends CPSForm<Namespace> {
  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.namespace = val;
    this.stepBarElem.setProgressState(progress);
    let scriptCode = codegen(this.namespace)
      .split('extension\n"""')[1]
      .split('"""\nDon\'t')[0];

    this.scriptElem.innerHTML = hljs.highlight(scriptCode, {
      language: "python",
    }).value;
  }

  // inaccessible
  transform(val: Namespace): Namespace {
    return val;
  }

  clear(): void {}

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @query("#script")
  scriptElem!: HTMLElement;

  @state()
  namespace: Namespace = { ...Initializers.namespace };

  @state()
  script: TemplateResult = html``;

  @query("step-bar")
  stepBarElem!: FormStepBar;

  handleExport() {
    exportFile(codegen(this.namespace), "create_extension_spec.py");
  }

  render() {
    return html`
      <back-or-quit-bar .hideQuit=${true} .back=${() => this.back()}>
        <step-bar></step-bar>
      </back-or-quit-bar>
      <div>
        <h3>Python script preview</h3>
        <dark-button @click=${this.handleExport}> Export </dark-button>
      </div>
      <pre class="theme-atom-one-dark">
        <code id="script" class="language-python"></code>
      </pre>
    `;
  }

  static styles = [
    unsafeCSS(styles),
    css`
      pre {
        padding: 2em;
        background: #282c34;
        color: #abb2bf;
        border-radius: 0.5em;
      }

      div {
        display: flex;
        align-items: center;
      }

      dark-button {
        margin-left: auto;
      }
    `,
  ];
}

// Exports contents as a new file
function exportFile(contents: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(contents)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
