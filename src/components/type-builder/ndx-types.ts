import { LitElement, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { CarouselItem } from "../generic/carousel";
import {
  DatasetTypedefConstructor,
  GroupTypedefConstructor,
  TypedefConstructor,
} from "./typedef";
import { symbols } from "../../styles";
import { TypeDef } from "../../nwb/spec";
import { WebGLBackground } from "../generic/glbackground";
import "./inctype-browser";

declare global {
  interface HTMLElementTagNameMap {
    "ndx-types": NdxTypes;
  }
}

@customElement("ndx-types")
export class NdxTypes extends CarouselItem {
  protected firstUpdated(): void {
    const truple = (x: number): any => [x, x, x];
    this.background = new WebGLBackground(
      this.canvas,
      truple(0.97),
      truple(0.9),
      30,
      0.08
    );
  }

  @state()
  complete: boolean = true;

  @state()
  typesEnvironment: TypeDef[] = [];

  @query("#board")
  board!: HTMLElement;

  @query("canvas", true)
  canvas!: HTMLCanvasElement;

  background: WebGLBackground | null = null;

  addTypedef = (lazyTypedefElem: () => TypedefConstructor) => {
    if (this.board.querySelector("#typedef")) return;
    const typedefElem = lazyTypedefElem();
    typedefElem.id = "typedef";
    this.board.appendChild(typedefElem);
  };

  render() {
    return html`
      <ndx-type-bar
        .addGroup=${() => this.addTypedef(() => new GroupTypedefConstructor())}
        .addDataset=${() =>
          this.addTypedef(() => new DatasetTypedefConstructor())}
      >
      </ndx-type-bar>
      <div id="board">
        <canvas id="background"></canvas>
        <!-- <div></div> -->
        <!-- <dataset-typedef-constructor
          id="typedef"
        ></dataset-typedef-constructor> -->
        <!-- <group-inctype-browser></group-inctype-browser> -->
      </div>
    `;
  }

  static styles = css`
    :host {
      display: grid;
      background-size: 60px 60px;
      background-image: linear-gradient(to right, #ddd 1px, transparent 1px),
        linear-gradient(to bottom, #ddd 1px, transparent 1px);
      grid-template-columns: 1fr 6fr;
    }

    #board {
      position: relative;
      overflow: scroll;
      display: flex;
      flex-direction: column;
      padding: 5em;
      padding-top: 1.5em;
    }

    canvas {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 0;
    }

    #board > div {
      background: red;
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
    // shadowRootCss,
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        background: var(--color-background-alt);
        border-right: 1px solid var(--color-border-alt);
        align-items: center;
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
        width: 100%;
        background: var(--color-background);
        margin: 0;
        padding: 0.2em 0;
        justify-content: center;
        border-bottom: 1px solid var(--color-border-alt);
      }

      .addbtn {
        width: 8em;
        padding: 0.5em 1em;
        color: var(--clickable-hover);
        border-radius: 0.5em;
        border: 2px solid var(--clickable-hover);
        box-shadow: 0.05em 0.05em 0.2em #ddd;
        cursor: pointer;
        transition: 0.2s;
      }

      .addbtn > span {
        font-weight: 700;
        background: inherit;
        margin-left: 0.3em;
      }

      .addbtn > span:first-child {
        margin: 0 auto;
      }

      .addbtn:hover {
        box-shadow: 0.1em 0.2em 0.2em #ccc;
      }
    `,
  ];
}
