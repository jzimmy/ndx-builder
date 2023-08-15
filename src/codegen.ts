import { customElement, query, state } from "lit/decorators.js";
import {
  AnonymousDatasetDec,
  AnonymousGroupTypeDec,
  AttributeDec,
  DatasetDec,
  DatasetTypeDef,
  Dtype,
  GroupDec,
  GroupTypeDef,
  IncDatasetDec,
  IncGroupDec,
  LinkDec,
  Namespace,
  TypeDef,
} from "./nwb/spec";
import { CPSForm, assertNever } from "./hofs";
import { html } from "lit";
import { NDXBuilderDefaultShowAndFocus } from "./basic-form";
import { FormStepBar } from "./basic-elems";
import { Initializers } from "./nwb/spec-defaults";
import {
  NWBAttributeSpec,
  NWBDatasetSpec,
  NWBGroupSpec,
  NWBLinkSpec,
  NWBNamespaceSpec,
} from "./ir/pynwb-spec";
import { interpreter_script } from "./data/interpreter";

function codegen(ns: Namespace): string {
  let namespaceSpec = convertNamespace(ns);
  let types = ns.typedefs.map(convertTypeDef);
  let includes = getCoreIncludes(ns);

  let interpreter = interpreter_script;
  interpreter = interpreter.replace(
    '{{"namespace"}}',
    JSON.stringify(namespaceSpec)
  );
  interpreter = interpreter.replace('{{"types"}}', JSON.stringify(types));
  interpreter = interpreter.replace('{{"includes"}}', JSON.stringify(includes));
  return interpreter;
}

export type NWBTypeSpec = ["GROUP", NWBGroupSpec] | ["DATASET", NWBDatasetSpec];

@customElement("codegen-form")
export class CodegenForm extends CPSForm<Namespace> {
  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.script = codegen(val);
    this.namespace = val;
    this.stepBarElem.setProgressState(progress);
  }

  transform(val: Namespace): Namespace {
    return val;
  }

  clear(): void {
    this.script = "";
  }

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @state()
  script: string = "";

  @state()
  namespace: Namespace = { ...Initializers.namespace };

  @query("step-bar")
  stepBarElem!: FormStepBar;

  render() {
    return html`
    <step-bar></step-bar>
    <input type="button" value="back" @click=${this.back}></input>
    <pre>${this.script}</pre>
    <continue-bar .message=${"export"} .continue=${() =>
      exportFile(this.script, "create_extension_spec.py")}></continue-bar>
    `;
  }
}

function convertNamespace(ns: Namespace): NWBNamespaceSpec {
  let spec: NWBNamespaceSpec = {
    doc: "",
    name: "",
  };
  return spec;
}

function convertTypeDef(t: TypeDef): NWBTypeSpec {
  function convertGroupTypeDef(g: GroupTypeDef): NWBGroupSpec {
    let spec: NWBGroupSpec = {
      doc: "",
    };
    return spec;
  }

  function convertDatasetTypeDef(d: DatasetTypeDef): NWBDatasetSpec {
    let spec: NWBDatasetSpec = {
      doc: "",
    };
    return spec;
  }

  function convertIncGroupDec(g: IncGroupDec): NWBGroupSpec {
    let spec: NWBGroupSpec = {
      doc: "",
    };
    return spec;
  }

  function convertAnonGroupDec(g: AnonymousGroupTypeDec): NWBGroupSpec {
    let spec: NWBGroupSpec = {
      doc: "",
    };
    return spec;
  }

  function convertIncDatasetDec(d: IncDatasetDec): NWBDatasetSpec {
    let spec: NWBDatasetSpec = {
      doc: "",
    };
    return spec;
  }

  function convertAnonDatasetDec(d: AnonymousDatasetDec): NWBDatasetSpec {
    let spec: NWBDatasetSpec = {
      doc: "",
    };
    return spec;
  }

  function convertAttributeDec(a: AttributeDec): NWBAttributeSpec {
    let spec: NWBAttributeSpec = {
      name: "",
      doc: "",
      dtype: "",
    };
    return spec;
  }

  function convertLinkDec(l: LinkDec): NWBLinkSpec {
    let spec: NWBLinkSpec = {
      doc: "",
      targetType: "",
    };
    return spec;
  }

  switch (t[0]) {
    case "GROUP":
      return ["GROUP", convertGroupTypeDef(t[1])];
    case "DATASET":
      return ["DATASET", convertDatasetTypeDef(t[1])];
    default:
      assertNever(t[0]);
  }
}

// Exports contents as a new file
function exportFile(contents: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(contents)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getCoreIncludes(ns: Namespace): string[] {
  function getIncludesTypeDef(t: TypeDef): string[] {
    switch (t[0]) {
      case "GROUP":
        return getIncludesGroupTypeDef(t[1]);
      case "DATASET":
        return getIncludesDatasetTypeDef(t[1]);
      default:
        return [];
    }
  }

  function getIncludesGroupTypeDef(g: GroupTypeDef): string[] {
    const includes = [];
    if (g.neurodataTypeInc[0] == "Core") {
      includes.push(g.neurodataTypeInc[1].neurodataTypeDef);
    }
    return [
      ...includes,
      ...g.groups.flatMap(getIncludesGroupDec),
      ...g.datasets.flatMap(getIncludesDatasetDec),
      ...g.attributes.flatMap(getIncludesAttributeDec),
      ...g.links.flatMap(getIncludesLinkDec),
    ];
  }

  function getIncludesDatasetTypeDef(d: DatasetTypeDef): string[] {
    const includes = [];
    if (d.neurodataTypeInc[0] == "Core") {
      includes.push(d.neurodataTypeInc[1].neurodataTypeDef);
    }
    return [
      ...includes,
      ...d.attributes.flatMap(getIncludesAttributeDec),
      ...getIncludesDtype(d.dtype),
    ];
  }

  function getIncludesGroupDec(g: GroupDec): string[] {
    if (g[0] == "INC" && g[1].neurodataTypeInc[0] == "Core")
      return [g[1].neurodataTypeInc[1].neurodataTypeDef];
    else if (g[0] == "ANONYMOUS")
      return [
        ...g[1].groups.flatMap(getIncludesGroupDec),
        ...g[1].datasets.flatMap(getIncludesDatasetDec),
        ...g[1].attributes.flatMap(getIncludesAttributeDec),
        ...g[1].links.flatMap(getIncludesLinkDec),
      ];
    else return [];
  }

  function getIncludesDatasetDec(d: DatasetDec): string[] {
    if (d[0] == "INC" && d[1].neurodataTypeInc[0] == "Core")
      return [d[1].neurodataTypeInc[1].neurodataTypeDef];
    else if (d[0] == "ANONYMOUS")
      return [
        ...d[1].attributes.flatMap(getIncludesAttributeDec),
        ...getIncludesDtype(d[1].dtype),
      ];
    else return [];
  }

  function getIncludesDtype(d: Dtype): string[] {
    if (d[0] == "REFSPEC" && d[1][1][0] == "Core")
      return d[1][1][0] == "Core" ? [d[1][1][1].neurodataTypeDef] : [];
    else if (d[0] == "COMPOUND")
      return d[1].flatMap((f) => getIncludesDtype(f.dtype));
    else return [];
  }

  function getIncludesAttributeDec(a: AttributeDec): string[] {
    return getIncludesDtype(a.dtype);
  }

  function getIncludesLinkDec(l: LinkDec): string[] {
    return l.targetType[1][0] == "Core"
      ? [l.targetType[1][1].neurodataTypeDef]
      : [];
  }

  return ns.typedefs.flatMap(getIncludesTypeDef);
}
