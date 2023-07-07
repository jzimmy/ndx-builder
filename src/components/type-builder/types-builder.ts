import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { NdxCarousel } from "../generic/ndx-carousel";
import { DatasetTypedefConstructor, GroupTypedefConstructor } from "./typedef";
import { shadowRootCss, symbols } from "../../styles";
import { TypeDef } from "../../nwb/spec";
import "./inctype-browser";
// import { IncTypeBrowser } from "./inctype-browser";

@customElement("ndx-types-builder")
export class NdxTypesBuilder extends LitElement {
  @state()
  complete: boolean = false;

  @state()
  typesEnvironment: TypeDef[] = [];

  @query("#board")
  board!: HTMLElement;

  destroyTypedefConstructor() {
    const constructor = this.board.querySelector("#typedef-constructor");
    console.log(this.board);
    if (constructor) constructor.remove();
  }

  addGroupTypedefConstructor = () => {
    console.log(this.board);
    const constructor = this.board.children.length > 0;
    if (constructor) return;
    const groupTypedef = new GroupTypedefConstructor();
    groupTypedef.id = "typedef-constructor";
    this.board.appendChild(groupTypedef);
  };

  addDatasetTypedefConstructor = () => {
    console.log(this.board);
    const constructor = this.board.children.length > 0;
    if (constructor) return;
    const groupTypedef = new DatasetTypedefConstructor();
    groupTypedef.id = "typedef-constructor";
    this.board.appendChild(groupTypedef);
  };

  render() {
    const carousel = document.getElementById("carousel") as NdxCarousel;
    if (!this.complete) {
      carousel.nextEnabled = false;
    }

    return html`
      <ndx-type-bar
        .addGroup=${this.addGroupTypedefConstructor}
        .addDataset=${this.addDatasetTypedefConstructor}
      >
      </ndx-type-bar>
      <div id="board">
        <inctype-browser></inctype-browser>
        <!-- <dataset-typedef-constructor
          id="typedef-constructor"
        ></dataset-typedef-constructor> -->
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
  addGroup!: () => void;
  @property({ type: Function })
  addDataset!: () => void;

  render() {
    return html`
      <h1>My Types</h1>
      <slot></slot>
      <div @click=${this.addGroup} class="addbtn">
        <span>Group</span>
        <span class="material-symbols-outlined">folder</span>
        <span class="material-symbols-outlined">add</span>
      </div>
      <div @click=${this.addDataset} class="addbtn">
        <span>Dataset</span>
        <span class="material-symbols-outlined">dataset</span>
        <span class="material-symbols-outlined">add</span>
      </div>
    `;
  }

  static styles = [
    shadowRootCss,
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        background: var(--color-background-alt);
        border-right: 1px solid var(--color-border-alt);
        padding: auto;
      }

      :host > * {
        display: flex;
        flex-direction: row;
      }

      ::slotted(*) {
        background: var(--color-background);
      }

      :host > div {
        background: inherit;
        margin: 0.5em 0.5em;
      }

      h1 {
        background: var(--color-background);
        margin: 0;
        padding: 0.2em 0;
        justify-content: center;
        border-bottom: 1px solid var(--color-border-alt);
      }

      .addbtn {
        cursor: pointer;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        border: 2px solid var(--clickable-hover);
        color: var(--clickable-hover);
        box-shadow: 0.05em 0.05em 0.2em #ddd;
        transition: 0.2s;
      }

      .addbtn > span {
        font-weight: 700;
        background: inherit;
        margin-left: 0.3em;
      }

      .addbtn > span:first-child {
        margin-right: auto;
      }

      .addbtn:hover {
        box-shadow: 0.1em 0.2em 0.2em #ccc;
      }
    `,
  ];
}
