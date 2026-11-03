# Auto-update plan

日期：2026-11-04。状态：方案文档；**edition 尚未启用 updater**，没有提交 updater 私钥。

## 为什么现在不直接打开

Tauri updater 需要三样东西：

1. 一个稳定的更新清单 endpoint（例如 `https://.../latest.json`）
2. 一个独立的 updater 公钥/私钥对（通常 minisign）
3. 能持续发布签名更新包的 CI Release 流程

没有这些就打开 updater，只会得到一个无法验证更新、可能被替换的更新通道。因此本轮只实现发布校验和、跨平台 smoke 和签名操作指南，不启用 updater。

## 密钥与代码签名不是同一套

- Apple / Windows 证书：证明安装包发布者身份、帮助 SmartScreen/Gatekeeper。
- Updater key：证明**更新包**由项目发布者签名；与 Apple/Windows 证书无关。

不要把同一私钥用于两件事；不要提交任何私钥。

## 推荐启用步骤

1. 决定更新清单托管位置（GitHub Release static file、对象存储或自建服务）。
2. 在维护者机器生成 updater key pair：

```sh
pnpm tauri signer generate -w ~/.tauri/familiweave-updater.key
```

   - 公钥填入 `tauri.conf.json` 的 updater 配置。
   - 私钥放入 GitHub Actions Secret，例如 `TAURI_SIGNING_PRIVATE_KEY`。
   - 私钥密码放入 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
   - 私钥文件不要进入仓库、不要粘贴到聊天。

3. 添加 updater endpoint 和版本清单；每个平台生成 updater artifact（`.sig`）与 `latest.json`。
4. 在 `Desktop builds` 中生成 `.sig`，并把 `latest.json` 附加到同一个 Release。
5. 增加启动时 check 更新、下载、验证、重启的 UI；失败时保留旧版本，不阻塞本地使用。
6. 在 macOS/Windows/Linux 上分别测试：无更新、有更新、签名错误、网络中断、回滚。

## 回滚与安全

- 每次更新必须带版本号、平台、签名；验证失败不得替换当前 app。
- 更新 endpoint 必须 HTTPS；如果托管在 GitHub Release，release 发布者账号必须启用 2FA。
- 默认不自动静默安装；至少显示更新内容和用户确认。
- 旧版本保留可回退路径；出现安全问题时撤销 release 并发布修复版本。
- 若 key 泄露，立即撤销/轮换 key，并发布新的签名清单；旧更新通道视为不可信。

## 当前仓库已具备

- `SHA256SUMS.txt` 自动生成并附到 Release。
- 当前 main 的 Linux/Windows 启动 smoke。
- 签名操作指南：[signing-setup.md](signing-setup.md)。
- 版本化 Release 标签与 workflow。

后续一旦确定更新托管与密钥保管方式，可以在此文档基础上接入 updater插件。
