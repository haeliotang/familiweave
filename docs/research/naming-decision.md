# 命名决策：Familiweave → Feltweft

日期：2026-11-06。状态：**建议方案，等待项目所有者确认；尚未执行仓库/标识符改名。**  
范围：品牌名、GitHub 仓库名、桌面 App 名与 bundle identifier。  
注意：以下是**技术与语义初筛**，不是商标、域名或法律意见。

## 1. 决策摘要

建议新名称：

> **Feltweft**  
> 中文工作名：**触纬**

理由：

- `Felt` 同时连接 **felt sense（感受/身体感）** 与 **felt（毡，纤维压合的材料）**；
- `Weft` 是织物的**纬线**，是穿过经线、形成纹理与颜色的那根线；
- 两者合起来表达“被感受到的纹理/关系纹理”，但不指向家庭、治疗、诊断、BCI 或潜意识读取；
- 拼写短、可发音、可做域名与仓库名；
- 没有 `family` 的误导，也没有 `subconscious` 的过度承诺。

推荐 tagline：

> **Feltweft — a local-first symbolic field for pre-verbal experience.**  
> **触纬：一个本地优先的前语言经验象征空间。**

不建议使用：

> Feltweft — read your subconscious.  
> Feltweft — decode your deep mind.

## 2. 为什么不是 Familiweave

Familiweave 的语义结构看起来是：

> Family + weave

它会把第一印象推向：

- 家庭治疗
- 家庭系统排列
- 家族史/家谱
- 伴侣/家庭关系分析
- 关系疗愈产品

但当前项目是：

> 个体前语言的身体—意象—关系预测模型；关系触发点不限于家庭。

`weave` 仍然很好；问题在 `Famili`。

另一个读法是 `familiar + weave`，语义上其实贴近项目，但用户不会天然这样读。名字不能靠解释才能成立。

结论：**Familiweave 不是必须抛弃，但它已经不是最诚实的公开名字。**

## 3. 命名标准

| 标准 | 要求 |
|---|---|
| 语义 | 身体、感受、意象、关系、纹理、前语言；不指向家庭治疗 |
| 边界 | 不暗示诊断、治疗、潜意识读取、BCI 读心、AI 意识 |
| 可发音 | 英文一次能读；中文有自然译名 |
| 可搜索 | GitHub、npm、域名、社交 handle 低冲突 |
| 可扩展 | 可覆盖 Web、Tauri、研究项目、CLI |
| 可迁移 | 不与现有 bundle identifier/发布资产强绑定 |
| 不油腻 | 不像 wellness/灵修/成功学品牌 |

## 4. 候选检索结果

检索时间：2026-11-06。  
方法：GitHub repository search、npm registry、`whois`、公开 web search。  
结果只是初筛；商标、社交 handle、App Store 名称仍需正式检索。

| 候选 | 语义 | GitHub | npm | .com | 初判 |
|---|---|---|---|---|---|
| **Feltweft** | felt sense + 纬线/纹理 | 0 | 404 | 未注册 | **推荐** |
| **Tacitweft** | tacit/implicit + 纬线 | 0 | 404 | 未注册 | 备选，偏学术 |
| **Subweft** | below + 纬线 | 1 | 404 | 未注册 | 备选，但 `sub` 暗示潜意识 |
| **Underweft** | under + 纬线 | 0 | 未查 | 已注册 | 语义好，域名冲突 |
| **Feltfield** | felt + field | 0 | 未查 | 已注册 | 语义好，域名冲突 |
| **Selvage** | 织物的“自完成边缘” | 193 | 已有 PyPI/Shopify 等 | 已注册 | 概念极好，冲突太多 |
| **Undersong** | 低吟/潜在歌 | 6 | 未查 | 已注册 | App Store 已有 Undersong |
| **Subsong** | 鸟类亚歌/前语言声音 | 6 | 未查 | 已注册 | 语义好，冲突 |
| **Heddle** | 织机综片 | 未查 | 未查 | 已注册 | 太工具化 |
| **Familiweave** | family + weave | 当前仓库 | — | — | 语义偏窄 |

### Feltweft 的进一步检查

