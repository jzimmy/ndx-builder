import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { CarouselItem } from "./components/generic/carousel";

declare global {
  interface HTMLElementTagNameMap {
    "test-elem": TestElem;
  }
}

@customElement("test-elem")
export class TestElem extends CarouselItem {
  complete = true;

  render() {
    return html`
      <div class="sidebar">Sidebar</div>
      <div class="strange-necessary-wrapper">
        <div class="board">
          <div class="backdrop"></div>
          <ul>
            <div class="large">
              hello this is more and more andmore andmore andmore andmore
              andmore andmore andmore andmore andmore
            </div>
            <div class="large">
              hello this is more and more andmore andmore andmore andmore
              andmore andmore andmore andmore andmore
            </div>
          </ul>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      border: 2px solid red;
      display: flex;
      overflow: hidden;
    }

    :host > .strange-necessary-wrapper {
      flex: 1;
      overflow: scroll;
      position: relative;
    }

    :host > .sidebar {
      width: 20%;
      height: 100%;
    }

    .board {
      position: relative;
      border: 2px solid blue;
      width: 100%;
      overflow: scroll;
      display: flex;
    }

    .board > * {
      margin: 40px;
    }

    .board > ul {
      display: flex;
      flex-direction: row;
    }

    .large {
      flex: 0 0;
      font-size: 12em;
      border: 2px solid green;
      display: flex;
      flex-direction: column;
    }

    .large > div {
      flex-shrink: 0;
    }

    .board > .backdrop {
      margin: 0;
      top: 0;
      left: 0;
      position: absolute;
      background: lightblue;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
  `;
}
