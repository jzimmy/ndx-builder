import { TemplateResult, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { BasicTypeBuilderFormPage } from "./basic-form";
import { ProgressState } from "./hofs";
import { DtypeInput } from "./inputs/dtype-input";
import { Dtype } from "./nwb/spec";

interface HasDtype {
  dtype: Dtype;
}

@customElement("dtype-form")
export class DtypeForm<T extends HasDtype> extends BasicTypeBuilderFormPage<T> {
  formTitle: string = "Select the type of the stored data";

  isValid(): boolean {
    return this.dtypeInput.isValid();
  }

  @query("dtype-input")
  dtypeInput!: DtypeInput;

  body(): TemplateResult<1> {
    return html`
      <dtype-input .onInteraction=${() => this._selfValidate()}></dtype-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.dtypeInput.firstFocusableElem;
  }

  fill(val: T, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.dtypeInput.fill(val.dtype);
  }

  transform(val: T): T {
    return {
      ...val,
      dtype: this.dtypeInput.value() || val.dtype,
    };
  }

  clear(): void {
    this.dtypeInput.clear();
  }
}
