import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  CoreDatasetType,
  CoreGroupType,
  DatasetType,
  DatasetTypeDef,
  Defaultable,
  Dtype,
  GroupType,
  GroupTypeDef,
  Quantity,
  Shape,
} from "./nwb/spec";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";
import { choose } from "lit/directives/choose.js";
import { styleMap } from "lit/directives/style-map.js";
import { symbols } from "./styles";

abstract class NdxInputElem<T> extends LitElement {
  isValid = () => true;
  abstract firstElement?: HTMLElement;
  abstract fill(val: T): void;
  abstract value(): T | null;
  abstract clear(): void;
}

@customElement("radio-input")
export class RadioInputWrapper extends NdxInputElem<string> {
  @query("div.first")
  firstElement: HTMLElement | undefined;

  @property()
  options: string[] = [];

  @property()
  selected: number = -1;

  fill(val: string): void {
    this.selected = this.options.indexOf(val);
  }

  @property({ type: Function })
  onSelect = (v: number) => {};

  value(): string | null {
    return this.options[this.selected] || null;
  }

  clear(): void {
    this.selected = -1;
  }

  render() {
    return html`${map(
      this.options,
      (opt, i) => html`
        <div
          class=${classMap({ selected: this.selected == i, first: i == 0 })}
          @click=${() => {
            this.selected = i;
            this.onSelect(i);
          }}
          tabindex="1"
        >
          ${opt}
        </div>
      `
    )}`;
  }

  static styles = [
    css`
      :host {
        display: flex;
        justify-content: center;
      }

      div {
        margin: 0 0.5em;
        padding: 0.5em;
        border-radius: 0.3em;
        border: 2px solid var(--color-border-alt);
        transition: 0.2s;
        cursor: pointer;
        font-size: 1.2em;
        user-select: none;
      }

      div:hover,
      div:focus {
        border-color: var(--clickable-hover);
        color: var(--clickable-hover);
        padding: 0.5em 0.7em;
      }

      .selected {
        color: var(--clickable);
        border-color: var(--clickable);
        text-decoration: underline;
        padding: 0.5em 0.7em;
        background: var(--background-light-button);
      }
    `,
  ];
}

@customElement("quantity-or-name-input")
export class QuantityOrNameInput extends NdxInputElem<Quantity | string> {
  firstElement?: HTMLElement | undefined;

  fill(val: string | Quantity): void {
    if (typeof val == typeof "") {
      this.quantityNotName = false;
      this.name = val as string;
    } else {
      this.quantityNotName = true;
      this.quantity = val as Quantity;
    }
  }

  value(): string | Quantity | null {
    return this.quantityNotName ? this.quantity : this.name;
  }

  clear(): void {
    this.quantityNotName = true;
    this.quantity = ["*", null];
  }

  @state()
  quantityNotName: boolean = true;

  @state()
  quantity: Quantity = ["*", null];

  private setQuantity(i: number) {
    switch (this.quantityOptions[i]) {
      case this.quantityOptions[0]: // exact
        this.quantity = ["Num", -1];
        break;
      case this.quantityOptions[1]: // unlimited
        this.quantity = ["*", null];
        break;
      case this.quantityOptions[2]: // zero or one
        this.quantity = ["?", null];
        break;
      case this.quantityOptions[3]: // one or more
        this.quantity = ["+", null];
        break;
    }
  }

  quantityOptions = ["Exact", "Unlimited", "Zero or one", "One or more"];
  name = "";

  render() {
    return html`
      <radio-input
        .options=${["Quantity", "Name"]}
        .selected=${this.quantityNotName ? 0 : 1}
        .onSelect=${(i: number) => (this.quantityNotName = i == 0)}
      ></radio-input>
      ${this.quantityNotName
        ? html` <radio-input
              style="font-size: 0.8em;"
              .options=${this.quantityOptions}
              .selected=${choose(this.quantity[0], [
                ["Num", () => 0],
                ["*", () => 1],
                ["?", () => 2],
                ["+", () => 3],
              ])}
              .onSelect=${(i: number) => this.setQuantity(i)}
            ></radio-input>
            ${when(
              this.quantity[0] == "Num",
              () =>
                html`<value-input
                  label="Number of instances"
                  .value=${this.quantity[1]}
                ></value-input>`
            )}`
        : html`<value-input label="Name" .value=${this.name}></value-input>`}
    `;
  }
}

