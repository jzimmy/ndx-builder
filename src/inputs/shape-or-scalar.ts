import { html } from "lit";
import { query, state } from "lit/decorators.js";
import { customElement } from "lit/decorators/custom-element.js";
import { styleMap } from "lit/directives/style-map.js";
import { ShapeInput } from "./shape-input";
import { CheckboxInput } from "./radio-input";
import { NameInput } from "./value-input";
import { RadioInput } from "./radio-input";
import { NdxInputElem } from "./abstract-input";
import { Shape, Defaultable } from "../nwb/spec";

@customElement("shape-or-scalar-input")
export class ShapeOrScalarInput extends NdxInputElem<
  ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]
> {
  firstFocusableElem?: HTMLElement | undefined;
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
          Promise.resolve(this.updateComplete).then(() => this.onInteraction());
        }}
      ></radio-input>
      <string-input
        style=${styleMap(this.shapeNotScalar ? { display: "None" } : {})}
        label="Attribute value"
        .onInteraction=${() => this.onInteraction()}
      ></string-input>
      <checkbox-input
        style=${styleMap(this.shapeNotScalar ? { display: "None" } : {})}
        label="Allow override"
        .onInteraction=${() => this.onInteraction()}
      ></checkbox-input>
      <shape-input
        style=${styleMap(this.shapeNotScalar ? {} : { display: "None" })}
        .onInteraction=${() => this.onInteraction()}
      ></shape-input>
    `;
  }
}
