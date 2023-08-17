import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "./basic-elems";
import "./inputs/all";
import "./typeviz/all";

@customElement("ndx-main")
export class NdxMain extends LitElement {
  render() {
    return html`
      <h1>Some NDX AST Visual Elements</h1>
      <input-tests-wrapper></input-tests-wrapper>
      <link-dec-elem></link-dec-elem>
      <attrib-dec-elem></attrib-dec-elem>
      <group-anondec-elem></group-anondec-elem>
      <group-incdec-elem></group-incdec-elem>
      <dataset-anondec-elem></dataset-anondec-elem>
      <dataset-incdec-elem></dataset-incdec-elem>
      <dataset-def-elem></dataset-def-elem>
      <div></div>
    `;
  }

  static styles = css`
    :host {
      height: 100vh;
      width: 100vw;
      overflow: scroll;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    :host > h1 {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    :host > h1 > a {
      position: absolute;
      right: 5%;
      font-size: 0.5em;
      color: var(--clickable);
    }

    :host > div {
      display: flex;
      width: 100%;
      height: 100%;
    }

    :host > div > mytypes-bar {
      margin-bottom: auto;
    }

    :host > div > *:not(mytypes-bar) {
      margin: auto;
      position: relative;
    }

    group-def-elem,
    dataset-def-elem {
    }

    :host .save {
      position: absolute;
      top: 80%;
      left: 80%;
    }

    :host > div > div.create {
      display: flex;
      margin-top: 8em;
    }

    .create > * {
      margin: auto 2em;
    }

    :host > div > .typedef {
      margin-top: 1em;
      padding: 0 5em;
      padding-bottom: 4em;
    }

    :host > div > inctype-browser {
      margin-top: 1em;
      overflow: scroll;
    }
  `;
}
