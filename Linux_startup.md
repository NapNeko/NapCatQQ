# Linux系统设置开机自启动步骤

本步骤适用于Ubuntu系统，24.04版本测试通过。其它版本未测试。

### 步骤1：创建服务文件

打开终端，运行以下命令创建一个新的systemd服务文件：

```bash
sudo nano /etc/systemd/system/napcat.service
```

### 步骤2：编辑服务文件

在文件中添加以下内容：

```markdown
[Unit]
Description=Napcat Service
After=network.target

[Service]
User=root
ExecStart=/usr/bin/screen -dmS napcat /usr/bin/bash -c "/usr/bin/xvfb-run -a qq --no-sandbox"
RemainAfterExit=yes
Type=oneshot

[Install]
WantedBy=multi-user.target
```

确保使用绝对路径来执行命令，以避免路径相关的问题。

### 步骤3：保存并关闭文件

按下 `Ctrl + O`保存，`Ctrl + X`关闭nano编辑器。

### 步骤4：重新加载systemd守护进程

更新systemd，以使其识别新创建的服务文件：

```bash
sudo systemctl daemon-reload
```

### 步骤5：启用服务

将服务启用以便在启动时运行：

```bash
sudo systemctl enable napcat.service
```

### 步骤6：验证服务状态

检查服务是否已正确启用：

```bash
sudo systemctl status napcat.service
```

### 可选步骤：立即启动服务（测试用）

如果想在当前会话中测试服务，可以运行：

```bash
sudo systemctl start napcat.service
```

然后，检查screen会话是否存在：

```bash
screen -ls
```

你应该会看到名为 `napcat`的会话。

### 注意事项

- **用户权限**：在服务文件中指定正确的 `User`，确保程序以正确的用户权限运行。
- **绝对路径**：使用绝对路径（如 `/usr/bin/screen`）确保命令能正确执行。
- **依赖关系**：如果命令依赖于特定的网络或其他服务，可能需要调整 `After`部分。
- **日志检查**：如果服务没有按预期运行，可以查看日志：`journalctl -u napcat.service -b`，这里的 `-b`显示上次启动时的日志。
