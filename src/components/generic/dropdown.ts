import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { colors, symbols } from "../../styles";

@customElement("click-dropdown")
export class Dropdown extends LitElement {
  @state()
  show: boolean = false;

  render() {
    return html`
      <div @click=${() => (this.show = !this.show)}>
        <slot name="selected"></slot>
        <span class="material-symbols-outlined">expand_more</span>
      </div>
      <div id="dropdown" style="display:${this.show ? "block" : "none"}">
        <slot @click=${() => (this.show = !this.show)}></slot>
      </div>
    `;
  }

  static styles = [
    colors,
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 0.5em;
        border: 1px solid var(--color-border);
        border-radius: 0.5em;
        position: relative;
        cursor: pointer;
      }

      :host > div:first-child {
        display: flex;
        flex-direction: row;
      }

      #dropdown {
        position: absolute;
        background: var(--color-background);
        top: -0.2em;
        left: -0.2em;
        border: 2px solid var(--clickable-hover);
        border-radius: 0.5em;
        padding: 0.5em;
        box-shadow: 0.1em 0.1em 0.2em var(--color-border-alt);
      }

      #dropdown ::slotted(*) {
        font-weight: 300;
      }

      #dropdown ::slotted(*:hover) {
        font-weight: 700;
      }
    `,
  ];
}
