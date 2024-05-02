let fs = require("fs");
let process = require("process")
console.log("[NapCat] [CheckVersion] 开始检测当前仓库版本...");
let currentVersion = require("../package.json").version;
let targetVersion = process.env.VERSION;
console.log("[NapCat] [CheckVersion] currentVersion:", currentVersion, " targetVersion:", targetVersion);
// fs.mkdirSync("./dist");
if (currentVersion === targetVersion) {
    fs.writeFileSync("./checkVersion.sh", "#!/bin/bashe\necho \"CheckVersion Is Done\"")
} else {
    let runscript = "sed -i 's/\"version\": \"" + currentVersion + "\"/\"version\": \"" + targetVersion + "\"/g' package.json";
    fs.writeFileSync("./checkVersion.sh", "#!/bin/bashe\ngit config --global user.email \"bot@test.wumiao.wang\"\n git config --global user.name \"Version\"\n" + runscript + "\ngit add .\n git commit -m \"chore:version change\"\n git push -u origin main")
}
