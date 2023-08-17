import { NumberInput } from "./value-input";
import { NameInput } from "./value-input";

import { html } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { when } from "lit/directives/when.js";
import { Quantity } from "../nwb/spec";
import { NdxInputElem } from "./abstract-input";
import "./radio-input";
import "./value-input";

@customElement("quantity-or-name-input")
export class QuantityOrNameInput extends NdxInputElem<Quantity | string> {
  firstFocusableElem?: HTMLElement;

  fill(val: string | Quantity): void {
    if (typeof val == typeof "") {
      this.quantityNotName = false;
      this.nameInput?.fill(val as string);
    } else {
      this.quantityNotName = true;
      let qval = val as Quantity;
      this.quantity = qval[0];
      if (qval[0] == "Num") {
        this.numInput?.fill(qval[1]);
      }
    }
  }

  value(): string | Quantity | null {
    if (this.quantityNotName) {
      if (this.quantity == "Num") {
        return ["Num", this.numInput!.value() || -1];
      } else {
        return [this.quantity, null];
      }
    } else {
      return this.nameInput!.value();
    }
  }

  isValid = () => {
    if (this.quantityNotName) {
      if (this.quantity != "Num") return true;
      let num = this.numInput?.value();
      return num != null && num > 0;
    } else {
      return this.nameInput?.isValid() || false;
    }
  };

  clear(): void {
    this.quantityNotName = true;
    this.quantity = "*";
    this.nameInput?.clear();
    this.numInput?.clear();
  }

  @state()
  quantityNotName: boolean = true;

  @state()
  quantity: "Num" | "*" | "?" | "+" = "Num";

  @query("number-input")
  numInput: NumberInput | undefined;

  @query("name-input")
  nameInput: NameInput | undefined;

  quantityOptions = ["Exact", "Unlimited", "Zero or one", "One or more"];

  setQuantity(i: number) {
    switch (i) {
      case 0:
        this.quantity = "Num";
        break;
      case 1:
        this.quantity = "*";
        break;
      case 2:
        this.quantity = "?";
        break;
      case 3:
        this.quantity = "+";
        break;
    }
  }

  render() {
    return html`
      <radio-input
        .options=${["Quantity", "Name"]}
        .selected=${this.quantityNotName ? 0 : 1}
        .onSelect=${(i: number) => (this.quantityNotName = i == 0)}
        .onInteraction=${() => this.onInteraction()}
      ></radio-input>
      ${this.quantityNotName
        ? html` <radio-input
              style="font-size: 0.8em;"
              .options=${this.quantityOptions}
              .selected=${choose(this.quantity, [
                ["Num", () => 0],
                ["*", () => 1],
                ["?", () => 2],
                ["+", () => 3],
              ])}
              .onSelect=${(i: number) => this.setQuantity(i)}
              .onInteraction=${() =>
                Promise.resolve(this.updateComplete).then(() =>
                  this.onInteraction()
                )}
            ></radio-input>
            ${when(
              this.quantity == "Num",
              () => html`<number-input
                label="Number of instances"
                .onInteraction=${() => this.onInteraction()}
              ></number-input>`
            )}`
        : html`<name-input
            label="Name"
            id="name"
            .onInteraction=${() => {
              this.setQuantity(0);
              this.onInteraction();
            }}
          ></name-input>`}
    `;
  }
}
