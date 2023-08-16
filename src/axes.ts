import { customElement, query } from "lit/decorators.js";
import { BasicTypeBuilderFormPage } from "./basic-form";
import { Shape, Dtype } from "./nwb/spec";
import { TemplateResult, html } from "lit";
import { ProgressState } from "./hofs";
import { ShapeInput } from "./inputs/shape-input";

export interface HasAxes {
  shape: Shape[];
  dtype: Dtype;
}

@customElement("axes-form")
export class AxesForm<T extends HasAxes> extends BasicTypeBuilderFormPage<T> {
  formTitle: string = "Specify the axes of the data to be stored";
  @query("shape-input")
  shapeInput!: ShapeInput;

  isValid(): boolean {
    return this.shapeInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`<shape-input
      .onInteraction=${() => this._selfValidate()}
    ></shape-input>`;
  }

  get firstInput(): HTMLElement | undefined {
    return this.shapeInput.firstFocusableElem;
  }

  fill(val: T, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.shapeInput.fill(val.shape);
  }

  transform(val: T): T {
    return {
      ...val,
      shape: this.shapeInput.value() || val.shape,
    };
  }

  clear(): void {
    this.shapeInput.clear();
  }
}
