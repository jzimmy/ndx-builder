import { TemplateResult, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { Dtype, PrimitiveDtype, CompoundDtype } from "../nwb/spec";
import { symbols } from "../styles";
import { NdxInputElem } from "./abstract-input";

@customElement("dtype-input")
export class DtypeInput extends NdxInputElem<Dtype> {
  firstFocusableElem?: HTMLElement | undefined;

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
    this.onInteraction();
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
          Promise.resolve(this.updateComplete).then(() => this.onInteraction());
        }}
      ></radio-input>
      ${choose(this.dtypeOptions[this.dtypeOption], [
        [
          "Primitive",
          () => html`
            <select @change=${() => this.onInteraction()}>
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
                  this.onInteraction();
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
                  this.onInteraction();
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
                      this.onInteraction();
                    }}
                  />
                  <input
                    type="text"
                    .value=${doc}
                    @input=${({ target: t }: Event) => {
                      this.compoundType[i].doc = (t as HTMLInputElement).value;
                      this.onInteraction();
                    }}
                  />
                  <select @change=${() => this.onInteraction()}>
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
