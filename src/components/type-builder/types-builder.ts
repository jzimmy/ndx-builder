import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { NdxCarousel } from "../generic/ndx-carousel";
import { TypedefConstructor } from "./typedef";
import { colors, symbols } from "../../styles";

@customElement("ndx-types-builder")
export class NdxTypesBuilder extends LitElement {
  @state()
  complete: boolean = false;

  render() {
    const carousel = document.getElementById("carousel") as NdxCarousel;
    if (!this.complete) {
      carousel.nextEnabled = false;
    }

    return html`
      <ndx-type-bar></ndx-type-bar>
      <div id="board">
        <typedef-constructor></typedef-constructor>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: grid;
      background-size: 60px 60px;
      background-image: linear-gradient(to right, #ddd 1px, transparent 1px),
        linear-gradient(to bottom, #ddd 1px, transparent 1px);
      grid-template-columns: 1fr 5fr;
    }

    #board {
      overflow: scroll;
      display: flex;
      flex-direction: column;
    }
  `;
}

@customElement("ndx-type-bar")
export class NdxTypeBar extends LitElement {
  render() {
    return html`
      <h1>My Types</h1>
      <slot></slot>
      <div id="addbtn">
        <span class="material-symbols-outlined">add</span>
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
        background: var(--color-background-alt);
        border-right: 1px solid var(--color-border-alt);
        padding: auto;
      }

      :host * {
        background: var(--color-background);
      }

      h1 {
        margin: 0 0 0.5em 0;
        padding: 0.2em 0;
        text-align: center;
        border-bottom: 1px solid var(--color-border-alt);
      }

      #addbtn {
        cursor: pointer;
        margin: 0 auto;
        padding: 0.5em 3em;
        font-weight: bold;
        border-radius: 0.5em;
        border: 1px solid var(--color-border-alt);
      }
    `,
  ];
}

export { TypedefConstructor };
