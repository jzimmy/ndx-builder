import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import {
  AnonymousDatasetDec,
  AttributeDec,
  DatasetDec,
  GroupDec,
  LinkDec,
} from "../nwb/spec";
import { symbols } from "../styles";
import { Trigger } from "../logic/hofs";
import { assertNever } from "../utils";
import { Initializers } from "../nwb/spec-defaults";
import { NdxInputElem } from "../inputs/abstract-input";
import {
  AnonDatasetDecElem,
  AnonGroupDecElem,
  AttribDecElem,
  IncDatasetDecElem,
  IncGroupDecElem,
  LinkDecElem,
} from "./dec-viz-elems";
import { HasDatasetIncType, HasGroupIncType } from "..";
import { removeElem, insertAtIndex } from "../utils";
import { Inherited } from "./abstract-viz-elem";

@customElement("subtree-branch")
export class SubtreeBranch extends LitElement {
  @property({ type: Boolean })
  lastBranch = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

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
      <slot name="elem"></slot>
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

      ::slotted(light-button) {
        margin-top: calc(var(--upper-break) - 1.1em);
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

interface HasGroupSubtree {
  attributes: AttributeDec[];
  datasets: DatasetDec[];
  groups: GroupDec[];
  links: LinkDec[];
}

interface HasDatasetSubtree {
  attributes: AttributeDec[];
}

type GroupDecElem = ["INC", IncGroupDecElem] | ["ANONYMOUS", AnonGroupDecElem];
type DatasetDecElem =
  | ["INC", IncDatasetDecElem]
  | ["ANONYMOUS", AnonDatasetDecElem];

function setElemsSlot(elem: HTMLElement) {
  elem.slot = "elem";
}

// only use these functions to create subtree elems!!!
function createGroupDecSubtreeElem(g: GroupDec, tree: GroupSubtree) {
  let dec: GroupDecElem;
  switch (g[0]) {
    case "INC":
      dec = [
        g[0],
        document.createElement("group-incdec-elem") as IncGroupDecElem,
      ];
      dec[1].fill(g[1]);
      break;
    case "ANONYMOUS":
      dec = [
        g[0],
        document.createElement("group-anondec-elem") as AnonGroupDecElem,
      ];
      dec[1].fill(g[1]);
      dec[1].triggerAttribDecBuilderForm = tree.triggerAttribDecBuilderForm;
      dec[1].triggerDatasetDecBuilderForm = tree.triggerDatasetDecBuilderForm;
      dec[1].triggerGroupDecBuilderForm = tree.triggerGroupDecBuilderForm;
      dec[1].triggerLinkDecBuilderForm = tree.triggerLinkDecBuilderForm;
      break;
    default:
      assertNever(g[0]);
  }
  setElemsSlot(dec[1]);
  return dec;
}

function createDatasetDecSubtreeElem(
  d: DatasetDec,
  tree: GroupSubtree | DatasetSubtree
) {
  let dec: DatasetDecElem;
  switch (d[0]) {
    case "INC":
      dec = [
        "INC",
        document.createElement("dataset-incdec-elem") as IncDatasetDecElem,
      ];
      dec[1].fill(d[1]);
      break;
    case "ANONYMOUS":
      dec = [
        "ANONYMOUS",
        document.createElement("dataset-anondec-elem") as AnonDatasetDecElem,
      ];
      dec[1].fill(d[1]);
      dec[1].triggerAttribDecBuilderForm = tree.triggerAttribDecBuilderForm;
      break;
    default:
      assertNever(d[0]);
  }
  setElemsSlot(dec[1]);
  return dec;
}

function createAttribDecSubtreeElem(a: AttributeDec) {
  let dec = document.createElement("attrib-dec-elem") as AttribDecElem;
  dec.fill(a);
  setElemsSlot(dec);
  return dec;
}

function createLinkDecSubtreeElem(l: LinkDec) {
  let dec = document.createElement("link-dec-elem") as LinkDecElem;
  dec.fill(l);
  setElemsSlot(dec);
  return dec;
}

function addGroupDec(g: GroupDec, tree: GroupSubtree, index = -1) {
  const groupDecElem = createGroupDecSubtreeElem(g, tree);
  groupDecElem[1].onDelete = () =>
    (tree.groups = removeElem(tree.groups, groupDecElem));
  groupDecElem[1].onEdit = () => {
    tree.triggerGroupDecBuilderForm(
      [groupDecElem[0], groupDecElem[1].value()] as GroupDec,
      () => {},
      (v) => {
        let i = tree.groups.indexOf(groupDecElem);
        tree.groups = removeElem(tree.groups, groupDecElem);
        addGroupDec(v, tree, i);
      }
    );
  };
  tree.groups = insertAtIndex(groupDecElem, tree.groups, index);
  return groupDecElem;
}

function addDatasetDec(d: DatasetDec, tree: GroupSubtree, index = -1) {
  const datasetDecElem = createDatasetDecSubtreeElem(d, tree);
  datasetDecElem[1].onDelete = () =>
    (tree.datasets = removeElem(tree.datasets, datasetDecElem));
  datasetDecElem[1].onEdit = () => {
    tree.triggerDatasetDecBuilderForm(
      [datasetDecElem[0], datasetDecElem[1].value()] as DatasetDec,
      () => {},
      (v) => {
        let i = tree.datasets.indexOf(datasetDecElem);
        tree.datasets = removeElem(tree.datasets, datasetDecElem);
        addDatasetDec(v, tree, i);
      }
    );
  };
  tree.datasets = insertAtIndex(datasetDecElem, tree.datasets, index);
  return datasetDecElem;
}

function addAttributeDec(a: AttributeDec, tree: GroupSubtree | DatasetSubtree) {
  const attribDecElem = createAttribDecSubtreeElem(a);
  attribDecElem.onDelete = () =>
    (tree.attribs = removeElem(tree.attribs, attribDecElem));
  attribDecElem.onEdit = () =>
    tree.triggerAttribDecBuilderForm(
      attribDecElem.value(),
      () => {},
      (v) => {
        attribDecElem.fill(v);
        tree.requestUpdate();
      }
    );
  tree.attribs = insertAtIndex(attribDecElem, tree.attribs, -1);
  console.log(tree.attribs);
  return attribDecElem;
}

function addLinkDec(l: LinkDec, tree: GroupSubtree) {
  const linkDecElem = createLinkDecSubtreeElem(l);
  linkDecElem.onDelete = () =>
    (tree.links = removeElem(tree.links, linkDecElem));
  linkDecElem.onEdit = () =>
    tree.triggerLinkDecBuilderForm(
      linkDecElem.value(),
      () => {},
      (v) => {
        linkDecElem.fill(v);
        tree.requestUpdate();
      }
    );
  tree.links = insertAtIndex(linkDecElem, tree.links, -1);
  return linkDecElem;
}

// This shouldn't allow any edits, but if it has children,
// then render the children completely and allow edits on them
function addInheritedGroupDec(g: GroupDec, tree: GroupSubtree, index = -1) {
  let groupDecElem = createGroupDecSubtreeElem(g, tree);
  groupDecElem[1].typeElem.hideDeleteBtn = true;
  groupDecElem[1].typeElem.hideEditBtn = true;
  tree.inheritedGroups = insertAtIndex(
    visible(groupDecElem),
    tree.inheritedGroups,
    index
  );
}

// This should allow limited edits
function addInheritedDatasetDec(d: DatasetDec, tree: GroupSubtree, index = -1) {
  let inhDatasetDec = visible(createDatasetDecSubtreeElem(d, tree));
  inhDatasetDec.elem[1].typeElem.hideDeleteBtn = true;
  if (d[0] == "INC") inhDatasetDec.elem[1].typeElem.hideEditBtn = true;
  else if (d[0] == "ANONYMOUS") {
    let init: Inherited<AnonymousDatasetDec> = {
      inh: d[1],
      mine: d[1],
    };

    // this is hard, dense and ugly, but genuinely complex as well

    // This function adds an edited inherited elem to the main datasets list
    // with some caveats.
    //
    // it hides the inherited version
    // onDelete it makes the inherited visible
    // onEdit it deletes this version and calls the function recursively to apply other rules
    const addEditedInheritedElem = ({ mine }: typeof init) => {
      let noLongerInhElem = addDatasetDec(["ANONYMOUS", mine], tree);
      inhDatasetDec.visible = false;
      noLongerInhElem[1].onDelete = () => {
        tree.datasets = removeElem(tree.datasets, noLongerInhElem);
        inhDatasetDec.visible = true;
      };
      noLongerInhElem[1].onEdit = () =>
        tree.triggerInheritedDatasetDecEditForm(
          { inh: d[1], mine: mine },
          () => {},
          (v) => {
            tree.datasets = removeElem(tree.datasets, noLongerInhElem);
            addEditedInheritedElem(v);
          }
        );
    };

    inhDatasetDec.elem[1].typeElem.onEdit = () => {
      init.mine = anonDatasetDecDeepCopy(init.mine);
      tree.triggerInheritedDatasetDecEditForm(
        init,
        () => {},
        ({ mine }) => {
          let noLongerInhElem = addDatasetDec(["ANONYMOUS", mine], tree);
          let inhIndex = tree.inheritedDatasets.indexOf(inhDatasetDec);
          inhDatasetDec.visible = false;
          noLongerInhElem[1].onDelete = () => {
            tree.datasets = removeElem(tree.datasets, noLongerInhElem);
            addInheritedDatasetDec(d, tree, inhIndex);
          };
          noLongerInhElem[1].onEdit = () =>
            tree.triggerInheritedDatasetDecEditForm(
              { inh: d[1], mine },
              () => {},
              addEditedInheritedElem
            );
        }
      );
    };
  } else assertNever(d[0]);

  tree.inheritedDatasets = insertAtIndex(
    inhDatasetDec,
    tree.inheritedDatasets,
    index
  );
}

// This should allow limited edits
// see above for explanation, basically the same code
function addInheritedAttributeDec(
  a: AttributeDec,
  tree: GroupSubtree | DatasetSubtree
) {
  let inhAttribDec = visible(createAttribDecSubtreeElem(a));
  inhAttribDec.elem.typeElem.hideDeleteBtn = true;
  let init: Inherited<AttributeDec> = { inh: a, mine: a };
  const addEditedInheritedElem = ({ mine }: typeof init) => {
    let noLongerInhElem = addAttributeDec(mine, tree);
    inhAttribDec.visible = false;
    noLongerInhElem.onDelete = () => {
      tree.attribs = removeElem(tree.attribs, noLongerInhElem);
      inhAttribDec.visible = true;
    };
    noLongerInhElem.onEdit = () =>
      tree.triggerInheritedAttribDecEditForm(
        { inh: a, mine },
        () => {},
        (v) => {
          tree.attribs = removeElem(tree.attribs, noLongerInhElem);
          addEditedInheritedElem(v);
        }
      );
  };
  inhAttribDec.elem.onEdit = () => {};
  tree.inheritedAttribs = insertAtIndex(
    inhAttribDec,
    tree.inheritedAttribs,
    -1
  );
}

// This should allow no edits
function addInheritedLinkDec(l: LinkDec, tree: GroupSubtree) {
  let linkDecElem = createLinkDecSubtreeElem(l);
  linkDecElem.typeElem.hideDeleteBtn = true;
  linkDecElem.typeElem.hideEditBtn = true;
  tree.inheritedLinks = insertAtIndex(
    visible(linkDecElem),
    tree.inheritedLinks,
    -1
  );
}

function anonDatasetDecDeepCopy(d: AnonymousDatasetDec): AnonymousDatasetDec {
  return {
    ...d,
    attributes: d.attributes.map((a) => ({ ...a })),
  };
}

function visible<T>(elem: T) {
  return {
    elem,
    visible: true,
  };
}

type Hideable<T> = {
  elem: T;
  visible: boolean;
};

@customElement("group-subtree")
export class GroupSubtree extends NdxInputElem<HasGroupSubtree> {
  firstFocusableElem?: HTMLElement | undefined;

  fill(val: HasGroupSubtree | (HasGroupSubtree & HasGroupIncType)): void {
    console.log(val);
    // don't overwrite me if you are empty
    if (
      val.attributes.length != 0 ||
      val.links.length != 0 ||
      val.datasets.length != 0 ||
      val.groups.length != 0
    ) {
      this.groups = [];
      this.links = [];
      this.datasets = [];
      this.groups = [];
      for (let a of val.attributes) addAttributeDec(a, this);
      for (let l of val.links) addLinkDec(l, this);
      for (let d of val.datasets) addDatasetDec(d, this);
      for (let g of val.groups) addGroupDec(g, this);
    }

    this.clearInherited();
    if ("neurodataTypeInc" in val && val.neurodataTypeInc[0] == "Typedef") {
      let incty = val.neurodataTypeInc[1];
      for (let a of incty.attributes) addInheritedAttributeDec(a, this);
      for (let l of incty.links) addInheritedLinkDec(l, this);
      for (let d of incty.datasets) addInheritedDatasetDec(d, this);
      for (let g of incty.groups) addInheritedGroupDec(g, this);
    }

    this.requestUpdate();
  }

  value(): HasGroupSubtree {
    return {
      attributes: this.attribs.map((a) => a.value()),
      datasets: this.datasets.map((d) => [d[0], d[1].value()] as DatasetDec),
      groups: this.groups.map((g) => [g[0], g[1].value()] as GroupDec),
      links: this.links.map((l) => l.value()),
    };
  }

  clear(): void {
    this.groups = [];
    this.links = [];
    this.datasets = [];
    this.groups = [];
    this.clearInherited();
  }

  clearInherited() {
    this.inheritedAttribs = [];
    this.inheritedLinks = [];
    this.inheritedDatasets = [];
    this.inheritedGroups = [];
  }

  @property({ type: Boolean })
  disabled = true;

  // Important! Don't add to these directly, use add<Some>Dec()
  // It could mess up equality checks
  attribs: AttribDecElem[] = [];
  links: LinkDecElem[] = [];
  datasets: DatasetDecElem[] = [];
  groups: GroupDecElem[] = [];

  // Don't add either to these, use addInherited<Some>Dec()
  inheritedAttribs: Hideable<AttribDecElem>[] = [];
  inheritedLinks: Hideable<LinkDecElem>[] = [];
  inheritedDatasets: Hideable<DatasetDecElem>[] = [];
  inheritedGroups: Hideable<GroupDecElem>[] = [];

  @property({ type: Function })
  triggerAttribDecBuilderForm: Trigger<AttributeDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerDatasetDecBuilderForm: Trigger<DatasetDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerGroupDecBuilderForm: Trigger<GroupDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerLinkDecBuilderForm: Trigger<LinkDec> = (_v, _a, _c) => {};

  @property({ type: Function })
  triggerInheritedDatasetDecEditForm: Trigger<Inherited<AnonymousDatasetDec>> =
    () => {};
  @property({ type: Function })
  triggerInheritedAttribDecEditForm: Trigger<Inherited<AttributeDec>> =
    () => {};

  @property()
  minimized = false;
  typedef = false;

  render() {
    console.log("groups", this.groups);
    console.log("datasets", this.datasets);
    console.log("attribs", this.attribs);
    console.log("links", this.links);
    return html`
      ${map(
        this.groups,
        (g) => html`<subtree-branch slot="subtree"> ${g} </subtree-branch>`
      )}
      ${map(
        this.datasets,
        (d) => html`<subtree-branch slot="subtree"> ${d} </subtree-branch>`
      )}
      ${map(
        this.attribs,
        (a) => html`<subtree-branch slot="subtree"> ${a} </subtree-branch>`
      )}
      ${map(
        this.links,
        (l) => html`<subtree-branch slot="subtree"> ${l} </subtree-branch>`
      )}
      ${when(
        !this.minimized,
        () => html`
          ${map(this.inheritedGroups, ({ elem, visible }) =>
            visible
              ? html`
                  <subtree-branch slot="subtree">
                    <div class="keyword" slot="icon">inherits</div>
                    ${elem}
                  </subtree-branch>
                `
              : html``
          )}
          ${map(this.inheritedDatasets, ({ elem, visible }) =>
            visible
              ? html`
                  <subtree-branch slot="subtree">
                    <div class="keyword" slot="icon">inherits</div>
                    ${elem}
                  </subtree-branch>
                `
              : html``
          )}
          ${map(this.inheritedAttribs, ({ elem, visible }) =>
            visible
              ? html`
                  <subtree-branch slot="subtree">
                    <div class="keyword" slot="icon">inherits</div>
                    ${elem}
                  </subtree-branch>
                `
              : html``
          )}
          ${map(this.inheritedLinks, ({ visible, elem }) =>
            visible
              ? html`
                  <subtree-branch slot="subtree">
                    <div class="keyword" slot="icon">inherits</div>
                    ${elem}
                  </subtree-branch>
                `
              : html``
          )}
          <subtree-branch slot="subtree">
            <span slot="icon" class="material-symbols-outlined">folder</span>
            <light-button
              slot="elem"
              ?disabled=${this.disabled}
              @click=${() =>
                this.triggerGroupDecBuilderForm(
                  Initializers.groupDec,
                  () => {},
                  (g) => {
                    addGroupDec(g, this);
                    this.requestUpdate();
                  }
                )}
            >
              <span class="material-symbols-outlined" style="font-size:1.3em"
                >add</span
              >
            </light-button>
          </subtree-branch>
          <subtree-branch slot="subtree">
            <span slot="icon" class="material-symbols-outlined">dataset</span>
            <light-button
              slot="elem"
              ?disabled=${this.disabled}
              @click=${() =>
                this.triggerDatasetDecBuilderForm(
                  Initializers.datasetDec,
                  () => {},
                  (d) => {
                    addDatasetDec(d, this);
                    this.requestUpdate();
                  }
                )}
            >
              <span class="material-symbols-outlined" style="font-size:1.3em"
                >add</span
              >
            </light-button>
          </subtree-branch>
          <subtree-branch slot="subtree">
            <span slot="icon" class="material-symbols-outlined">edit_note</span>
            <light-button
              slot="elem"
              ?disabled=${this.disabled}
              @click=${() =>
                this.triggerAttribDecBuilderForm(
                  Initializers.attributeDec,
                  () => {},
                  (a) => {
                    addAttributeDec(a, this);
                    this.requestUpdate();
                  }
                )}
            >
              <span class="material-symbols-outlined" style="font-size:1.3em"
                >add</span
              >
            </light-button>
          </subtree-branch>
          <subtree-branch slot="subtree" .lastBranch=${true}>
            <span slot="icon" class="material-symbols-outlined">link</span>
            <light-button
              slot="elem"
              ?disabled=${this.disabled}
              @click=${() =>
                this.triggerLinkDecBuilderForm(
                  Initializers.linkDec,
                  () => {},
                  (l) => {
                    addLinkDec(l, this);
                    this.requestUpdate();
                  }
                )}
            >
              <span class="material-symbols-outlined" style="font-size:1.3em"
                >add</span
              >
            </light-button>
          </subtree-branch>
        `,
        () =>
          html`<hidden-subtree
            slot="subtree"
            .lastBranch=${true}
          ></hidden-subtree>`
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
export class DatasetSubtree extends NdxInputElem<HasDatasetSubtree> {
  firstFocusableElem?: HTMLElement | undefined;
  fill(val: HasDatasetSubtree | (HasDatasetSubtree & HasDatasetIncType)): void {
    if (val.attributes.length != 0) {
      this.clear();
      for (let a of val.attributes) addAttributeDec(a, this);
    }

    this.clearInherited();

    if ("neurodataTypeInc" in val && val.neurodataTypeInc[0] == "Typedef") {
      let incty = val.neurodataTypeInc[1];
      for (let a of incty.attributes) addInheritedAttributeDec(a, this);
    }

    this.requestUpdate();
  }

  value(): HasDatasetSubtree {
    const attribs = this.attribs.map((a) => a.value());
    return { attributes: attribs };
  }

  clear(): void {
    this.attribs = [];
    this.clearInherited();
  }

  clearInherited(): void {
    this.inheritedAttribs = [];
  }

  @property({ type: Boolean })
  disabled = false;

  // Important! Don't add to these directly, use the add functions.
  // It could mess up equality checks
  attribs: AttribDecElem[] = [];
  inheritedAttribs: Hideable<AttribDecElem>[] = [];

  @property({ type: Boolean })
  minimized = false;

  @property({ type: Function })
  triggerAttribDecBuilderForm: Trigger<AttributeDec> = (_v, _a, _c) => {};

  @property({ type: Function })
  triggerInheritedAttribDecEditForm: Trigger<Inherited<AttributeDec>> =
    () => {};

  render() {
    return html` ${map(
      this.attribs,
      (a) =>
        html`
          <subtree-branch slot="subtree" ?disabled=${this.disabled}>
            ${a}
          </subtree-branch>
        `
    )}
    ${when(
      !this.minimized,
      () => html`
        ${map(this.inheritedAttribs, ({ elem, visible }) =>
          visible
            ? html`
                <subtree-branch slot="subtree" ?disabled=${this.disabled}>
                  <div class="keyword" slot="icon">inherits</div>
                  ${elem}
                </subtree-branch>
              `
            : html``
        )}
        <subtree-branch slot="subtree" .lastBranch=${true}>
          <span slot="icon" class="material-symbols-outlined">edit_note</span>
          <light-button
            slot="elem"
            ?disabled=${this.disabled}
            @click=${() =>
              this.triggerAttribDecBuilderForm(
                Initializers.attributeDec,
                () => {},
                (a) => {
                  addAttributeDec(a, this);
                  this.requestUpdate();
                }
              )}
          >
            <span class="material-symbols-outlined" style="font-size:1.3em"
              >add</span
            >
          </light-button>
        </subtree-branch>
      `,
      () =>
        html`
          <hidden-subtree slot="subtree" .lastBranch=${true}></hidden-subtree>
        `
    )}`;
  }

  static styles = [symbols, css``];
}
