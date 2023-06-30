import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AuthorTable } from "./author-table";
import { buttonStyles } from "../generic/buttons";
export { AuthorTable };

@customElement("ndx-namespace")
export class NdxNamespaceBuilder extends LitElement {
  @property({ type: String })
  name = "";

  @property({ type: String })
  version = "";

  @state()
  completed = false;

  description = "";
  date = new Date();

  render() {
    return html`
            <div class="grid">
                <div>
                   <div>Name</div>
                   <input type="text" value=${
                     this.name
                   } placeholder="ndx-example"></input>
                </div>
                <div>
                   <div>Description</div>
                   <input type="textarea" .value=${this.description}></input>
                </div>
                <div>
                   <div>Full name</div>
                   <input type="text" .value="" placeholder=${
                     this.name
                   }></input>
                </div>
                <div>
                   <div>Version</div>
                   <input type="text" value=${
                     this.version
                   } placeholder="0.1.0"></input>
                </div>
                <div>
                   <div>Date</div>
                   <input type="text" value=${this.date.toLocaleDateString(
                     "en-US"
                   )}></input>
                </div>
            </div>
            <author-table></author-table>
            <ndx-bottombar help="New to NWB Extensions?" helpLink="">
               <div>Save</div>
            </ndx-bottombar>
        `;
  }

  static styles = [
    buttonStyles,
    css`
      .bottombar {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: around;
      }
    `,
  ];
}
