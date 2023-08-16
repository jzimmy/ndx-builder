import { customElement, query } from "lit/decorators.js";
import { BasicTypeBuilderFormPage } from "./abstract-form";
import { LinkDec } from "../nwb/spec";
import { TemplateResult, html } from "lit";
import { ProgressState } from "../logic/cpsform.ts";
import { DocInput } from "../inputs/value-input";
import { QuantityOrNameInput } from "../inputs/quantity-or-name";

@customElement("link-info-form")
export class LinkInfoForm extends BasicTypeBuilderFormPage<LinkDec> {
  @query("doc-input")
  docInput!: DocInput;

  @query("quantity-or-name-input")
  quantityOrNameInput!: QuantityOrNameInput;

  formTitle: string = "Link Information";

  isValid(): boolean {
    return this.docInput.isValid() && this.quantityOrNameInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <doc-input
        id="doc"
        label="Description"
        .onInteraction=${() => this._selfValidate()}
      ></doc-input>
      <quantity-or-name-input
        .onInteraction=${() => this._selfValidate()}
      ></quantity-or-name-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.docInput.firstFocusableElem;
  }

  fill(val: LinkDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.docInput.fill(val.doc);
    this.quantityOrNameInput.fill(val.quantityOrName);
  }

  transform(val: LinkDec): LinkDec {
    let doc = this.docInput.value();
    let quantityOrName = this.quantityOrNameInput.value();
    if (!doc || !quantityOrName) {
      return val;
    }
    return { ...val, doc, quantityOrName };
  }

  clear(): void {
    this.docInput.clear();
    this.quantityOrNameInput.clear();
  }
}
