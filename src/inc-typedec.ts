// TODO: refactor coincidentally similar code into helper functions
import { html, css, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { TypeElement, TypedefElement } from "./typedef";
import { classMap } from "lit/directives/class-map.js";
import {
  AnonymousDatasetDec,
  AnonymousGroupTypeDec,
  AttributeDec,
  DatasetDec,
  GroupDec,
  IncDatasetDec,
  LinkDec,
} from "./nwb/spec";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";

abstract class TypedecElement extends TypeElement {
  protected abstract icon: string;
  protected abstract body(): TemplateResult<1>;

  static styles = [
    TypedefElement.styles,
    css`
      :host {
      }

      .body-section > .row:first-child {
        margin-bottom: 0.3em;
      }

      .body-section > .row > div {
        margin: 0 0.5em;
        margin-right: 0.6em;
      }

      .body-section > .row > light-button {
        font-size: 1.1em;
        margin-right: 0.5em;
        min-width: 80px;
      }

      ndx-input#instancename {
        margin-top: 0.1em;
        padding-bottom: 0.2em;
        font-size: 1.1em;
      }

      :host > ndx-textarea {
        font-size: 0.3em;
      }

      .body-section > .row > #keyword {
        font-size: 1.6em;
      }

      :host label {
        display: flex;
        align-items: center;
        margin: 0 0.5em;
      }

      label > input[type="checkbox"] {
        margin-right: 0.5em;
      }
    `,
  ];
}

abstract class IncTypedecElement extends TypedecElement {
  protected incType: string = "Pick a type";

  protected abstract firstFields(): TemplateResult<1>;
  protected abstract requiredFields(): TemplateResult<1>;
  protected abstract optionalFields(): TemplateResult<1>;
  protected body(): TemplateResult<1> {
    return html`
      <div class=${classMap({ body: true, minimize: this.minimize })}>
        <div class="body-section">
          <div class="row">
            <span class="material-symbols-outlined">${this.icon}</span>
            <div id="keyword">of</div>
            <light-button
              style=${styleMap({
                "font-weight":
                  this.incType == "Pick a type" ? "normal" : "bold",
              })}
              >${this.incType}</light-button
            >
          </div>
          ${this.firstFields()}
        </div>
        ${this.requiredFields()} ${this.optionalFields()}
      </div>
    `;
  }

  static styles = super.styles;
}

abstract class DatasetDecElem extends IncTypedecElement {
  protected icon: string = "dataset";
  @property()
  attribs = [];

  abstract get dec(): DatasetDec;

  protected requiredFields(): TemplateResult<1> {
    return html``;
  }

  protected optionalFields(): TemplateResult<1> {
    return html``;
  }

  protected subtree(_: boolean): TemplateResult<1> {
    return html``;
  }
}

abstract class GroupDecElem extends IncTypedecElement {
  protected icon: string = "folder";

  @property()
  groups = [];
  @property()
  datasets = [];
  @property()
  attribs = [];
  @property()
  links = [];

  abstract get dec(): GroupDec;

  protected requiredFields(): TemplateResult<1> {
    return html``;
  }

  protected optionalFields(): TemplateResult<1> {
    return html``;
  }

  protected subtree(_: boolean): TemplateResult<1> {
    return html``;
  }
}

@customElement("inc-dataset-dec")
export class DatasetIncTypedec extends DatasetDecElem {
  @query("input[type='checkbox']")
  namedCheckbox!: HTMLInputElement;

  @state()
  namedNotQuantity: boolean = false;

  get dec(): DatasetDec {
    throw new Error("Method not implemented.");
  }

  fill(_dec: IncDatasetDec) {}

  firstFields(): TemplateResult<1> {
    return html`<ndx-textarea></ndx-textarea> `;
  }

  requiredFields(): TemplateResult<1> {
    return html`<div
      class=${classMap({
        "body-section": true,
        minimize: this.minimize,
      })}
    >
      <div>Properties:</div>
      <label
        ><input
          @input=${() => (this.namedNotQuantity = !this.namedNotQuantity)}
          .checked=${this.namedNotQuantity}
          type="checkbox"
        />Named instance</label
      >
      ${this.namedNotQuantity
        ? html` <ndx-input label="Instance name"></ndx-input> `
        : html`<ndx-input label="Quantity"></ndx-input>`}
    </div>`;
  }
}

@customElement("anon-dataset-dec")
export class DatasetAnonTypedec extends DatasetDecElem {
  get dec(): DatasetDec {
    throw new Error("Method not implemented.");
  }

  protected incType: string = "None";

  fill(_dec: AnonymousDatasetDec) {}

  firstFields(): TemplateResult<1> {
    return html`
      <ndx-input id="instancename" label="Instance name"></ndx-input>
      <ndx-textarea></ndx-textarea>
    `;
  }

  protected requiredFields(): TemplateResult<1> {
    return html`
      <div
        class=${classMap({
          "body-section": true,
          minimize: this.minimize,
        })}
      >
        <div>Properties:</div>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Data type"
        ></ndx-input>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Axes shape"
        ></ndx-input>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Axes labels"
        ></ndx-input>
      </div>
    `;
  }

  protected subtree(enabled: boolean): TemplateResult<1> {
    const disabled = !enabled;
    return html`
      <subtree-branch ?disabled=${disabled} lastBranch="true" id="attributes">
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
      </subtree-branch>
    `;
  }
}

@customElement("inc-group-dec")
export class GroupIncTypedec extends GroupDecElem {
  @query("input[type='checkbox']")
  namedCheckbox!: HTMLInputElement;

  @state()
  namedNotQuantity: boolean = false;

  get dec(): GroupDec {
    throw new Error("Method not implemented.");
  }

  fill(_dec: GroupIncTypedec) {}

  firstFields(): TemplateResult<1> {
    return html`<ndx-textarea></ndx-textarea> `;
  }

  requiredFields(): TemplateResult<1> {
    return html` <div
      class=${classMap({
        "body-section": true,
        minimize: this.minimize,
      })}
    >
      <div>Properties:</div>
      <label
        ><input
          @input=${() => (this.namedNotQuantity = !this.namedNotQuantity)}
          .checked=${this.namedNotQuantity}
          type="checkbox"
        />Named instance</label
      >
      ${this.namedNotQuantity
        ? html` <ndx-input label="Instance name"></ndx-input> `
        : html`<ndx-input label="Quantity"></ndx-input>`}
    </div>`;
  }
}

@customElement("anon-group-dec")
export class GroupAnonTypedec extends GroupDecElem {
  get dec(): GroupDec {
    throw new Error("Method not implemented.");
  }

  protected incType: string = "None";

  fill(_dec: AnonymousGroupTypeDec) {}

  protected firstFields(): TemplateResult<1> {
    return html`
      <ndx-input id="instancename" label="Instance name"></ndx-input>
      <ndx-textarea></ndx-textarea>
    `;
  }

  protected subtree(enabled: boolean): TemplateResult<1> {
    const disabled = !enabled;
    return html`
      <subtree-branch ?disabled=${disabled} id="groups">
        <span slot="icon" class="material-symbols-outlined large">folder</span>
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="datasets">
        <span slot="icon" class="material-symbols-outlined large">dataset</span>
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="attributes">
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} lastBranch="true" id="links">
        <span slot="icon" class="material-symbols-outlined large">link</span>
      </subtree-branch>
    `;
  }
}

abstract class LeafDecElement extends TypedecElement {
  protected abstract icon: string;
  protected abstract hasTitlename: boolean;

  protected body(): TemplateResult<1> {
    return html`<div class=${classMap({ body: true, minimize: this.minimize })}>
      <div class="body-section">
        <div class="row">
          <span class="material-symbols-outlined">${this.icon}</span>
          ${this.hasTitlename
            ? html`
                <ndx-input id="instancename" label="Instance name"></ndx-input>
              `
            : html`<div id="#keyword">to</div>
                <light-button>Pick a target</light-button>`}
        </div>
        <ndx-textarea></ndx-textarea>
      </div>
      ${this.requiredFields()} ${this.optionalFields()}
    </div>`;
  }

  protected subtree(_: boolean): TemplateResult<1> {
    return html``;
  }

  protected abstract requiredFields(): TemplateResult<1>;
  protected optionalFields(): TemplateResult<1> {
    return html``;
  }
}

@customElement("link-dec")
export class LinkDecElement extends LeafDecElement {
  icon: string = "link";
  hasTitlename: boolean = false;

  @query("input[type='checkbox']")
  namedCheckbox!: HTMLInputElement;

  @state()
  namedNotQuantity: boolean = false;

  get dec(): LinkDec {
    throw new Error("Method not implemented.");
  }

  protected requiredFields(): TemplateResult<1> {
    return html`<div
      class=${classMap({
        "body-section": true,
        minimize: this.minimize,
      })}
    >
      <div>Properties:</div>
      <label
        ><input
          @input=${() => (this.namedNotQuantity = !this.namedNotQuantity)}
          .checked=${this.namedNotQuantity}
          type="checkbox"
        />Named instance</label
      >
      ${this.namedNotQuantity
        ? html` <ndx-input label="Instance name"></ndx-input> `
        : html`<ndx-input label="Quantity"></ndx-input>`}
    </div>`;
  }
}

@customElement("attribute-dec")
export class AttributeDecElement extends LeafDecElement {
  icon: string = "edit_note";
  hasTitlename: boolean = true;

  get dec(): AttributeDec {
    throw new Error("Method not implemented.");
  }

  protected requiredFields(): TemplateResult<1> {
    return html`
      <div
        class=${classMap({
          "body-section": true,
          minimize: this.minimize,
        })}
      >
        <div>Properties:</div>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Data type"
        ></ndx-input>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Axes shape"
        ></ndx-input>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Axes labels"
        ></ndx-input>
      </div>
    `;
  }
}
