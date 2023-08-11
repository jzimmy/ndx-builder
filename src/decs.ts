import { customElement, query } from "lit/decorators.js";
import { BasicFormPage } from "./basic-form";
import { AnonymousGroupTypeDec, IncGroupDec } from "./nwb/spec";
import { TemplateResult, html } from "lit";
import { ProgressState } from "./hofs";
import { ValueInput } from "./forminputs";

@customElement("anon-group-dec-info")
export class AnonGroupDecInfo extends BasicFormPage<AnonymousGroupTypeDec> {
  @query("value-input#name")
  nameInput!: ValueInput;
  @query("value-input#doc")
  docInput!: ValueInput;

  formTitle: string = "Anonymous-typed Group Declaration";
  isValid(): boolean {
    return this.nameInput.isValid() && this.docInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <value-input id="name" label="Instance name"></value-input>
      <value-input id="doc" label="Description"></value-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.nameInput.firstFocusable;
  }

  fill(val: AnonymousGroupTypeDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.nameInput.fill(val.name);
    this.docInput.fill(val.doc);
  }

  transform(val: AnonymousGroupTypeDec): AnonymousGroupTypeDec {
    const name = this.nameInput.value();
    const doc = this.docInput.value();
    if (!name || !doc) {
      return val;
    }
    return { ...val, name, doc };
  }

  clear(): void {
    this.nameInput.clear();
    this.docInput.clear();
  }
}

@customElement("inc-group-dec-info")
export class IncGroupDecInfo extends BasicFormPage<IncGroupDec> {
  formTitle: string = "Group instance declaration";
  @query("value-input#doc")
  docInput!: ValueInput;

  isValid(): boolean {
    return this.docInput.isValid();
  }

  body(): TemplateResult<1> {
    return html` <value-input id="doc" label="Description"></value-input> `;
  }
  get firstInput(): HTMLElement | undefined {
    return this.docInput.firstFocusable;
  }
  fill(val: IncGroupDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.docInput.fill(val.doc);
  }
  transform(val: IncGroupDec): IncGroupDec {
    const doc = this.docInput.value();
    if (!doc) {
      return val;
    }
    return { ...val, doc };
  }
  clear(): void {
    this.docInput.clear();
  }
}
