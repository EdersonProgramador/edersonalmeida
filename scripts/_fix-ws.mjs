import fs from "fs";

const apiPkg = JSON.parse(fs.readFileSync("apps/api/package.json", "utf8"));
const apiName = apiPkg.name;
let root = fs.readFileSync("package.json", "utf8");
const refs = [...new Set(root.match(/@ed[a-z]+\/api/g) ?? [])];
console.log("target:", apiName, [...apiName].slice(0, 20).join(""));
console.log("refs before:", refs);
for (const ref of refs) {
  if (ref !== apiName) root = root.replaceAll(ref, apiName);
}
fs.writeFileSync("package.json", root);
console.log(
  "refs after:",
  [...new Set(root.match(/@ed[a-z]+\/api/g) ?? [])],
);
