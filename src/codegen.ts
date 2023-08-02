import { customElement, state } from "lit/decorators.js";
import { Namespace } from "./nwb/spec";
import { CPSForm } from "./HOFS";
import { html } from "lit";
import { NdxFormParent } from "./form-elem";

function codegen(ns: Namespace): string {
  return `
x = 1 + 1
print(x)`;
}

@customElement("codegen-form")
export class CodegenFormpageElem extends CPSForm<Namespace> {
  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.script = codegen(val);
  }

  transform(val: Namespace): Namespace {
    return val;
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }

  showAndFocus(visible: boolean): void {
    NdxFormParent.showAndFocus(this, visible);
  }

  @state()
  script: string = "";

  render() {
    return html`
    <input type="button" .value="back" @click=${this.back}></input>
    <pre>${this.script}</pre>
    <input type="button" .value="export"></input>
    `;
  }
}
