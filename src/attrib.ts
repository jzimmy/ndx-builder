import { TemplateResult, html } from "lit";
import { ProgressState } from "./hofs";
import { BasicFormPage } from "./basic-form";
import { customElement, property, query } from "lit/decorators.js";
import { AttributeDec } from "./nwb/spec";
import { classMap } from "lit/directives/class-map.js";
import { CheckboxInput, ShapeOrScalarInput, ValueInput } from "./forminputs";

@customElement("attrib-info-form")
export class AttribInfoForm extends BasicFormPage<AttributeDec> {
  formTitle: string = "Include a new attribute";

  @query("value-input#name")
  nameInput!: ValueInput;

  @query("value-input#doc")
  docInput!: ValueInput;

  @query("checkbox-input#required")
  requiredInput!: CheckboxInput;

  isValid(): boolean {
    return this.nameInput.isValid() && this.docInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <value-input
        id="name"
        label="Attribute name"
        .input=${this._selfValidate}
      ></value-input>
      <value-input
        id="doc"
        label="Description"
        .input=${this._selfValidate}
      ></value-input>
      <checkbox-input
        id="required"
        label="Required"
        .input=${this._selfValidate}
      ></checkbox-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.nameInput.firstFocusable;
  }

  fill(val: AttributeDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.nameInput.fill(val.name);
    this.docInput.fill(val.doc);
    this.requiredInput.fill(val.required);
  }

  transform(val: AttributeDec): AttributeDec {
    let name = this.nameInput.value();
    let doc = this.docInput.value();
    let required = this.requiredInput.value();
    if (!name || !doc || required == undefined) {
      return val;
    }
    return { ...val, name, doc, required };
  }

  clear(): void {
    this.nameInput.clear();
    this.docInput.clear();
    this.requiredInput.clear();
  }
}

@customElement("attrib-value-form")
export class AttribValueForm extends BasicFormPage<AttributeDec> {
  @query("shape-or-scalar-input")
  shapeOrScalarInput!: ShapeOrScalarInput;

  isValid(): boolean {
    return this.shapeOrScalarInput.isValid();
  }

  body(): TemplateResult<1> {
    return html` <shape-or-scalar-input></shape-or-scalar-input> `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.shapeOrScalarInput.firstFocusable;
  }

  fill(val: AttributeDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.shapeOrScalarInput.fill(val.data);
  }

  transform(val: AttributeDec): AttributeDec {
    let shapeOrScalar = this.shapeOrScalarInput.value();
    let dtype = val.dtype;
    if (!shapeOrScalar) {
      return val;
    }
    if (shapeOrScalar[0] == "SCALAR") {
      dtype = ["PRIMITIVE", "Text"];
    }
    return { ...val, data: shapeOrScalar, dtype };
  }

  clear(): void {
    this.shapeOrScalarInput.clear();
  }

  formTitle: string = "Add a value to the attribute";
}
