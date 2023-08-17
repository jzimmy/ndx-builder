import { html, css } from "lit";
import { query, customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { NdxInputElem } from "./abstract-input";
import { symbols } from "../styles";

@customElement("radio-input")
export class RadioInput extends NdxInputElem<string> {
  @query("div.first")
  firstFocusableElem: HTMLElement | undefined;

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
            this.onInteraction();
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
@customElement("checkbox-input")
export class CheckboxInput extends NdxInputElem<boolean> {
  firstFocusableElem?: HTMLElement | undefined = undefined;
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
