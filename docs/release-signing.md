# Release signing and notarization

日期：2026-11-06。状态：v0.1.2 签名流程已准备；本机可用 Developer ID 签名，但尚未公证；Windows 证书尚未配置；没有发布 v0.1.2。逐步操作见 [signing-setup.md](signing-setup.md) 和 [macOS signed workflow](../.github/workflows/macos-signed.yml)。

## 当前产物

- macOS：ad-hoc 签名，**未公证**
- Windows：unsigned NSIS
- Linux：unsigned AppImage/DEB

Gatekeeper / SmartScreen 会警告。v0.1.1 Release 是未签名归档；v0.1.2 不应急于发布，直到 macOS 公证和 Windows 签名都通过。

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
APPLE_SIGNING_IDENTITY="Developer ID Application: ..." sh scripts/package-macos.sh
codesign --verify --deep --strict --verbose=2 Familiweave.app
spctl --assess --type execute --verbose Familiweave.app
```

`.github/workflows/macos-signed.yml` 可在配置 secrets 后手动跑签名/公证并上传 artifact；默认不发布 Release。

公证与装订使用 `notarytool` / `stapler`；发布前在干净 macOS 用户环境复验。

## Windows

- 需要代码签名证书（EV 或普通 Authenticode）
- `Desktop builds` 已加入可选的 Windows PFX 导入 + NSIS `signtool` 签名步骤；没有 `WINDOWS_CERTIFICATE` 时保持未签名
- 未签名前，Release 必须保留 SmartScreen 警告说明

## Linux

- AppImage/DEB 目前未签名
- 可增加 minisign/GPG 校验与仓库签名；在完成前依赖 SHA256SUMS 与 GitHub Release 的传输安全

## 自动化边界

`Desktop builds` workflow 会生成 `SHA256SUMS.txt` 并附加到 tag Release；`macos-signed.yml` 负责 Developer ID 签名/公证 artifact；Windows 签名步骤由 `desktop-build.yml` 的可选 secret 驱动。没有凭据时不会伪造签名。
