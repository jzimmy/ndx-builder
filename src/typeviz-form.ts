import { customElement, property, query, state } from "lit/decorators.js";
import { BasicFormPage } from "./basic-form";
import {
  AttributeDec,
  DatasetDec,
  DatasetTypeDef,
  GroupDec,
  GroupTypeDef,
  LinkDec,
} from "./nwb/spec";
import { TemplateResult, html } from "lit";
import { CPSForm, CPSFormController, ProgressState, Trigger } from "./hofs";
import { GroupTypeDefElem } from "./typeviz";
import { Initializers } from "./nwb/spec-defaults";
import "./typeviz";

function wrapTrigger<T>(
  prev: CPSFormController,
  trigger: Trigger<T>
): Trigger<T> {
  return (i, a, c) => {
    prev.showAndFocus(false);
    trigger(
      i,
      () => {
        prev.showAndFocus(true);
        a();
      },
      (v) => {
        prev.showAndFocus(true);
        c(v);
      }
    );
  };
}

abstract class TypevizForm<T> extends BasicFormPage<T> {
  get firstInput(): HTMLElement | undefined {
    return undefined;
  }
}

@customElement("group-typeviz-form")
export class GroupTypeVizForm extends TypevizForm<GroupTypeDef> {
  constructor(
    attributeBuilderForm: Trigger<AttributeDec>
    // datasetBuilderForm: Trigger<DatasetDec>,
    // groupBuilderForm: Trigger<GroupDec>,
    // linkBuilderForm: Trigger<LinkDec>
  ) {
    super();
    this.triggerAttribDecBuilderForm = wrapTrigger(this, attributeBuilderForm);
    // this.triggerDatasetDecBuilderForm = datasetBuilderForm;
    // this.triggerGroupDecBuilderForm = groupBuilderForm;
    // this.triggerLinkDecBuilderForm = linkBuilderForm;
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;
  //   triggerDatasetDecBuilderForm: Trigger<DatasetDec>;
  //   triggerGroupDecBuilderForm: Trigger<GroupDec>;
  //   triggerLinkDecBuilderForm: Trigger<LinkDec>;

  @state()
  groupDef: GroupTypeDef = { ...Initializers.groupTypeDef };

  formTitle: string = "";

  isValid(): boolean {
    return true;
  }

  body(): TemplateResult<1> {
    return html`
      <group-def-elem
        .data=${this.groupDef}
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
      ></group-def-elem>
    `;
  }

  fill(val: GroupTypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (
      this.groupDef.attributes.length == 0 &&
      this.groupDef.groups.length == 0 &&
      this.groupDef.links.length == 0 &&
      this.groupDef.datasets.length == 0
    ) {
      this.groupDef = {
        ...val,
        attributes: this.groupDef.attributes,
        groups: this.groupDef.groups,
        links: this.groupDef.links,
        datasets: this.groupDef.datasets,
      };
    } else {
      this.groupDef = val;
    }
  }

  transform(_: GroupTypeDef): GroupTypeDef {
    return { ...this.groupDef };
  }

  clear(): void {
    this.groupDef = { ...Initializers.groupTypeDef };
  }
}

export class DatasetTypevizForm extends TypevizForm<DatasetTypeDef> {
  formTitle: string = "";
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }
  body(): TemplateResult<1> {
    throw new Error("Method not implemented.");
  }

  fill(val: DatasetTypeDef, progress?: ProgressState | undefined): void {
    throw new Error("Method not implemented.");
  }

  transform(val: DatasetTypeDef): DatasetTypeDef {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}
