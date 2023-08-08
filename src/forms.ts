import { TemplateResult, html } from "lit";
import { BasicFormPage } from "./basic-form";
import { ProgressState } from "./hofs";
import { HasQuantityOrName } from "./parent";
import { customElement, property, query } from "lit/decorators.js";
import { quantityOrNameString } from "./typeviz";
import { classMap } from "lit/directives/class-map.js";

@customElement("quantity-or-name-form")
export class QuantityOrNameForm extends BasicFormPage<HasQuantityOrName> {
  formTitle: string = "Quantity or Name";
  @property()
  hasQuantityNotName: boolean = true;
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }

  @query("input[type=text]")
  quantityInput!: HTMLInputElement;

  body(): TemplateResult<1> {
    return html`
      <div class="clickbox-wrapper">
        <div
          @click=${() => (this.hasQuantityNotName = true)}
          tabindex="0"
          class=${classMap({
            clickbox: true,
            selected: this.hasQuantityNotName,
          })}
        >
          Single Value
        </div>
        <div
          @click=${() => (this.hasQuantityNotName = false)}
          tabindex="0"
          class=${classMap({
            clickbox: true,
            selected: !this.hasQuantityNotName,
          })}
        >
          Multidimensional Values
        </div>
      </div>
      <label for="value"
        >${this.hasQuantityNotName ? "Quantity" : "Name"}</label
      >
      <input type="text" name="value" />
    `;
  }

  get firstInput(): HTMLElement {
    return this.quantityInput;
  }

  fill(val: HasQuantityOrName, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.hasQuantityNotName = typeof val.quantityOrName !== typeof "";

    let resultStr = quantityOrNameString(val.quantityOrName);
    if (this.hasQuantityNotName) {
      this.quantityInput.value = resultStr;
    }
  }

  transform(val: HasQuantityOrName): HasQuantityOrName {
    const qOrS;
    const input = this.quantityInput.value;
    if (this.hasQuantityNotName) {
      switch (input) {
        case "+":
          qOrS = "PLUS";
      }
    }

    return { ...val };
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }
}
