import { customElement, query, state } from "lit/decorators.js";
import { CPSForm } from "../logic/cps-form";
import { html } from "lit";
import { NDXBuilderDefaultShowAndFocus } from "..";
import { FormStepBar } from "../basic-elems";
import { Initializers } from "../nwb/spec-defaults";
import codegen from "../codegen/codegen";
import { Namespace } from "../nwb/spec";

@customElement("codegen-form")
export class CodegenForm extends CPSForm<Namespace> {
  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.namespace = val;
    this.stepBarElem.setProgressState(progress);
  }

  transform(val: Namespace): Namespace {
    return val;
  }

  clear(): void {}

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @state()
  namespace: Namespace = { ...Initializers.namespace };

  @query("step-bar")
  stepBarElem!: FormStepBar;

  handleExport() {
    exportFile(codegen(this.namespace), "create_extension_spec.py");
  }

  render() {
    return html`
    <step-bar></step-bar>
    <input type="button" value="back" @click=${this.back}></input>
    <pre>${JSON.stringify(this.namespace, null, 2)}</pre>
    <continue-bar .message=${"Export"} .continue=${this.handleExport}
      ></continue-bar>
    `;
  }
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
