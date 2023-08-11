/***
 * All the logic for the app is in here, this is where the forms are glued together
 */
import { LitElement } from "lit";
import { AttribInfoForm, AttribValueForm } from "./attrib";
import { CodegenForm } from "./codegen";
import { FormChain } from "./hofs";
import {
  GenericInctypeForm,
  GroupInctypeForm,
  TargetIncTypeForm,
} from "./inctype";
import {
  NamespaceStartForm,
  NamespaceTypesForm,
  NamespaceMetadataForm,
} from "./namespace";
import {
  AttributeDec,
  GroupTypeDef,
  DatasetTypeDef,
  TypeDef,
  Namespace,
  LinkDec,
  GroupDec,
} from "./nwb/spec";
import { AxesForm, TypenameForm, DatasetDefVizForm } from "./defs";
import { AttributeAndShape } from "./parent";
import { Initializers } from "./nwb/spec-defaults";
import { GroupTypeVizForm } from "./typeviz-form";

const namespaceBuilderSteps = [
  "Add custom types",
  "Define extension namespace",
  "Export extension generator script",
];

const typeDefSteps = [
  "Pick a base type",
  "Define type properties",
  "Add subcomponents",
];

const attributeBuilderSteps = ["Name attribute", "Define axes"];

const datasetTypeDefBuilderSteps = [
  ...typeDefSteps.slice(0, 1),
  "Name dataset type",
  "Define axes",
  ...typeDefSteps.slice(2),
];

const groupTypeDefBuilderSteps = [
  ...typeDefSteps.slice(0, 1),
  "Name group type",
  ...typeDefSteps.slice(2),
];

export function buildFormChains(parent: LitElement) {
  let linkBuilderTrigger = new FormChain<LinkDec>(new TargetIncTypeForm());

  let groupDecBuilderTrigger = new FormChain(
    new GroupInctypeForm()
  ).convert<GroupDec>(
    (v) => {
      return v.neurodataTypeInc[0] == "None"
        ? ["ANONYMOUS", { ...Initializers.anonymousGroupDec }]
        : [
            "INC",
            {
              ...Initializers.incGroupDec,
              neurodataTypeInc: v.neurodataTypeInc,
            },
          ];
    },
    (v) => {
      return v[0] == "ANONYMOUS"
        ? { ...v[1], neurodataTypeInc: ["None", null] }
        : { ...v[1] };
    }
  );

  let attributeBuilderTrigger = new FormChain<AttributeDec>(
    new AttribInfoForm(),
    attributeBuilderSteps,
    0
  )
    .branch(
      (v: AttributeDec) => v.data[0] === "SHAPE",
      new FormChain<AttributeAndShape>(
        new AxesForm(),
        attributeBuilderSteps,
        1
      ).convert<AttributeDec>(
        (v: AttributeAndShape) => {
          return { ...v.att, data: ["SHAPE", v.shape], dtype: v.dtype };
        },
        (v: AttributeDec) => {
          return {
            att: v,
            shape: v.data[0] === "SHAPE" ? v.data[1] : [],
            dtype: v.dtype,
          };
        }
      ),
      new FormChain<AttributeDec>(
        new AttribValueForm(),
        attributeBuilderSteps,
        1
      )
    )
    .withParent(parent);

  let groupBuilderFormChain = new FormChain<GroupTypeDef>(
    new TypenameForm(),
    groupTypeDefBuilderSteps,
    1
  ).then(
    new GroupTypeVizForm(attributeBuilderTrigger),
    groupTypeDefBuilderSteps,
    3
  );

  let datasetBuilderFormChain = new FormChain<DatasetTypeDef>(
    new TypenameForm(),
    datasetTypeDefBuilderSteps,
    1
  )
    .then(new AxesForm(), datasetTypeDefBuilderSteps, 2)
    .then(
      new DatasetDefVizForm(attributeBuilderTrigger),
      datasetTypeDefBuilderSteps,
      3
    );

  let typedefBuilderTrigger = new FormChain<TypeDef>()
    .then(new GenericInctypeForm(), typeDefSteps, 0)
    .branch(
      ([k, _]) => k === "GROUP",
      // branch guarantees safety, so `as` cast is okay here
      groupBuilderFormChain.convert(
        (v) => ["GROUP", v] as TypeDef,
        ([_, g]) => g as GroupTypeDef
      ),
      datasetBuilderFormChain.convert(
        (v) => ["DATASET", v] as TypeDef,
        ([_, d]) => d as DatasetTypeDef
      )
    )
    .withParent(parent);

  let namespaceBuilderForm = new FormChain<Namespace>(new NamespaceStartForm())
    .then(
      new NamespaceTypesForm(typedefBuilderTrigger),
      namespaceBuilderSteps,
      0
    )
    .then(new NamespaceMetadataForm(), namespaceBuilderSteps, 1)
    .then(new CodegenForm(), namespaceBuilderSteps, 2)
    .withParent(parent);

  return namespaceBuilderForm;
}
