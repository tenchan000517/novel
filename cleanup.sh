#!/bin/bash
# 自動生成されたクリーンアップスクリプト

echo "🧹 ディスク容量確保のためのクリーンアップ開始..."

# Next.js関連の一時ファイル削除
echo "Next.js一時ファイルを削除中..."
rm -rf .next/
rm -rf node_modules/.cache/

# システム一時ファイル削除 (Windows)
echo "システム一時ファイルを削除中..."
rm -rf /c/Users/$USER/AppData/Local/Temp/* 2>/dev/null || true

# ログファイル削除
echo "ログファイルを削除中..."
find . -name "*.log" -size +10M -delete 2>/dev/null || true

echo "✅ クリーンアップ完了！"
echo "ディスク容量を確認してください: df -h ."
