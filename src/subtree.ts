import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { AttributeDec, DatasetDec, GroupDec, LinkDec } from "./nwb/spec";
import { symbols } from "./styles";

@customElement("subtree-branchh")
export class SubtreeBranchh extends LitElement {
  @property({ type: Boolean })
  lastBranch = false;

  @property()
  elems: HTMLElement[] = [];

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Function })
  addElem = () => {};

  render() {
    return html`
      <div class="branchline">
        <div class="elbow">
          <span class="icon">
            <slot name="icon"></slot>
          </span>
        </div>
        ${when(!this.lastBranch, () => html`<div class="vert"></div>`)}
      </div>
      <slot name="elems"></slot>
      <div class="branchelement">
        <light-button ?disabled=${this.disabled} @click=${this.addElem}>
          <span class="material-symbols-outlined" style="font-size:1.3em"
            >add</span
          >
        </light-button>
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: row;
        --upper-break: 5em;
        padding-left: 4em;
      }

      :host([disabled]) {
        opacity: 0.4;
      }

      :host .branchline > div {
        border-color: var(--color-border-alt);
      }

      :host > div {
        display: flex;
        flex-direction: column;
      }

      :host > * {
        margin-right: 0.5em;
      }

      .branchline {
        display: flex;
        flex-direction: column;
      }

      .branchline > .elbow {
        min-height: var(--upper-break);
        width: 4em;
        border-bottom: 2px solid var(--color-border);
        border-left: 2px solid var(--color-border);
        display: flex;
      }

      .branchline > .vert {
        height: 100%;
        border-left: 2px solid var(--color-border);
      }

      .branchelement > .horizontal {
        padding-top: 1em;
        width: 2em;
        border-bottom: 2px solid var(--color-border);
      }

      .branchelement {
        margin-top: calc(var(--upper-break) - 1em);
      }

      /* add button */
      .branchelement:last-child {
        margin-top: calc(var(--upper-break) - 0.8em);
        margin-bottom: auto;
        cursor: pointer;
        opacity: 0.8;
      }

      .branchelement:last-child > light-button {
        padding: 0.1em 0.3em;
      }

      :host([disabled]) .branchelement:last-child > light-button {
        background: var(--background-color-alt);
      }

      /* TODO: figure this out???? */
      .typedec {
        height: 200px;
        background: red;
      }

      .icon {
        margin-top: auto;
        margin-left: auto;
        margin-right: 0.5em;
        margin-bottom: 0.3em;
        cursor: default;
      }

      ::slotted([slot="elems"]) {
        margin-top: 1em;
        padding-right: 0.5em;
      }

      ::slotted(div[slot="elems"]) {
        background: var(--color-border-alt);
        margin-top: var(--upper-break);
        height: 2px;
        width: 2ch;
      }
    `,
  ];
}

@customElement("hidden-subtree")
export class HiddenSubtree extends LitElement {
  render() {
    return html`
      <div></div>
      <span class="material-symbols-outlined">more_vert</span>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        padding-left: 3.3em;
        display: block;
      }

      :host > div {
        height: 1em;
        margin-left: 0.7em;
        border-left: 2px solid var(--color-border-alt);
      }

      span.material-symbols-outlined {
        color: var(--color-border-alt);
      }
    `,
  ];
}

@customElement("group-subtree")
export class GroupSubtree extends LitElement {
  @property({ type: Boolean })
  disabled = true;

  @property({ type: Function })
  triggerAttribDecBuilderForm = () => {};
  @property({ type: Function })
  triggerDatasetDecBuilderForm = () => {};
  @property({ type: Function })
  triggerGroupDecBuilderForm = () => {};
  @property({ type: Function })
  triggerLinkDecBuilderForm = () => {};

  @property()
  attribs: AttributeDec[] = [];
  @property()
  datasets: DatasetDec[] = [];
  @property()
  groups: GroupDec[] = [];
  @property()
  links: LinkDec[] = [];

  @property({ type: Function })
  triggerEditLinkDecForm = (_: LinkDec, __: number) => {};
  @property({ type: Function })
  triggerEditAttribDecForm = (_: AttributeDec, __: number) => {};
  @property({ type: Function })
  triggerEditGroupDecForm = (_: GroupDec, __: number) => {};
  @property({ type: Function })
  triggerEditDatasetDecForm = (_: DatasetDec, __: number) => {};

  @property({ type: Function })
  removeAttribDec(_: number): void {
    throw new Error("Remove Attrib Method not implemented.");
  }
  @property({ type: Function })
  removeDatasetDec(_: number): void {
    throw new Error("Remove Dataset Method not implemented.");
  }
  @property({ type: Function })
  removeGroupDec(_: number) {
    throw new Error("Remove Group Method not implemented.");
  }
  @property({ type: Function })
  removeLinkDec(_: number): void {
    throw new Error("Remove Link Method not implemented.");
  }

  @property()
  minimized = false;

