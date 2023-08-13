import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  CompoundDtype,
  Defaultable,
  Dtype,
  PrimitiveDtype,
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
  abstract firstFocusable?: HTMLElement;
  abstract fill(val: T): void;
  abstract value(): T | null;
  abstract clear(): void;

  @property({ type: Boolean })
  required: boolean = true;

  @property({ type: Function })
  input: () => void = () => {};
}

@customElement("radio-input")
export class RadioInput extends NdxInputElem<string> {
  @query("div.first")
  firstFocusable: HTMLElement | undefined;

  @property()
  options: string[] = [];

  @property()
  selected: number = -1;

  fill(val: string): void {
    this.selected = this.options.indexOf(val);
  }

  @property({ type: Function })
  onSelect = (_i: number) => {};

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
            this.input();
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
        padding: 0.5em;
        border-bottom: 2px solid var(--color-border-alt);
        transition: 0.2s;
        cursor: pointer;
        font-size: 1.2em;
        user-select: none;
        color: var(--color-border-alt);
      }

      div:hover,
      div:focus {
        padding: 0.5em 1em;
      }

      div:not(.selected):hover,
      div:not(.selected):focus {
        border-color: var(--color-border);
        color: var(--color-border);
      }

      div.selected {
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
  firstFocusable?: HTMLElement;

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
        .input=${() => this.input()}
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
              .input=${() =>
                Promise.resolve(this.updateComplete).then(() => this.input())}
            ></radio-input>
            ${when(
              this.quantity == "Num",
              () =>
                html`<number-input
                  label="Number of instances"
                  .input=${() => this.input()}
                ></number-input>`
            )}`
        : html`<name-input
            label="Name"
            id="name"
            .input=${() => {
              this.setQuantity(0);
              this.input();
            }}
          ></name-input>`}
    `;
  }
}

abstract class ValueInput<T> extends NdxInputElem<T> {
  @property()
  label: string = "Value";

  @query("input[type=text]")
  inputElem!: HTMLInputElement;

  @property()
  set init(s: string) {
    this.inputElem.value = s;
  }

  firstFocusable = this.inputElem;
  abstract isValid: () => boolean;
  abstract fill(val: T): void;
  abstract value(): T | null;
  clear(): void {
    this.inputElem.value = "";
  }

  render() {
    return html`
      <div>${this.label}</div>
      <input class="inputelem" type="text" @input=${() => this.input()} />
    `;
  }
}

@customElement("string-input")
export class StringInput extends ValueInput<string> {
  isValid: () => boolean = () => {
    return this.inputElem.value != "";
  };

  fill(val: string): void {
    this.inputElem.value = val;
  }

  value(): string | null {
    if (!this.isValid()) return null;
    return this.inputElem.value;
  }
}

@customElement("name-input")
export class NameInput extends ValueInput<string> {
  isValid: () => boolean = () => {
    return (
      (!this.required && this.inputElem.value == "") ||
      this.inputElem.value.match(/^[a-zA-Z]+$/) != null
    );
  };

  fill(val: string): void {
    this.inputElem.value = val;
  }

  value(): string | null {
    if (!this.isValid()) return null;
    return this.inputElem.value;
  }
}

@customElement("doc-input")
export class DocInput extends ValueInput<string> {
  @query("textarea")
  inputElem!: HTMLInputElement;

  isValid: () => boolean = () => this.inputElem.value != "";
  fill(val: string): void {
    this.inputElem.value = val;
  }
  value(): string | null {
    if (!this.isValid()) return null;
    return this.inputElem.value;
  }
  render() {
    return html`
      <div>${this.label}</div>
      <textarea @input=${() => this.input()}></textarea>
    `;
  }
}

@customElement("number-input")
export class NumberInput extends ValueInput<number> {
  isValid: () => boolean = () => {
    return !Number.isNaN(parseInt(this.inputElem.value));
  };

  fill(val: number): void {
    this.inputElem.value = String(val);
  }

  value(): number | null {
    return parseInt(this.inputElem.value);
  }
}

@customElement("dimension-input")
export class DimensionInput extends ValueInput<number | "None"> {
  isValid: () => boolean = () => {
    return (
      this.inputElem.value == "any" ||
      !Number.isNaN(parseInt(this.inputElem.value))
    );
  };

  fill(val: number | "None"): void {
    this.inputElem.value = val == "None" ? "any" : String(val);
  }

