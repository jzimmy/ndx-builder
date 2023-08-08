import { LitElement } from "lit";
import { AttribInfoFormpageElem, AttribValueFormpageElem } from "./attrib";
import { CodegenFormpageElem } from "./codegen";
import { FormChain } from "./hofs";
import {
  GenericInctypeFormpageElem,
  GroupInctypeFormpageElem,
  TargetIncTypeFormpageElem,
} from "./inctype";
import {
  NamespaceStartFormpageElem,
  NamespaceTypesFormpageElem,
  NamespaceMetadataFormpageElem,
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
import {
  AxesFormpageElem,
  TypenameFormpageElem,
  GroupDefVizFormpageElem,
  DatasetDefVizFormpageElem,
} from "./typedef";
import { AttributeAndShape } from "./parent";
import { Initializers } from "./nwb/spec-defaults";

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
  let linkBuilderFormTrigger = new FormChain<LinkDec>(
    new TargetIncTypeFormpageElem()
  );

  let groupDecBuilderFormTrigger = new FormChain(
    new GroupInctypeFormpageElem()
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

  let attributeBuilderFormTrigger = new FormChain<AttributeDec>(
    new AttribInfoFormpageElem(),
    attributeBuilderSteps,
    0
  )
    .branch(
      (v: AttributeDec) => v.data[0] === "SHAPE",
      new FormChain<AttributeAndShape>(
        new AxesFormpageElem(),
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
        new AttribValueFormpageElem(),
        attributeBuilderSteps,
        1
      )
    )
    .withParent(parent);

  let groupBuilderFormChain = new FormChain<GroupTypeDef>(
    new TypenameFormpageElem(),
    groupTypeDefBuilderSteps,
    1
  ).then(
    new GroupDefVizFormpageElem(attributeBuilderFormTrigger),
    groupTypeDefBuilderSteps,
    3
  );

  let datasetBuilderFormChain = new FormChain<DatasetTypeDef>(
    new TypenameFormpageElem(),
    datasetTypeDefBuilderSteps,
    1
  )
    .then(new AxesFormpageElem(), datasetTypeDefBuilderSteps, 2)
    .then(
      new DatasetDefVizFormpageElem(attributeBuilderFormTrigger),
      datasetTypeDefBuilderSteps,
      3
    );

  let typedefBuilderFormTrigger = new FormChain<TypeDef>(
    new GenericInctypeFormpageElem(),
    typeDefSteps,
    0
  )
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

  let namespaceBuilderForm = new FormChain<Namespace>(
    new NamespaceStartFormpageElem()
  )
    .then(
      new NamespaceTypesFormpageElem(typedefBuilderFormTrigger),
      namespaceBuilderSteps,
      0
    )
    .then(new NamespaceMetadataFormpageElem(), namespaceBuilderSteps, 1)
    .then(new CodegenFormpageElem(), namespaceBuilderSteps, 2)
    .withParent(parent);

  return namespaceBuilderForm;
}
