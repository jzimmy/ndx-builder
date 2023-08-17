import { TemplateResult, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { BasicTypeBuilderFormPage } from "./abstract-form";
import { ProgressState } from "../logic/cps-form.ts";
import { CheckboxInput } from "../inputs/radio-input";
import { NameInput, DocInput } from "../inputs/value-input";
import { AttributeDec, Dtype } from "../nwb/spec";
import { ShapeOrScalarInput } from "../inputs/shape-or-scalar";

@customElement("attrib-info-form")
export class AttribInfoForm extends BasicTypeBuilderFormPage<AttributeDec> {
  formTitle: string = "Include a new attribute";

  @query("name-input#name")
  nameInput!: NameInput;

  @query("doc-input#doc")
  docInput!: DocInput;

  @query("checkbox-input#required")
  requiredInput!: CheckboxInput;

  isValid(): boolean {
    return this.nameInput.isValid() && this.docInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <name-input
        id="name"
        label="Attribute name"
        .onInteraction=${() => this._selfValidate()}
      ></name-input>
      <doc-input
        id="doc"
        label="Description"
        .onInteraction=${() => this._selfValidate()}
      ></doc-input>
      <checkbox-input
        id="required"
        label="Required"
        .onInteraction=${() => this._selfValidate()}
      ></checkbox-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.nameInput.firstFocusableElem;
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
export class AttribValueForm extends BasicTypeBuilderFormPage<AttributeDec> {
  @query("shape-or-scalar-input")
  shapeOrScalarInput!: ShapeOrScalarInput;

  isValid(): boolean {
    return this.shapeOrScalarInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <shape-or-scalar-input
        .onInteraction=${() => this._selfValidate()}
      ></shape-or-scalar-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.shapeOrScalarInput.firstFocusableElem;
  }

  fill(val: AttributeDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (val.value[0] == "SCALAR" && val.value[1][0] != "") {
      this.shapeOrScalarInput.fill(val.value);
    }
    this._selfValidate();
  }

  transform(val: AttributeDec): AttributeDec {
    let shapeOrScalar = this.shapeOrScalarInput.value();
    if (shapeOrScalar == null) {
      return val;
    }
    let dtype: Dtype =
      shapeOrScalar[0] == "SCALAR" ? ["PRIMITIVE", "Text"] : val.dtype;
    return { ...val, value: shapeOrScalar, dtype };
  }

  clear(): void {
    this.shapeOrScalarInput.clear();
  }

  formTitle: string = "Add a value to the attribute";
}
export const attribDtypeFormTitle = "Data type of values in attribute";
