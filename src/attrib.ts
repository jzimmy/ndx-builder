import { TemplateResult, html } from "lit";
import { ProgressState } from "./HOFS";
import { BasicFormPage } from "./basicform";
import {
  HasInstanceNameAndDescription,
  HasRequired,
  MaybeHasValue,
} from "./parent";
import { customElement, query } from "lit/decorators.js";

@customElement("attrib-info-form")
export class AttribInfoFormpageElem<
  T extends HasRequired & HasInstanceNameAndDescription & MaybeHasValue
> extends BasicFormPage<T> {
  formTitle: string = "Define a new attribute";

  isValid(): boolean {
    return this.nameInput.value !== "" && this.descriptionInput.value !== "";
  }

  @query("input[name=attrib-name]")
  nameInput!: HTMLInputElement;

  @query("textarea[name=description]")
  descriptionInput!: HTMLTextAreaElement;

  @query("input[name=required]")
  isRequiredInput!: HTMLInputElement;

  @query("input[name=defaultval]")
  defaultValInput!: HTMLInputElement;

  @query("input[name=fixedval]")
  fixedValInput!: HTMLInputElement;

  body(): TemplateResult<1> {
    return html`
      <label for="attrib-name">New type name</label>
      <input name="attrib-name" @input=${this._selfValidate} placeholder="" />
      <label for="description">Description</label>
      <textarea name="description" @input=${this._selfValidate}></textarea>
      <h3>Optional</h3>
      <label for="required">This attribute is required</label>
      <input type="checkbox" name="required" />
      <label for="defaultval">Default value</label>
      <input name="defaultval" @input=${this._selfValidate} placeholder="" />
      <label for="fixedval">Allow instance name override</label>
      <input type="checkbox" name="fixedval" />
    `;
  }

  get firstInput(): HTMLElement {
    return this.nameInput;
  }

  fill(attribDec: T, progress?: ProgressState): void {
    this.drawProgressBar(progress);
    if (attribDec.name) this.nameInput.value = attribDec.name;
    if (attribDec.doc) this.descriptionInput.value = attribDec.doc;
    this.isRequiredInput.checked = attribDec.required;
    if (attribDec.value) {
      const [defaultVal, fixedVal] = attribDec.value;
      if (defaultVal) this.defaultValInput.value = defaultVal;
      this.fixedValInput.checked = fixedVal;
    }
  }

  transform(val: T): T {
    return {
      ...val,
      name: this.nameInput.value,
      doc: this.descriptionInput.value,
      required: this.isRequiredInput.checked,
      value: [this.defaultValInput.value, this.fixedValInput.checked],
    };
  }

  clear(): void {
    this.nameInput.value = "";
    this.descriptionInput.value = "";
    this.isRequiredInput.checked = false;
    this.defaultValInput.value = "";
    this.fixedValInput.checked = false;
  }
}
