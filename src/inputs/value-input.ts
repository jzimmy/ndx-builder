import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { NdxInputElem } from "./abstract-input";

export abstract class ValueInput<T> extends NdxInputElem<T> {
  @property()
  label: string = "Value";

  @query("input[type=text]")
  inputElem!: HTMLInputElement;

  @property()
  set init(s: string) {
    this.inputElem.value = s;
  }

  firstFocusableElem = this.inputElem;
  abstract isValid: () => boolean;
  abstract fill(val: T): void;
  abstract value(): T | null;
  clear(): void {
    this.inputElem.value = "";
  }

  render() {
    return html`
      <div>${this.label}</div>
      <input
        class="inputelem"
        type="text"
        @input=${() => this.onInteraction()}
      />
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
    this.onInteraction();
  }

  value(): string | null {
    if (!this.isValid()) return null;
    return this.inputElem.value;
  }
}

@customElement("name-input")
export class NameInput extends StringInput {
  isValid: () => boolean = () => {
    return !this.required && this.inputElem.value != "";
  };
}

@customElement("namespace-name-input")
export class NamespaceNameInput extends StringInput {
  isValid: () => boolean = () => {
    return this.inputElem.value.match(/^ndx-[a-zA-Z_][a-zA-Z_0-9]*$/) != null;
  };
}

@customElement("doc-input")
export class DocInput extends ValueInput<string> {
  @query("textarea")
  inputElem!: HTMLInputElement;

  isValid: () => boolean = () => this.inputElem.value != "";
  fill(val: string): void {
    this.inputElem.value = val;
    this.onInteraction();
  }
  value(): string | null {
    if (!this.isValid()) return null;
    return this.inputElem.value;
  }
  render() {
    return html`
      <div>${this.label}</div>
      <textarea @input=${() => this.onInteraction()}></textarea>
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
    this.onInteraction();
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
    this.onInteraction();
  }

  value(): number | "None" | null {
    if (!this.isValid()) return null;
    return this.inputElem.value == "any"
      ? "None"
      : parseInt(this.inputElem.value);
  }
}
