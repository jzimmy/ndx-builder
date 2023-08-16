import { html, css } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { Shape } from "../nwb/spec";
import { symbols } from "../styles";
import { NdxInputElem } from "./abstract-input";

@customElement("shape-input")
export class ShapeInput extends NdxInputElem<Shape[]> {
  @query("shape-wrapper > input:first-child")
  firstFocusableElem?: HTMLElement;

  isValid: () => boolean = () => {
    if (this.shapes.length == 0) return false;

    function invalidDimension(d: string | number) {
      return (
        (typeof d != "number" && (d as string) != "any") || (d as number) < 1
      );
    }

    for (const shape of this.shapes) {
      for (const axis of shape) {
        if (axis[1] == "" || invalidDimension(axis[0])) {
          return false;
        }
      }
    }
    return true;
  };

  fill(val: Shape[]): void {
    if (val.length != 0)
      this.shapes = val.map((shape) =>
        shape.map((axis) => [axis[0] == "None" ? "any" : axis[0], axis[1]])
      );
  }

  value(): Shape[] | null {
    if (!this.isValid()) return null;
    const s: Shape[] = this.shapes.map((shape) =>
      shape.map((axis) => [axis[0] as number | "None", axis[1]])
    );
    return s;
  }

  clear(): void {
    this.shapes = [this.defaultShape];
  }

  defaultShape: [number | string, string][] = [
    [2, ""],
    ["any", ""],
  ];

  @state()
  shapes: [number | string, string][][] = [this.defaultShape];

  render() {
    return html`<div>Stored data axes</div>
      <div class="note">Use 'any' to indicate unlimited axis length</div>
      ${map(
        this.shapes,
        (shape, i) => html`
          <div class="shape-wrapper">
            <div class="toprow">Axis Length</div>
            <div class="toprow">
              Axis Label
              <div class="addremove">
                <light-button
                  .disabled=${shape.length <= 1}
                  @click=${() => {
                    this.shapes = [
                      ...this.shapes.slice(0, i),
                      shape.slice(0, -1),
                      ...this.shapes.slice(i + 1),
                    ];
                    this.onInteraction();
                  }}
                >
                  <span class="material-symbols-outlined">remove</span>
                </light-button>
                <light-button
                  @click=${() => {
                    this.shapes = [
                      ...this.shapes.slice(0, i),
                      [...shape, [2, ""]],
                      ...this.shapes.slice(i + 1),
                    ];
                    this.onInteraction();
                  }}
                >
                  <span class="material-symbols-outlined">add</span>
                </light-button>
              </div>
            </div>
            ${map(
              shape,
              ([dim, label], j) => html`
                <input
                  type="text"
                  class="dim"
                  .value=${dim}
                  @input=${({ target: t }: InputEvent) => {
                    let dimstr = (
                      t as HTMLInputElement
                    ).value.toLocaleLowerCase();
                    let dimnum = parseInt(dimstr);
                    this.shapes[i][j][0] = isNaN(dimnum) ? dimstr : dimnum;
                    this.onInteraction();
                  }}
                />
                <input
                  type="text"
                  class="label"
                  .value=${label}
                  @input=${({ target: t }: InputEvent) => {
                    // no need to re-render
                    this.shapes[i][j][1] = (t as HTMLInputElement)?.value;
                    this.onInteraction();
                  }}
                />
              `
            )}
          </div>
          ${when(
            i + 1 < this.shapes.length,
            () => html`<div class="or-bar">
              <div>OR</div>
              <light-button
                @click=${() => {
                  this.shapes = [
                    ...this.shapes.slice(0, i + 1),
                    ...this.shapes.slice(i + 2),
                  ];
                  this.onInteraction();
                }}
              >
                <span class="material-symbols-outlined">close</span>
              </light-button>
            </div>`
          )}
        `
      )}
      <light-button
        @click=${() => {
          this.shapes = [...this.shapes, this.defaultShape];
          this.onInteraction();
        }}
        >Add another shape option</light-button
      > `;
  }

  static styles = [
    symbols,
    css`
      :host {
      }

      .shape-wrapper {
        display: grid;
        grid-template-columns: 1fr 2fr;
      }

      .toprow {
        margin-bottom: 0.5em;
        display: flex;
        align-items: center;
      }

      .dim {
        width: 6em;
      }

      .or-bar {
        margin: 0.5em 0;
        display: flex;
        align-items: center;
        font-weight: bold;
      }

      .or-bar > div {
        margin-right: 0.5em;
      }

      .addremove {
        margin-left: auto;
        display: flex;
      }
      .addremove light-button,
      .or-bar light-button {
        font-size: 0.1em;
        margin: 0 2em;
      }
      .addremove span.material-symbols-outlined,
      .or-bar span.material-symbols-outlined {
        font-size: 20px;
      }
    `,
  ];
}
