
/****
 * This file was auto-generated by build.sh
 * to edit, please edit src/buildstep/create_extension_spec.py
 **/
export const interpreterScript = `"""
This file was autogenerated with the NWB extension builder app
It generates the {{"namespace_name"}} extension
"""
from pynwb.spec import *
import json

ns = json.loads("""{{"namespace"}}""")
types = json.loads("""{{"types"}}""")
includes = json.loads("""{{"includes"}}""")

ns_path = ns["name"] + ".namespace.yaml"
ext_source = ns["name"] + ".extensions.yaml"


def gen_type(type):
    kind, ty = type
    if kind == "GROUP":
        return gen_group_spec(ty)
    return gen_dataset_spec(ty)


def gen_group_spec(spec):
    spec["groups"] = [gen_group_spec(g) for g in spec["groups"]]
    spec["datasets"] = [gen_dataset_spec(d) for d in spec["datasets"]]
    spec["attributes"] = [gen_attribute_spec(a) for a in spec["attributes"]]
    spec["links"] = [gen_link_spec(l) for l in spec["links"]]
    return NWBGroupSpec(**spec)


def gen_dataset_spec(spec):
    spec["attributes"] = [gen_attribute_spec(a) for a in spec["attributes"]]
    if "dtype" in spec:
        spec["dtype"] = gen_dtype_spec(spec["dtype"])
    if "shape" in spec:
        spec["shape"] = gen_shape(spec["shape"])
    return NWBDatasetSpec(**spec)


def gen_attribute_spec(spec):
    spec["dtype"] = gen_dtype_spec(spec["dtype"])
    if "shape" in spec:
        spec["shape"] = gen_shape(spec["shape"])
    return NWBAttributeSpec(**spec)


def gen_link_spec(spec):
    return NWBLinkSpec(**spec)


def gen_namespace(ns):
    return NWBNamespaceBuilder(**ns)


def gen_dtype_spec(spec):
    if isinstance(spec, str):
        return spec if spec != "None" else None
    elif isinstance(spec, dict) and ['target_type', 'region'] in spec:
        return NWBRefSpec(**spec)
    elif isinstance(spec, dict) and ['name', 'doc', 'dtype'] in spec:
        spec["dtype"] = [gen_dtype_spec(d) for d in spec["dtype"]]
        return NWBDtypeSpec(**spec)


def gen_shape(shape):
    [None if s == "None" else s for s in shape]


ns_builder = gen_namespace(ns)

for inc in includes:
    ns_builder.include_type(inc, namespace="core")

for ty in types:
    ns_builder.add_spec(ext_source, gen_type(ty))

ns_builder.export(ns_path)

"""
Don't worry about the junk below. It has no effect on this script.
It is a signature so that this file can be read back in by the extension 
builder app when you want to make changes.
"""

"""
{{"signature"}}
"""`;
