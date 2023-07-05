import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { NdxCarousel } from "../generic/ndx-carousel";
import { DatasetTypedefConstructor, GroupTypedefConstructor } from "./typedef";
import { colors, symbols } from "../../styles";

@customElement("ndx-types-builder")
export class NdxTypesBuilder extends LitElement {
  @state()
  complete: boolean = false;

  @query("#board")
  board!: HTMLElement;

  destroyTypedefConstructor() {
    const constructor = this.board.querySelector("#typedef-constructor");
    console.log(this.board);
    if (constructor) constructor.remove();
  }

  addGroupTypedefConstructor() {
    console.log(this.board);
    const constructor = this.board.children.length > 0;
    if (constructor) return;
    const groupTypedef = new GroupTypedefConstructor();
    groupTypedef.id = "typedef-constructor";
    this.board.appendChild(groupTypedef);
  }

  addDatasetTypedefConstructor() {
    console.log(this.board);
    const constructor = this.board.children.length > 0;
    if (constructor) return;
    const groupTypedef = new DatasetTypedefConstructor();
    groupTypedef.id = "typedef-constructor";
    this.board.appendChild(groupTypedef);
  }

  render() {
    const carousel = document.getElementById("carousel") as NdxCarousel;
    if (!this.complete) {
      carousel.nextEnabled = false;
    }

    return html`
      <ndx-type-bar
        .addfn=${() => this.addGroupTypedefConstructor()}
      ></ndx-type-bar>
      <div id="board">
        <dataset-typedef-constructor
          id="typedef-constructor"
        ></dataset-typedef-constructor>
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
  @property({ type: Function })
  addfn!: () => void;

  render() {
    return html`
      <h1>My Types</h1>
      <slot></slot>
      <div @click=${this.addfn} id="addbtn">
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

export { GroupTypedefConstructor };
