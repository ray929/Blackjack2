# Blackjack2（21点）

一款支持 2-4 人同屏对战的 21 点（Blackjack）游戏，针对平板和手机触控优化。

## Features

- 四人在同一屏幕面对面游玩（甲为庄家，乙、丙、丁为闲家）
- 乙、丙区域旋转 180 度，实现面对面视角
- 支持落座/离座、发牌、要牌、停牌操作
- 完整的 21 点规则：爆牌、Blackjack、五子不犯廿
- 积分跨局累计，使用 localStorage 持久化存储
- 发牌飞入动画与暗牌翻转动画
- 音效反馈（发牌、结算）
- 响应式布局，支持横竖屏切换
- 自定义 favicon

## Environment Variables

本项目为纯前端实现，无需额外环境变量。

## Debug Commands

本地开发（带热重载）：

```bash
npm start
```

## Release Commands

生产构建：

```bash
npm run build
```

构建产物输出到 `dist/` 目录。