  render() {
    const allBranchesFilled =
      (this.attribs.length > 0 &&
        this.groups.length > 0 &&
        this.datasets.length > 0 &&
        this.links.length > 0) ||
      !this.minimized;
    return html`
      ${when(
        this.groups.length > 0 || !this.minimized,
        () => html` <subtree-branchh
          ?disabled=${this.disabled}
          slot="subtree"
          id="groups"
          .addElem=${() => this.triggerGroupDecBuilderForm()}
        >
          <span slot="icon" class="material-symbols-outlined">folder</span>
          ${map(
            this.groups,
            (grp, i) => html` ${choose(grp[0], [
                [
                  "INC",
                  () => html`
                    <group-incdec-elem
                      .slot=${"elems"}
                      .onClose=${() => this.removeGroupDec(i)}
                      .data=${grp[1]}
                      .onEdit=${() => this.triggerEditGroupDecForm(grp, i)}
                    ></group-incdec-elem>
                  `,
                ],
                [
                  "ANONYMOUS",
                  () => html`
                    <group-anondec-elem
                      .slot=${"elems"}
                      .onClose=${() => this.removeGroupDec(i)}
                      .data=${grp[1]}
                      .onEdit=${() => this.triggerEditGroupDecForm(grp, i)}
                    ></group-anondec-elem>
                  `,
                ],
              ])}
              <div slot="elems"></div>`
          )}
        </subtree-branchh>`
      )}
      ${when(
        this.datasets.length > 0 || !this.minimized,
        () => html` <subtree-branchh
          ?disabled=${this.disabled}
          slot="subtree"
          id="datasets"
          .addElem=${() => this.triggerDatasetDecBuilderForm()}
        >
          <span slot="icon" class="material-symbols-outlined">dataset</span>
          ${map(
            this.datasets,
            (dset, i) =>
              html` ${choose(dset[0], [
                  [
                    "Inc",
                    () => html`
                      <dataset-incdec-elem
                        .slot=${"elems"}
                        .onClose=${() => this.removeDatasetDec(i)}
                        .data=${dset[1]}
                        .onEdit=${() => this.triggerEditDatasetDecForm(dset, i)}
                      ></dataset-incdec-elem>
                    `,
                  ],
                  [
                    "Anonymous",
                    () => html`
                      <dataset-anondec-elem
                        .slot=${"elems"}
                        .onClose=${() => this.removeDatasetDec(i)}
                        .data=${dset[1]}
                        .onEdit=${() => this.triggerEditDatasetDecForm(dset, i)}
                      ></dataset-anondec-elem>
                    `,
                  ],
                ])}
                <div slot="elems"></div>`
          )}
        </subtree-branchh>`
      )}
      ${when(
        this.datasets.length > 0 || !this.minimized,
        () => html` <subtree-branchh
          ?disabled=${this.disabled}
          slot="subtree"
          id="attributes"
          .addElem=${() => this.triggerAttribDecBuilderForm()}
        >
          <span slot="icon" class="material-symbols-outlined">edit_note</span>
          ${map(
            this.attribs,
            (attrib, i) =>
              html` <attrib-dec-elem
                  .data=${attrib}
                  slot="elems"
                  .onClose=${() => this.removeAttribDec(i)}
                  .onEdit=${() => this.triggerEditAttribDecForm(attrib, i)}
                ></attrib-dec-elem>
                <div slot="elems"></div>`
          )}
        </subtree-branchh>`
      )}
      ${when(
        this.links.length > 0 || !this.minimized,
        () => html`
          <subtree-branchh
            ?disabled=${this.disabled}
            slot="subtree"
            lastBranch=${allBranchesFilled}
            id="links"
            .addElem=${() => this.triggerLinkDecBuilderForm()}
          >
            <span slot="icon" class="material-symbols-outlined">link</span>
            ${map(
              this.links,
              (link, i) =>
                html`<link-dec-elem
                    .data=${link}
                    slot="elems"
                    .onClose=${() => this.removeLinkDec(i)}
                    .onEdit=${() => this.triggerEditLinkDecForm(link, i)}
                  ></link-dec-elem>
                  <div slot="elems"></div>`
            )}
          </subtree-branchh>
        `
      )}
      ${when(
        !allBranchesFilled,
        () => html`<hidden-subtree slot="subtree"></hidden-subtree>`
      )}
    `;
  }

  static styles = [
    symbols,
    css`
      span.material-symbols-outlined {
        font-size: 30px;
      }
    `,
  ];
}

@customElement("dataset-subtree")
export class DatasetSubtree extends LitElement {
  @property({ type: Boolean })
  disabled = false;

  @property()
  attribs: AttributeDec[] = [];

  @property({ type: Boolean })
  minimized = false;

  @property({ type: Function })
  triggerAttribDecBuilderForm = () => {};

  @property({ type: Function })
  triggerEditAttribDecForm = (_: AttributeDec, __: number) => {};

  @property({ type: Function })
  removeAttribDec(_: number): void {
    throw new Error("RemoveAttrib Method not implemented.");
  }

  render() {
    console.log(this.minimized);
    console.log(this.attribs.length);
    const allBranchesFilled = this.attribs.length > 0 || !this.minimized;
    return html` ${when(
      allBranchesFilled,
      () => html`
        <subtree-branchh
          ?disabled=${this.disabled}
          slot="subtree"
          id="attributes"
          .lastBranch=${allBranchesFilled}
          .addElem=${() => this.triggerAttribDecBuilderForm()}
        >
          <span slot="icon" class="material-symbols-outlined">edit_note</span>
          ${map(
            this.attribs,
            (attrib, i) =>
              html` <attrib-dec-elem
                  .data=${attrib}
                  slot="elems"
                  .onClose=${() => this.removeAttribDec(i)}
                  .onEdit=${() => this.triggerEditAttribDecForm(attrib, i)}
                ></attrib-dec-elem>
                <div slot="elems"></div>`
          )}
        </subtree-branchh>
      `,
      () => html` <hidden-subtree slot="subtree"></hidden-subtree> `
    )}`;
  }

  static styles = [symbols, css``];
}
