import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { buttonStyles } from "./buttons";

@customElement("author-table")
export class AuthorTable extends LitElement {
  @property({ type: Array<[string, string]> })
  authors: [string, string][] = [["", ""]];

  private closebtn(onclick: (e?: Event) => void) {
    return html` <svg
      @click=${onclick}
      class="closebtn"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
    >
      <path
        d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"
      />
    </svg>`;
  }

  private removeAuthorRow(i: number) {
    if (this.authors.length <= 1) return;
    this.authors = [...this.authors.slice(0, i), ...this.authors.slice(i + 1)];
  }

  private appendRow(_: number) {
    this.authors = [...this.authors, ["", ""]];
  }

  private updateAuthorName(e: Event, i: number) {
    const target = e.target as HTMLInputElement;
    this.authors = [
      ...this.authors.slice(0, i),
      [target.value, this.authors[i][1]],
      ...this.authors.slice(i + 1),
    ];
  }

  private updateAuthorEmail(e: Event, i: number) {
    const target = e.target as HTMLInputElement;
    this.authors = [
      ...this.authors.slice(0, i),
      [this.authors[i][0], target.value],
      ...this.authors.slice(i + 1),
    ];
  }

  private _authorRows(authors: [String, String][]) {
    return html`
      ${map(
        authors,
        ([name, email], i) => html`
                <input @change=${(e: Event) =>
                  this.updateAuthorName(
                    e,
                    i
                  )} type="text" .value=${name} required></input>
                <input @change=${(e: Event) =>
                  this.updateAuthorEmail(
                    e,
                    i
                  )} .value=${email} required></input>
                <div>
                    ${
                      this.authors.length > 1
                        ? this.closebtn(() => this.removeAuthorRow(i))
                        : html``
                    }
                </div>
            `
      )}
    `;
  }

  render() {
    return html`
      <div class="grid">
        <div>Name</div>
        <div>Email</div>
        <div></div>
        ${this._authorRows(this.authors)}
        <div @click=${this.appendRow} class="lightbtn">Add Author</div>
      </div>
    `;
  }

  debug() {
    console.log(this.authors);
  }

  static styles = [
    buttonStyles,
    css`
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        padding: 1em;
      }
      .closebtn {
        height: 2em;
        width: 2em;
      }
      #addbtn {
        margin: 0.3em 0;
        padding: 0.2em;
        margin-right: auto;
        border: 1px solid #808080;
      }
      #addbtn:hover {
        background-color: #e0e0e0;
      }
    `,
  ];
}
