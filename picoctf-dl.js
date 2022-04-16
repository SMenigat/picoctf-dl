#!/usr/bin/env node
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const sanitize = require("sanitize-filename");
const { HEADERS } = require("./config.js");

const challangeId = Number(process.argv[2]);
const targetDir = process.cwd();

const fetchJson = async (url) => {
  const req = await fetch(url, {
    headers: HEADERS,
    body: null,
    method: "GET",
  });
  return await req.json();
};

(async () => {
  if (challangeId) {
    console.log("⬇️  Downloading challange main data...");
    const main = await fetchJson(
      `https://play.picoctf.org/api/challenges/${challangeId}/`
    );
    console.log("⬇️  Downloading instance data...");
    const instance = await fetchJson(
      `https://play.picoctf.org/api/challenges/${challangeId}/instance/`
    );
    // create folder first
    const newDir = sanitize(main.name.toLowerCase()).replace(/ /g, "-");
    const dirPath = path.join(targetDir, newDir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      console.log(`✅ New folder ${newDir} created`);
    }

    // write readme
    const readme = [
      `### ${main.name} (${main.category.name})`,
      `Created by: ${main.author}`,
      instance.description,
      ...(instance.endpoints.length > 0
        ? [
            `### Endpoints`,
            instance.endpoints
              .map((item) => `- ${item.label}: ${item.endpoint}`)
              .join("\n"),
          ]
        : []),
      ...(instance.hints.length > 0
        ? [`### Hints`, instance.hints.map((hint) => `- ${hint}`).join("\n")]
        : []),
    ].join("\n\n");
    const readmePath = path.join(dirPath, "readme.md");
    fs.writeFileSync(readmePath, readme);
    console.log("✅ Readme created");
  } else {
    console.error("challange id could not be parsed");
    process.exit(1);
  }
})();