  value(): number | "None" | null {
    if (!this.isValid()) return null;
    return this.inputElem.value == "any"
      ? "None"
      : parseInt(this.inputElem.value);
  }
}

@customElement("shape-or-scalar-input")
export class ShapeOrScalarInput extends NdxInputElem<
  ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]
> {
  firstFocusable?: HTMLElement | undefined;
  @query("radio-input")
  radioInput!: RadioInput;

  @query("shape-input")
  shapeInput!: ShapeInput;

  @query("string-input")
  scalarInput!: NameInput;

  @query("checkbox-input")
  defaultInput!: CheckboxInput;

  isValid: () => boolean = () => {
    return (
      (this.shapeNotScalar == false && this.scalarInput.isValid()) ||
      (this.shapeNotScalar == true && this.shapeInput.isValid()) ||
      false
    );
  };

  fill(val: ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]): void {
    if (val[0] == "SCALAR") {
      this.shapeNotScalar = false;
      Promise.resolve(this.updateComplete).then(() => {
        this.scalarInput.fill(val[1][0]);
        this.defaultInput.fill(val[1][1]);
      });
    } else {
      this.shapeNotScalar = true;
      Promise.resolve(this.updateComplete).then(() => {
        this.shapeInput.fill(val[1]);
      });
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
        .options=${["Scalar", "Multidimensional"]}
        .selected=${this.shapeNotScalar ? 1 : 0}
        .onSelect=${(i: number) => {
          this.shapeNotScalar = i == 1;
          Promise.resolve(this.updateComplete).then(() => this.input());
        }}
      ></radio-input>
      <string-input
        style=${styleMap(this.shapeNotScalar ? { display: "None" } : {})}
        label="Attribute value"
        .input=${() => this.input()}
      ></string-input>
      <checkbox-input
        style=${styleMap(this.shapeNotScalar ? { display: "None" } : {})}
        label="Allow override"
        .input=${() => this.input()}
      ></checkbox-input>
      <shape-input
        style=${styleMap(this.shapeNotScalar ? {} : { display: "None" })}
        .input=${() => {
          this.input();
        }}
      ></shape-input>
    `;
  }
}

@customElement("checkbox-input")
export class CheckboxInput extends NdxInputElem<boolean> {
  firstFocusable?: HTMLElement | undefined = undefined;
  constructor() {
    super();
    this.addEventListener("click", () => (this.checked = !this.checked));
  }

  fill(val: boolean): void {
    this.checked = val;
  }

  value(): boolean {
    return this.checked;
  }

  clear(): void {
    this.checked = this.default;
  }

  @property()
  label: string = "";

  @property({ reflect: true, type: Boolean })
  checked: boolean = true;

  @property()
  default: boolean = false;

  render() {
    return html`
      <!-- <input type="checkbox" .value=${this.default} /> -->
      <div class=${classMap({ checked: this.checked, checkbox: true })}>
        <span class="material-symbols-outlined">done</span>
      </div>
      <div class="label">${this.label}</div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }

      * {
        transition: 0.2s;
      }

      :host(:not([checked])) span.material-symbols-outlined {
        display: none;
      }

      span.material-symbols-outlined {
        top: 50%;
        left: 50%;
        position: absolute;
        font-size: 18px;
        transform: translate(-50%, -50%) scale(1.2);
        color: var(--clickable-hover);
      }

      .checkbox {
        // padding: 0.1em 0.3em;
        // padding: 0 0.2em;
        border-radius: 0.2em;
        border: 1px solid var(--color-border-alt);
        position: relative;
        height: 18px;
        width: 18px;
        background: var(--color-background);
      }

      .checkbox:not(.checked):hover {
        background: var(--background-light-button);
        border-color: var(--clickable);
      }

      .checkbox.checked {
        background: var(--background-light-button);
        border: 2px solid var(--clickable);
      }

      .label {
        margin-left: 0.5em;
      }
    `,
  ];
}

@customElement("dtype-input")
export class DtypeInput extends NdxInputElem<Dtype> {
  firstFocusable?: HTMLElement | undefined;

  isValid: () => boolean = () => {
    return (
      this.dtypeOptions[this.dtypeOption] == "Primitive" ||
      (this.compoundType.length > 0 &&
        this.compoundType.every(({ name, doc }) => name != "" && doc != ""))
    );
  };

  fill(val: Dtype): void {
    this.dtypeOption = val[0] == "PRIMITIVE" ? 0 : 1;
    if (val[0] == "PRIMITIVE") {
      this.primitive = val[1];
    } else if (val[0] == "COMPOUND" && val[1].length > 0) {
      this.compoundType = val[1];
    }
    this.input();
  }

  value(): Dtype | null {
    if (!this.isValid()) return null;
    if (this.dtypeOption == 0) {
      return ["PRIMITIVE", this.primitive];
    } else {
      return ["COMPOUND", this.compoundType];
    }
  }

  clear(): void {
    this.dtypeOption = 0;
    this.compoundType = [{ name: "", dtype: ["PRIMITIVE", "Any"], doc: "" }];
    this.primitive = "Any";
  }

  primitiveOptions(
    selected: string = "",
    withGenerics = true
  ): TemplateResult<1> {
    return html`
      <option value="i8" ?selected=${selected == "i8"}>int8</option>
      <option value="i6" ?selected=${selected == "i16"}>int16</option>
      <option value="i32" ?selected=${selected == "i32"}>int32</option>
      <option value="i64" ?selected=${selected == "i64"}>int64</option>
      <option value="u8" ?selected=${selected == "u8"}>uint8</option>
      <option value="u16" ?selected=${selected == "u16"}>uint16</option>
      <option value="u32" ?selected=${selected == "u32"}>uint32</option>
      <option value="u64" ?selected=${selected == "u64"}>uint64</option>
      <option value="f32" ?selected=${selected == "f32"}>float32</option>
      <option value="f64" ?selected=${selected == "f64"}>float64</option>
      <option value="Bool" ?selected=${selected == "Bool"}>bool</option>
      <option value="Ascii" ?selected=${selected == "Ascii"}>ascii</option>
      <option value="Text" ?selected=${selected == "Text"}>Text</option>
      <option value="IsoDatetime" ?selected=${selected == "IsoDateTime"}>
        ISO Datetime
      </option>
      ${when(
        withGenerics,
        () => html`
          <option value="Numeric" ?selected=${selected == "Numeric"}>
            Numeric
          </option>
          <option value="Any" ?selected=${selected == "Any"}>Any</option>
        `
      )}
    `;
  }

  dtypeOptions: ("Primitive" | "Compound" | "Refspec")[] = [
    "Primitive",
    "Compound",
  ];
  primitive: PrimitiveDtype = "Any";

  @state()
  dtypeOption = 0;

  @state()
  compoundType: CompoundDtype[] = [
    { name: "", dtype: ["PRIMITIVE", "Any"], doc: "" },
  ];

  render() {
    return html`
      <radio-input
        .selected=${this.dtypeOption}
        .options=${this.dtypeOptions}
        .onSelect=${(i: number) => {
          this.dtypeOption = i;
          Promise.resolve(this.updateComplete).then(() => this.input());
        }}
      ></radio-input>
      ${choose(this.dtypeOptions[this.dtypeOption], [
        [
          "Primitive",
          () => html`
            <select @change=${() => this.input()}>
              ${this.primitiveOptions(this.primitive)}
            </select>
          `,
        ],
        [
          "Compound",
          () => html`
            <div class="addremove">
              <light-button
                .disabled=${this.compoundType.length <= 1}
                @click=${() => {
                  this.compoundType = [...this.compoundType.slice(0, -1)];
                  this.input();
                }}
              >
                <span class="material-symbols-outlined">remove</span>
              </light-button>
              <light-button
                @click=${() => {
                  this.compoundType = [
                    ...this.compoundType,
                    { name: "", doc: "", dtype: ["PRIMITIVE", "Any"] },
                  ];
                  this.input();
                }}
              >
                <span class="material-symbols-outlined">add</span>
              </light-button>
            </div>

            <div class="compound-wrapper">
              <div>Name</div>
              <div>Doc</div>
              <div>Type</div>
              ${map(
                this.compoundType,
                ({ name, doc, dtype }, i) => html`
                  <input
                    type="text"
                    .value=${name}
                    @input=${({ target: t }: Event) => {
                      this.compoundType[i].name = (t as HTMLInputElement).value;
                      this.input();
                    }}
                  />
                  <input
                    type="text"
                    .value=${doc}
                    @input=${({ target: t }: Event) => {
                      this.compoundType[i].doc = (t as HTMLInputElement).value;
                      this.input();
                    }}
                  />
                  <select @change=${() => this.input()}>
                    ${this.primitiveOptions(
                      dtype[0] == "PRIMITIVE" ? dtype[1] : "",
                      false
                    )}
                  </select>
                `
              )}
            </div>
          `,
        ],
      ])}
    `;
  }
  static styles = [
    symbols,
    css`
      .compound-wrapper {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
      }

      .addremove {
        margin-left: auto;
        display: flex;
      }
      .addremove light-button {
        font-size: 0.1em;
        margin: 0 2em;
      }
      .addremove span.material-symbols-outlined {
        font-size: 20px;
      }
    `,
  ];
}

@customElement("shape-input")
export class ShapeInput extends NdxInputElem<Shape[]> {
  @query("shape-wrapper > input:first-child")
  firstFocusable?: HTMLElement;

  isValid: () => boolean = () => {
    if (this.shapes.length == 0) return false;

    function invalidDimension(d: string | number) {
      return (
        (typeof d != "number" && (d as string) != "any") || (d as number) < 1
      );
    }

    for (const shape of this.shapes) {
      for (const axis of shape) {
        if (axis[1] == "" || invalidDimension(axis[0])) {
          return false;
        }
      }
    }
    return true;
  };

  fill(val: Shape[]): void {
    if (val.length != 0)
      this.shapes = val.map((shape) =>
        shape.map((axis) => [axis[0] == "None" ? "any" : axis[0], axis[1]])
      );
  }

  value(): Shape[] | null {
    if (!this.isValid()) return null;
    const s: Shape[] = this.shapes.map((shape) =>
      shape.map((axis) => [axis[0] as number | "None", axis[1]])
    );
    return s;
  }

  clear(): void {
    this.shapes = [this.defaultShape];
  }

  defaultShape: [number | string, string][] = [
    [2, ""],
    ["any", ""],
  ];

  @state()
  shapes: [number | string, string][][] = [this.defaultShape];

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
                  <light-button
                    .disabled=${shape.length <= 1}
                    @click=${() => {
                      this.shapes = [
                        ...this.shapes.slice(0, i),
                        shape.slice(0, -1),
                        ...this.shapes.slice(i + 1),
                      ];
                      this.input();
                    }}
                  >
                    <span class="material-symbols-outlined">remove</span>
                  </light-button>
                  <light-button
                    @click=${() => {
                      this.shapes = [
                        ...this.shapes.slice(0, i),
                        [...shape, [2, ""]],
                        ...this.shapes.slice(i + 1),
                      ];
                      this.input();
                    }}
                  >
                    <span class="material-symbols-outlined">add</span>
                  </light-button>
                </div>
              </div>
              ${map(
                shape,
                ([dim, label], j) =>
                  html`
                    <input
                      type="text"
                      class="dim"
                      .value=${dim}
                      @input=${({ target: t }: InputEvent) => {
                        let dimstr = (
                          t as HTMLInputElement
                        ).value.toLocaleLowerCase();
                        let dimnum = parseInt(dimstr);
                        this.shapes[i][j][0] = isNaN(dimnum) ? dimstr : dimnum;
                        this.input();
                      }}
                    />
                    <input
                      type="text"
                      class="label"
                      .value=${label}
                      @input=${({ target: t }: InputEvent) => {
                        // no need to re-render
                        this.shapes[i][j][1] = (t as HTMLInputElement)?.value;
                        this.input();
                      }}
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
                    this.input();
                  }}
                >
                  <span class="material-symbols-outlined">close</span>
                </light-button>
              </div>`
            )}
          `
      )}
      <light-button
        @click=${() => {
          this.shapes = [...this.shapes, this.defaultShape];
          this.input();
        }}
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

      .or-bar {
        margin: 0.5em 0;
        display: flex;
        align-items: center;
        font-weight: bold;
      }

      .or-bar > div {
        margin-right: 0.5em;
      }

      .addremove {
        margin-left: auto;
        display: flex;
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

@customElement("input-tests-wrapper")
export class TestWrapper extends LitElement {
  render() {
    return html`
      <dtype-input></dtype-input>
      <checkbox-input label="Test checkbox"></checkbox-input>
      <shape-or-scalar-input></shape-or-scalar-input>
      <quantity-or-name-input></quantity-or-name-input>
      <value-input label="Typename"></value-input>
    `;
  }
}