- `feltweft.com`：`whois` 返回 `No match for domain "FELTWEFT.COM"`；
- GitHub repository search：0；
- npm：404；
- 公开 web 搜索没有发现同名软件/品牌；可见结果主要是 “felt” 与 “weft” 的纺织语境；
- **未完成**：商标数据库、社交 handle、App Store、`.org/.io/.app`、中文商标。

### 为什么 Feltweft 比 Tacitweft 好

Tacitweft 更精确地表达“隐性知识”，但：

- `tacit` 偏学术/咨询语境；
- 对普通用户不够温暖；
- “tacit knowledge” 容易被理解为知识管理，而不是身体经验。

Feltweft 同时保留身体、感受与材料性，语义更宽，也更适合作为界面名。

## 5. 推荐的品牌结构

- 英文：**Feltweft**
- 中文工作名：**触纬**
- 仓库：`feltweft`
- App：`Feltweft`
- CLI/Rust：`feltweft-ops`、`feltweft-desktop`
- bundle identifier：`com.inceptless.feltweft`
- 本地数据目录：随 identifier 迁移
- 旧名：`Familiweave` 作为历史项目名，在 README/release notes 中标注 “formerly Familiweave”

中文名备选：

- **触纬**：触觉 + 纬线；推荐；
- **毡纬**：更偏材料/纺织，可能被误解为手作品牌；
- **感纬**：更抽象，但不如“触纬”具体。

## 6. 迁移方案（确认后执行）

### Phase 0：保留与检索

- 注册 `feltweft.com`（以及必要的 `.org/.app`）；
- 检查 GitHub org/repo、npm、社交 handle；
- 做商标初筛（至少 USPTO/CNIPA 的相同/近似类别）；
- 确认中文名“触纬”可用。

### Phase 1：仓库改名

- GitHub repo `familiweave` → `feltweft`；
- 本地 remote 更新；
- README、docs、badge、workflow 中的旧 URL；
- 旧 URL 由 GitHub 重定向，但需要复验 release 资产、raw 链接、Pages/外部引用。

当前非生成文件中的名称引用约 **80 个文件、204 处**（不含 `target/`、`dist/`、`node_modules/`、测试报告）；仓库改名本身约半天。

### Phase 2：App/数据标识符

- `productName`: `Feltweft`
- identifier: `com.inceptless.feltweft`
- Rust package/binary: `feltweft-desktop`, `feltweft-ops`
- 本地 SQLite / localStorage / app data path
- 图标、窗口标题、About、签名/公证、更新 manifest
- 旧数据迁移：
  - 开发数据：导出/导入即可；
  - 若保留旧 identifier，则旧数据不会自动出现在新 App；
  - 当前无真实用户，优先换干净 identifier，不做长期双路径。

预计：**1–3 天工程 + 全量测试 + 重新打包**。

### Phase 3：发布

- 新版本建议 **v0.1.3**；
- 不覆盖 v0.1.1/v0.1.2 的资产；
- release notes 标注 “formerly Familiweave”；
- 重新生成 SHA256SUMS；
- 如签名凭据就绪，同时做 macOS Developer ID/公证与 Windows Authenticode。

### Phase 4：沟通

- README 第一段解释新名；
- 保留一句 “Familiweave was the working name; the research scope did not change.”；
- 旧 release 保留，避免历史链接断裂。

## 7. 风险

- **商标风险未清除**：Feltweft 可能在某个类别已被注册；正式使用前必须做商标检索。
- **“felt” 可能被读成纺织/手作**：tagline 必须明确是研究/界面，不是材料品牌。
- **“weft” 不是日常词**：需要一次解释；但独特性和语义收益大于学习成本。
- **bundle identifier 改名会断开旧本地数据**：当前无真实用户，成本可接受；若有测试数据，先导出。
- **GitHub 重定向不等于所有外部链接永久有效**：release 资产和第三方引用需要复验。

## 8. 决策请求

建议确认：

1. 是否接受 **Feltweft / 触纬** 作为新名；
2. 是否在 **v0.1.3 之前**执行仓库 + App 标识符改名；
3. 是否先做商标检索，再执行代码替换。

未确认前，不执行改名，不修改 204 处引用，不创建新 release。
