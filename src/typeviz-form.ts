import { customElement, query, state } from "lit/decorators.js";
import { NDXBuilderDefaultShowAndFocus } from "./basic-form";
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
import { Initializers } from "./nwb/spec-defaults";
import "./typeviz";
import { FormStepBar } from "./basic-elems";
import { DatasetTypeDefElem, GroupTypeDefElem } from "./typeviz";

function subform<T>(prev: CPSFormController, trigger: Trigger<T>): Trigger<T> {
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

abstract class TypeVizForm<T> extends CPSForm<T> {
  get firstInput(): HTMLElement | undefined {
    return undefined;
  }

  abstract body(): TemplateResult<1>;

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @query("step-bar")
  stepBar!: FormStepBar;

  drawProgressBar(progress?: ProgressState | undefined): void {
    this.stepBar.setProgressState(progress);
  }

  render() {
    return html`
      <back-or-quit-bar
        .back=${() => this.back()}
        .quit=${() => this.quit()}
        .next=${() => this.next()}
      >
        <step-bar></step-bar>
      </back-or-quit-bar>
      ${this.body()}
      <continue-bar .continue=${() => this.next()}></continue-bar>
    `;
  }
}

@customElement("group-typeviz-form")
export class GroupTypeVizForm extends TypeVizForm<GroupTypeDef> {
  constructor(
    attributeBuilderForm: Trigger<AttributeDec>,
    datasetBuilderForm: Trigger<DatasetDec>,
    groupBuilderForm: Trigger<GroupDec>,
    linkBuilderForm: Trigger<LinkDec>
  ) {
    super();
    this.triggerAttribDecBuilderForm = subform(this, attributeBuilderForm);
    this.triggerLinkDecBuilderForm = subform(this, linkBuilderForm);
    this.triggerDatasetDecBuilderForm = subform(this, datasetBuilderForm);
    this.triggerGroupDecBuilderForm = subform(this, groupBuilderForm);
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;
  triggerLinkDecBuilderForm: Trigger<LinkDec>;
  triggerDatasetDecBuilderForm: Trigger<DatasetDec>;
  triggerGroupDecBuilderForm: Trigger<GroupDec>;

  @state()
  groupDef: GroupTypeDef = { ...Initializers.groupTypeDef };

  @query("group-def-elem")
  groupDefElem!: GroupTypeDefElem;

  body(): TemplateResult<1> {
    return html`
      <group-def-elem
        .data=${this.groupDef}
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
        .triggerLinkDecBuilderForm=${this.triggerLinkDecBuilderForm}
        .triggerDatasetDecBuilderForm=${this.triggerDatasetDecBuilderForm}
        .triggerGroupDecBuilderForm=${this.triggerGroupDecBuilderForm}
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
      let internalData = this.groupDefElem.data;
      this.groupDef = {
        ...val,
        links: internalData.links,
        attributes: internalData.attributes,
        groups: internalData.groups,
        datasets: internalData.datasets,
      };
    } else {
      this.groupDef = val;
    }
  }

  transform(_: GroupTypeDef): GroupTypeDef {
    return { ...this.groupDefElem.data };
  }

  clear(): void {
    this.groupDef = { ...Initializers.groupTypeDef };
  }
}

@customElement("dataset-typeviz-form")
export class DatasetTypeVizForm extends TypeVizForm<DatasetTypeDef> {
  constructor(attributeBuilderForm: Trigger<AttributeDec>) {
    super();
    this.triggerAttribDecBuilderForm = subform(this, attributeBuilderForm);
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;

  @state()
  datasetDef: DatasetTypeDef = { ...Initializers.datasetTypeDef };

  @query("dataset-def-elem")
  datasetDefElem!: DatasetTypeDefElem;

  body(): TemplateResult<1> {
    return html`
      <dataset-def-elem
        .data=${this.datasetDef}
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
      ></dataset-def-elem>
    `;
  }

  fill(val: DatasetTypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (this.attributes.length == 0) {
      this.datasetDef = {
        ...val,
        attributes: this.datasetDefElem.data.attributes,
      };
    } else {
      this.datasetDef = val;
    }
    console.log(this.datasetDef);
  }

  transform(_val: DatasetTypeDef): DatasetTypeDef {
    return { ...this.datasetDefElem.data };
  }

  clear(): void {
    this.datasetDef = { ...Initializers.datasetTypeDef };
  }
}
