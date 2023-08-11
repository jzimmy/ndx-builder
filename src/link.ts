import { customElement, query } from "lit/decorators.js";
import { BasicFormPage } from "./basic-form";
import { LinkDec } from "./nwb/spec";
import { TemplateResult, html } from "lit";
import { ProgressState } from "./hofs";
import { QuantityOrNameInput, ValueInput } from "./forminputs";

@customElement("link-info-form")
export class LinkInfoForm extends BasicFormPage<LinkDec> {
  @query("value-input#doc")
  docInput!: ValueInput;

  @query("quantity-or-name-input")
  quantityOrNameInput!: QuantityOrNameInput;

  formTitle: string = "Link Information";

  isValid(): boolean {
    return this.docInput.isValid() && this.quantityOrNameInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <value-input id="doc" label="Description"></value-input>
      <quantity-or-name-input></quantity-or-name-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.docInput.firstFocusable;
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
