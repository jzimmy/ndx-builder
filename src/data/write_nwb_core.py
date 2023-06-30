import pynwb
import pkgutil

desired_submodules = {
    "file": "NWBFile",
    "ecephys": "Extracellular Electrophysiology",
    "icephys": "Intracellular Electrophysiology",
    "ophys": "Optophysiology",
    "ogen": "Optogenetics",
    "retinotopy": "Retinotopy",
    "image": "General Imaging",
    "behavior": "Behavior",
    "base": "NWB Base Classes",
    "misc": "Miscellaneous",
    "epoch": "Epoch",
}

nwb_submodules = pkgutil.iter_modules(pynwb.__path__)
nwb_submodules = [m for m in nwb_submodules if not m.name.startswith('_')]
# print([m.name for m in nwb_submodules])

ns_catalog = pynwb.get_type_map().namespace_catalog
for ns_name in ns_catalog.namespaces:
    if ns_name == "core":
        print("--------------------")
        print(f"Namespace: {ns_name}")
        ns = ns_catalog.get_namespace(name=ns_name)
        for data_type in ns.get_registered_types():
            # print("------------------")
            print(data_type, ns.get_spec(data_type))
            print("\n\n")