@customElement("value-input")
export class ValueInput extends NdxInputElem<string> {
  @property()
  label: string = "Value";

  @query("input[type=text]")
  inputElem!: HTMLInputElement;

  @property({ type: Function })
  isValid = super.isValid;

  firstElement = this.inputElem;

  fill(val: string): void {
    if (val) this.inputElem.value = val;
  }

  value(): string | null {
    return this.isValid() ? this.inputElem.value : null;
  }

  clear(): void {
    this.inputElem.value = "";
  }

  render() {
    return html`
      <div>${this.label}</div>
      <input type="text" />
    `;
  }
}

@customElement("shape-input")
export class ShapeInput extends NdxInputElem<Shape[]> {
  isValid: () => boolean = () => {
    for (const shape of this.shapes) {
      for (const axis of shape) {
        if (axis[0] != "None" || Number.isNaN(parseInt(axis[0]))) {
          return false;
        }
      }
    }
    return true;
  };

  @query("shape-wrapper > input:first-child")
  firstElement!: HTMLElement;

  fill(val: Shape[]): void {
    if (val.length != 0) this.shapes = val;
  }

  value(): Shape[] | null {
    return this.isValid() ? this.shapes : null;
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }

  defaultShape: Shape = [
    [2, ""],
    ["None", ""],
  ];

  @state()
  shapes: Shape[] = [this.defaultShape];

  render() {
    return html`<div>Stored data axes</div>
      <div class="note">Use 'any' to indicate unlimited axis length</div>
      ${map(
        this.shapes,
        (shape, i) =>
          html`
            <div class="shape-wrapper">
              <div class="toprow">Axis Length</div>
              <div class="toprow">
                Axis Label
                <div class="addremove">
                  <light-button .disabled=${shape.length <= 1}>
                    <span
                      class="material-symbols-outlined"
                      @click=${() =>
                        (this.shapes = [
                          ...this.shapes.slice(0, i),
                          shape.slice(0, -1),
                          ...this.shapes.slice(i + 1),
                        ])}
                      >remove</span
                    >
                  </light-button>
                  <light-button>
                    <span
                      class="material-symbols-outlined"
                      @click=${() =>
                        (this.shapes = [
                          ...this.shapes.slice(0, i),
                          [...shape, [2, ""]],
                          ...this.shapes.slice(i + 1),
                        ])}
                      >add</span
                    >
                  </light-button>
                </div>
              </div>
              ${map(
                shape,
                ([dim, label]) =>
                  html`
                    <input type="text" class="dim"
                    .value=${dim == "None" ? "any" : dim} / ><input
                      type="text"
                      .value=${label}
                    />
                  `
              )}
            </div>
            ${when(
              i + 1 < this.shapes.length,
              () => html`<div class="or-bar">
                <div>OR</div>
                <light-button
                  @click=${() => {
                    this.shapes = [
                      ...this.shapes.slice(0, i + 1),
                      ...this.shapes.slice(i + 2),
                    ];
                  }}
                >
                  <span class="material-symbols-outlined">close</span>
                </light-button>
              </div>`
            )}
          `
      )}
      <light-button
        @click=${() => (this.shapes = [...this.shapes, this.defaultShape])}
        >Add another shape option</light-button
      > `;
  }

