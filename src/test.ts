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
    return html`<div>
      <div class="backdrop"></div>
      <div class="large">hello</div>
    </div>`;
  }

  static styles = css`
    :host {
      border: 2px solid red;
      display: flex;
      overflow: hidden;
    }

    :host > * {
      outline: 2px solid blue;
      width: 100%;
      overflow: scroll;
      display: flex;
    }

    :host > div > * {
      margin: 40px;
    }

    .large {
      flex: 1;
      font-size: 12em;
      height: 900px;
      border: 2px solid green;
    }

    div.backdrop {
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
