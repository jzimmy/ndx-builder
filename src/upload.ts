import { MAGIC_SIGNATURE } from "./codegen";
import { Namespace } from "./nwb/spec";

export function parseOldCreateExtensionSpecScript(contents: string): Namespace {
  let sigRegex = new RegExp(`${MAGIC_SIGNATURE}.*${MAGIC_SIGNATURE}`);
  let sig = contents.match(sigRegex);
  if (!sig) {
    throw new Error("Could not find signature");
  }

  let ns = JSON.parse(
    deobfuscateString(
      sig[0]?.slice(MAGIC_SIGNATURE.length, -MAGIC_SIGNATURE.length)
    )
  );

  // pretty dangerous, could add some checks to confirm that this works
  return ns;
}

// simple shift to mess up newline characters and make it all unreadable to
// humans

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

// TODO
export function parseNDXYaml(
  namespaceYaml: Object,
  extYaml: Object
): Namespace {
  throw new Error("Not implemented");
}