  static styles = [
    symbols,
    css`
      :host {
      }

      .shape-wrapper {
        display: grid;
        grid-template-columns: 1fr 2fr;
      }

      .toprow {
        margin-bottom: 0.5em;
        display: flex;
        align-items: center;
      }

      .dim {
        width: 6em;
      }

      .addremove {
        margin-left: auto;
        display: flex;
      }

      .or-bar {
        margin: 0.5em 0;
        display: flex;
        align-items: center;
        font-weight: bold;
      }

      .or-bar > div {
        margin-right: 0.5em;
      }

      .addremove light-button,
      .or-bar light-button {
        font-size: 0.1em;
        margin: 0 2em;
      }
      .addremove span.material-symbols-outlined,
      .or-bar span.material-symbols-outlined {
        font-size: 20px;
      }
    `,
  ];
}

@customElement("inctype-input")
export class IncTypeInput extends NdxInputElem<GroupType | DatasetType> {
  firstElement?: HTMLElement | undefined;
  fill(
    val:
      | ["Core", CoreGroupType]
      | ["Typedef", GroupTypeDef]
      | ["None", null]
      | ["Core", CoreDatasetType]
      | ["Typedef", DatasetTypeDef]
  ): void {
    throw new Error("Method not implemented.");
  }
  value():
    | ["Core", CoreGroupType]
    | ["Typedef", GroupTypeDef]
    | ["None", null]
    | ["Core", CoreDatasetType]
    | ["Typedef", DatasetTypeDef]
    | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("shape-or-scalar-input")
export class ShapeOrScalarInput extends NdxInputElem<
  ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]
> {
  firstElement?: HTMLElement | undefined;
  @query("radio-input")
  radioInput!: RadioInputWrapper;

  @query("shape-input")
  shapeInput!: ShapeInput;

  @query("value-input")
  scalarInput!: ValueInput;

  @query("checkbox-input")
  defaultInput!: CheckboxInput;

  // firstElement?: HTMLElement = this.radioInput.firstElement;

  isValid: () => boolean = () => {
    return (
      this.shapeInput.isValid() &&
      this.defaultInput.isValid() &&
      this.scalarInput.isValid()
    );
  };

  fill(val: ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]): void {
    if (val[0] == "SCALAR") {
      this.shapeNotScalar = false;
      this.scalarInput.fill(val[1][0]);
      this.defaultInput.fill(val[1][1]);
    } else {
      this.shapeNotScalar = true;
      this.shapeInput.fill(val[1]);
    }
  }

  value(): ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>] | null {
    if (!this.isValid()) return null;
    return this.shapeNotScalar
      ? ["SHAPE", this.shapeInput.value()!]
      : ["SCALAR", [this.scalarInput.value()!, this.defaultInput.value()!]];
  }

  clear(): void {
    this.shapeNotScalar = true;
  }

  @state()
  shapeNotScalar = true;

  render() {
    return html`
      <radio-input
        .options=${["Shape", "Scalar"]}
        .selected=${this.shapeNotScalar ? 0 : 1}
        .onSelect=${(i: number) => (this.shapeNotScalar = i == 0)}
      ></radio-input>
      <!-- Shape -->
      <shape-input
        style=${styleMap(this.shapeNotScalar ? {} : { display: "None" })}
      ></shape-input>
      <!-- Scalar -->
      <value-input
        style=${styleMap(this.shapeNotScalar ? { display: "None" } : {})}
        label="Attribute value"
      ></value-input>
      <checkbox-input
        style=${styleMap(this.shapeNotScalar ? { display: "None" } : {})}
        label="Allow override"
      ></checkbox-input>
    `;
  }
}

@customElement("checkbox-input")
export class CheckboxInput extends NdxInputElem<boolean> {
  firstElement?: HTMLElement | undefined;
  fill(val: boolean): void {
    throw new Error("Method not implemented.");
  }
  value(): boolean | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("dtype-input")
export class DtypeInput extends NdxInputElem<Dtype> {
  firstElement?: HTMLElement | undefined;
  fill(val: Dtype): void {
    throw new Error("Method not implemented.");
  }
  value(): Dtype | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("input-tests-wrapper")
export class TestWrapper extends LitElement {
  render() {
    return html`
      <shape-or-scalar-input></shape-or-scalar-input>
      <quantity-or-name-input></quantity-or-name-input>
      <value-input label="Typename"></value-input>
    `;
  }
}
