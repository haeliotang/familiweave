# Release signing and notarization

日期：2026-11-01。状态：未完成；仓库中没有证书或私钥。

## 当前产物

- macOS：ad-hoc 签名，**未公证**
- Windows：unsigned NSIS
- Linux：unsigned AppImage/DEB

Gatekeeper / SmartScreen 会警告。v0.1.0 Release 已在说明中标注，不应把产物描述为已签名或已公证。

## macOS Developer ID

需要：

- Apple Developer Program
- Developer ID Application 证书
- 公证账号或 App Store Connect API key

Tauri 构建所需环境变量（按 CI secret 注入）：

```sh
APPLE_CERTIFICATE
APPLE_CERTIFICATE_PASSWORD
APPLE_SIGNING_IDENTITY
APPLE_ID
APPLE_PASSWORD
APPLE_TEAM_ID
# 或 APPLE_API_ISSUER / APPLE_API_KEY / APPLE_API_KEY_PATH
```

之后：

```sh
pnpm tauri:build --bundles app
codesign --verify --deep --strict --verbose=2 Familiweave.app
spctl --assess --type execute --verbose Familiweave.app
```

公证与装订使用 `notarytool` / `stapler`；发布前在干净 macOS 用户环境复验。

## Windows

- 需要代码签名证书（EV 或普通 Authenticode）
- 在 CI 中通过 secret 注入，使用 `signtool` 签署 NSIS 产物
- 未签名前，Release 必须保留 SmartScreen 警告说明

## Linux

- AppImage/DEB 目前未签名
- 可增加 minisign/GPG 校验与仓库签名；在完成前依赖 SHA256SUMS 与 GitHub Release 的传输安全

## 自动化边界

`Desktop builds` workflow 会生成 `SHA256SUMS.txt` 并附加到 tag Release；签名/公证仍需要外部凭据，当前不可在本仓库内完成。
