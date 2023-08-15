from ruamel.yaml import YAML
import json
import sys
import pathlib
import re

"""
cd <base-directory>
python3 src/data/gencore-script.py > src/data/nwbcore.ts
"""


def write_nwbcore_ts(catalog, modules):
    catalog_obj = re.sub(
        r"\"coreQueryAsNWBType\(([^\)]*)\)\"",
        r"coreQueryAsNWBType(\1)",
        json.dumps(catalog, indent=2),
    )

    catalog_obj = re.sub(
        r'"dtype":\s+\[\s*\"REFSPEC\"\s*,\s*(.*)\s*]',
        r'get dtype() { return ["REFSPEC", \1] as Spec.Dtype; }',
        catalog_obj,
        flags=re.MULTILINE,
    )
    # remove extranenous quotes to add live code into the json string
    return """
    import * as Spec from "../nwb/spec";

    /*
     * This file is generated by src/data/gencore-script.py.
     * Do not edit.
     */

    function _never(_: never): never {
      throw new Error("Function not implemented.");
    }

    function coreQueryAsNWBType(id: string): Spec.NWBType {
      let res = coreQuery(id);
      switch (res[0]) {
        case "GROUP":
          return ["GROUP", ["Core", res[1]]];
        case "DATASET":
          return ["DATASET", ["Core", res[1]]];
        default:
          return _never(res[0]);
      }
    }


    export type CoreTypeId = ["GROUP" | "DATASET", string];
    export function coreQuery(id: string): Spec.CoreType {
        const catalog: { [keyof: string]: Spec.CoreType } = %s;
        return catalog[id];
    }
    
    export const modules: { [keyof: string]: CoreTypeId[] } = %s;
    """ % (catalog_obj,
           json.dumps(modules, indent=2),
           )


core_group = "GROUP"
core_dataset = "DATASET"
f32 = "f32"
i32 = "i32"
i8 = "i8"
i16 = "i16"
f64 = "f64"
i64 = "i64"
u64 = "u64"
u32 = "u32"
u16 = "u16"
u8 = "u8"


def read_core_yaml(dir):
    yamls = [y for y in pathlib.Path(dir).glob("*.yaml")]
    if len(yamls) == 0:
        raise Exception("No NWB yaml files found in " + dir)
    return yamls


def create_core_group(neurodataTypedef: str, default_name: tuple[str, bool], doc: str):
    return {
        "neurodataTypeDef": neurodataTypedef,
        "name": default_name,
        "doc": doc,
    }, core_group


def create_dataset_type(
    neurodataTypedef: str,
    default_name: tuple[str, bool],
    doc: str,
    shape: list[int],
    labels: list[str],
    dtype: str,
):
    return {
        "neurodataTypeDef": neurodataTypedef,
        "name": default_name,
        "doc": doc,
        "shape": [list(zip(ds, ls)) for (ds, ls) in zip(shape, labels)],
        "dtype": parse_dtype(dtype),
    }, core_dataset


def parse_compoundtype(t):
    return {
        "name": t.get("name"),
        "doc": t.get("doc"),
        "dtype": parse_dtype(t.get("dtype")),
    }


def parse_dtype(t: str | list):
    if isinstance(t, list):
        return ("COMPOUND", [parse_compoundtype(innerty) for innerty in t])

    if isinstance(t, dict):
        return ("REFSPEC", f'coreQueryAsNWBType(\'{t["target_type"]}\')')

    return (
        "PRIMITIVE",
        {
            "float": f32,
            "float32": f32,
            "double": f64,
            "float64": f64,
            "long": i64,
            "int64": i64,
            "int": i32,
            "int32": i32,
            "int16": i16,
            "int8": i8,
            "uint64": u64,
            "uint": u32,
            "uint32": u32,
            "uint16": u16,
            "uint8": u8,
            "numeric": "Numeric",
            "text": "Text",
            "utf": "Text",
            "utf8": "Ascii",
            "utf-8": "Ascii",
            "ascii": "Ascii",
            "bool": "Bool",
            "any": "Any",
            "isodatetime": "IsoDatetime",
        }[t],
    )


"""
export type CoreGroupType = {
  neurodataTypeDef: string;
  name: Defaultable<string>;
  doc: string;
};

export type CoreDatasetType = {
  neurodataTypeDef: string;
  name: Defaultable<string>;
  doc: string;
  shape: [ShapeDim, string][];
  dtype: Dtype;
};
"""


def eprint(x):
    print(x, file=sys.stderr)


def nest_axes(axes):
    if axes == []:
        return axes
    elif not isinstance(axes[0], list):
        axes = [axes]
    return [["None" if d is None else d for d in dims] for dims in axes]


def parse_yaml(y):
    catalog = {}
    if str(y).endswith("namespace.yaml"):
        return catalog

    yaml = YAML()
    yaml_obj = None
    with open(y, "r") as f:
        yaml_obj = yaml.load(y)
    groups = yaml_obj.get("groups", [])
    datasets = yaml_obj.get("datasets", [])

    eprint(f"reading from {y}")
    eprint(f"parsing {len(groups)} groups")
    for g in groups:
        tydef = g["neurodata_type_def"]
        isdef = ("", False)
        defname = g.get("default_name", "")
        name = g.get("name", "")
        if defname:
            isdef = (defname, True)
        elif name:
            isdef = (name, False)
        doc = g["doc"]
        coregroup, varty = create_core_group(tydef, isdef, doc)
        catalog[tydef] = (varty, coregroup)

    eprint(f"parsing {len(datasets)} datasets")
    for d in datasets:
        tydef = d["neurodata_type_def"]
        isdef = ("", False)
        defname = d.get("default_name", "")
        name = d.get("name", "")
        if defname:
            isdef = (defname, True)
        elif name:
            isdef = (name, False)
        doc = d["doc"]
        dtype = d.get("dtype", "any")
        shape = nest_axes(d.get("shape", []))
        dims = nest_axes(d.get("dims", []))
        try:
            coredset, varty = create_dataset_type(
                tydef, isdef, doc, shape, dims, dtype)
        except Exception as e:
            eprint(dtype)
            raise e
        catalog[tydef] = (varty, coredset)
    return catalog


def main():
    yamls = read_core_yaml("nwb-schema/core")
    catalog = {}
    modules = {}
    yamls = [y for y in list(yamls) if not str(y).endswith("namespace.yaml")]
    for y in yamls:
        mod = re.sub("nwb-schema/core/nwb.([^\.]*).yaml", "\\1", str(y))
        eprint("MODULE: " + mod)
        module_catalog = parse_yaml(y)
        catalog = dict(catalog, **module_catalog)
        modules[mod] = [(kind, id)
                        for (id, (kind, _)) in module_catalog.items()]
    print(write_nwbcore_ts(catalog, modules))
    print()


if __name__ == "__main__":
    main()