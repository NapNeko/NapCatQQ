const fs = require("fs");
const process = require("process");

console.log("[NapCat] [CheckVersion] 开始检测当前仓库版本...");
try {
  const packageJson = require("../package.json");
  const currentVersion = packageJson.version;
  const targetVersion = process.env.VERSION;

  console.log("[NapCat] [CheckVersion] currentVersion:", currentVersion, "targetVersion:", targetVersion);

  // 验证 targetVersion 格式
  if (!targetVersion || typeof targetVersion !== 'string') {
    console.log("[NapCat] [CheckVersion] 目标版本格式不正确或未设置！");
    return;
  }

  // 写入脚本文件的统一函数
  const writeScriptToFile = (content) => {
    fs.writeFileSync("./checkVersion.sh", content, { flag: 'w' });
    console.log("[NapCat] [CheckVersion] checkVersion.sh 文件已更新。");
  };

  if (currentVersion === targetVersion) {
    // 不需要更新版本，写入一个简单的脚本
    const simpleScript = "#!/bin/bash\necho \"CheckVersion Is Done\"";
    writeScriptToFile(simpleScript);
  } else {
    // 更新版本，构建安全的sed命令
    const safeScriptContent = `
    #!/bin/bash
    git config --global user.email "bot@test.wumiao.wang"
    git config --global user.name "Version"
    sed -i "s/\\\"version\\\": \\\"${currentVersion}\\\"/\\\"version\\\": \\\"${targetVersion}\\\"/g" package.json
    git add .
    git commit -m "chore:version change"
    git push -u origin main`;
    writeScriptToFile(safeScriptContent);
  }
} catch (error) {
  console.log("[NapCat] [CheckVersion] 检测过程中发生错误：", error);
}