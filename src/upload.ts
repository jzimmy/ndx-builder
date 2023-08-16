import { MAGIC_SIGNATURE } from "./codegen";
import { Namespace } from "./nwb/spec";

export function parseCreateExtensionSpecScript(
  contents: string
): Namespace | null {
  let sigRegex = new RegExp(`${MAGIC_SIGNATURE}.*${MAGIC_SIGNATURE}`);
  let sig = contents.match(sigRegex);
  if (!sig) {
    alert("Could not find special signature in extension script");
    return null;
  }

  let ns = JSON.parse(
    deobfuscateString(
      sig[0]?.slice(MAGIC_SIGNATURE.length, -MAGIC_SIGNATURE.length)
    )
  );

  // pretty dangerous, could add some checks to confirm that this works
  if (!verifyNamespace(ns)) {
    alert("Could not properly parse signature in extension script");
    return null;
  }

  return ns as Namespace;
}

function verifyNamespace(_ns: Namespace): boolean {
  // Kinda Important TODO!
  return true;
}

// Simple character shift to mess up newline characters
// and make it all unreadable to humans.
// Discourages people from trying to edit the data directly
export function obfuscateString(s: string) {
  let newstr = new Array(s.length);
  for (let i = 0; i < s.length; i++)
    newstr[i] = String.fromCharCode(s.charCodeAt(i) + 0x5a);
  return newstr.join("");
}

export function deobfuscateString(s: string) {
  let newstr = new Array(s.length);
  for (let i = 0; i < s.length; i++)
    newstr[i] = String.fromCharCode(s.charCodeAt(i) - 0x5a);
  return newstr.join("");
}

// TODO, allow users to upload extension yaml files, this function turns
// the yaml in a `Namespace` object
export function parseNDXYaml(
  _namespaceYaml: Object,
  _extYaml: Object
): Namespace {
  throw new Error("Not implemented");
}
