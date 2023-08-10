import { TemplateResult, html } from "lit";
import { CPSForm, ProgressState } from "./hofs";
import { BasicFormPage } from "./basic-form";
import {
  HasInstanceNameAndDescription,
  HasRequired,
  MaybeHasValue,
} from "./parent";
import { customElement, property, query } from "lit/decorators.js";
import { AttributeDec } from "./nwb/spec";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("attrib-info-form")
export class AttribInfoForm extends BasicFormPage<AttributeDec> {
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

  @property({ type: Boolean })
  hasValueNotShape: boolean = true;

  body(): TemplateResult<1> {
    return html`
      <label for="attrib-name">New attribute name</label>
      <input name="attrib-name" @input=${this._selfValidate} placeholder="" />
      <label for="description">Description</label>
      <textarea name="description" @input=${this._selfValidate}></textarea>
      <h3>Optional</h3>
      <label for="required">This attribute is required</label>
      <input type="checkbox" name="required" />
      <label>Value stored</label>
      <div class="clickbox-wrapper">
        <div
          @click=${() => (this.hasValueNotShape = true)}
          tabindex="0"
          class=${classMap({
            clickbox: true,
            selected: this.hasValueNotShape,
          })}
        >
          Single Value
        </div>
        <div
          @click=${() => (this.hasValueNotShape = false)}
          tabindex="0"
          class=${classMap({
            clickbox: true,
            selected: !this.hasValueNotShape,
          })}
        >
          Multidimensional Values
        </div>
      </div>
    `;
  }

  get firstInput(): HTMLElement {
    return this.nameInput;
  }

  fill(attribDec: AttributeDec, progress?: ProgressState): void {
    this.drawProgressBar(progress);
    if (attribDec.name) this.nameInput.value = attribDec.name;
    if (attribDec.doc) this.descriptionInput.value = attribDec.doc;
    this.isRequiredInput.checked = attribDec.required;
    if (attribDec.data[0]) {
      this.hasValueNotShape = true;
      // const [defaultVal, fixedVal] = attribDec.value;
      // if (defaultVal) this.defaultValInput.value = defaultVal;
      // this.fixedValInput.checked = fixedVal;
    }
  }

  transform(val: AttributeDec): AttributeDec {
    return {
      ...val,
      name: this.nameInput.value,
      doc: this.descriptionInput.value,
      required: this.isRequiredInput.checked,
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

@customElement("attrib-value-form")
export class AttribValueForm extends BasicFormPage<AttributeDec> {
  formTitle: string = "Add a value to the attribute";

  isValid(): boolean {
    return true;
  }

  get firstInput(): HTMLElement {
    return this.defaultValInput;
  }

  fill(val: AttributeDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (val.data[0] == "SCALAR" && val.data[1][0] != "") {
      this.defaultValInput.value = val.data[1][0];
      this.fixedValInput.checked = val.data[1][1];
    }
  }

  transform(val: AttributeDec): AttributeDec {
    return {
      ...val,
      data: [
        "SCALAR",
        [this.defaultValInput.value, this.fixedValInput.checked],
      ],
    };
  }

  clear(): void {
    this.defaultValInput.value = "";
    this.fixedValInput.checked = false;
  }

  @query("input[name=defaultval]")
  defaultValInput!: HTMLInputElement;

  @query("input[name=fixedval]")
  fixedValInput!: HTMLInputElement;

  body() {
    return html`
      <label for="defaultval">Default value</label>
      <input
        @input=${this._selfValidate}
        name="defaultval"
        placeholder="Volts"
      />
      <label for="fixedval">Fixed value</label>
      <input @input=${this._selfValidate} type="checkbox" name="fixedval" />
    `;
  }
}
