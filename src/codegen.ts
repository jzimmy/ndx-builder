import { customElement, query, state } from "lit/decorators.js";
import { Namespace } from "./nwb/spec";
import { CPSForm } from "./HOFS";
import { html } from "lit";
import { NDXBuilderDefaultShowAndFocus } from "./forms";
import { FormStepBar } from "./basic-elems";

function codegen(ns: Namespace): string {
  return `
x = 1 + 1
print(x)
${JSON.stringify(ns)}`;
}

@customElement("codegen-form")
export class CodegenFormpageElem extends CPSForm<Namespace> {
  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.script = codegen(val);
    this.stepBarElem.setProgressState(progress);
  }

  transform(val: Namespace): Namespace {
    return val;
  }

  clear(): void {
    this.script = "";
  }

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @state()
  script: string = "";

  @query("step-bar")
  stepBarElem!: FormStepBar;

  render() {
    return html`
    <step-bar></step-bar>
    <input type="button" value="back" @click=${this.back}></input>
    <pre>${this.script}</pre>
    <input type="button" value="export"></input>
    `;
  }
}
