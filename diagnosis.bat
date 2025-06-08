@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 AI小説生成システム - 診断スクリプト
echo ========================================
echo.

echo [1] 基本環境確認
echo ==================
echo Node.js バージョン:
node --version 2>nul || echo ❌ Node.js not found
echo.
echo npm バージョン:
npm --version 2>nul || echo ❌ npm not found
echo.

echo [2] プロジェクト構造確認
echo ========================
echo 📁 ルートディレクトリ:
dir /b
echo.

echo 📁 package.json 確認:
if exist package.json (
    echo ✅ package.json 存在
    echo --- Scripts セクション ---
    findstr /C:"\"scripts\":" /A package.json >nul 2>&1
    if errorlevel 1 (
        echo ❌ scripts セクションが見つかりません
    ) else (
        powershell -Command "Get-Content package.json | Select-String -Pattern '\"scripts\"' -Context 0,10"
    )
) else (
    echo ❌ package.json が見つかりません
)
echo.

echo [3] Next.js 設定確認
echo ====================
echo next.config.js:
if exist next.config.js (
    echo ✅ next.config.js 存在
    type next.config.js
) else (
    echo ❌ next.config.js が見つかりません
)
echo.

echo tsconfig.json:
if exist tsconfig.json (
    echo ✅ tsconfig.json 存在
    echo --- paths 設定確認 ---
    findstr /C:"paths" tsconfig.json >nul 2>&1
    if not errorlevel 1 (
        powershell -Command "Get-Content tsconfig.json | Select-String -Pattern 'paths' -Context 2,5"
    )
) else (
    echo ❌ tsconfig.json が見つかりません
)
echo.

echo [4] App Router 構造確認
echo ========================
echo 📁 src ディレクトリ:
if exist src (
    echo ✅ src 存在
    echo --- src 内容 ---
    dir /b src
    echo.
    
    echo 📁 src\app 構造:
    if exist src\app (
        echo ✅ src\app 存在
        dir /b src\app
        echo.
        
        echo 📄 layout.tsx:
        if exist src\app\layout.tsx (
            echo ✅ layout.tsx 存在
            echo --- import 文確認 ---
            findstr /C:"import" src\app\layout.tsx
        ) else (
            echo ❌ layout.tsx が見つかりません
        )
        echo.
        
        echo 📄 page.tsx:
        if exist src\app\page.tsx (
            echo ✅ page.tsx 存在
            echo --- import 文確認 ---
            findstr /C:"import" src\app\page.tsx
        ) else (
            echo ❌ page.tsx が見つかりません
        )
        echo.
        
        echo 📄 globals.css:
        if exist src\app\globals.css (
            echo ✅ globals.css 存在
        ) else (
            echo ❌ globals.css が見つかりません
        )
    ) else (
        echo ❌ src\app が見つかりません
    )
    
    echo 📁 src\components 構造:
    if exist src\components (
        echo ✅ src\components 存在
        dir /s /b src\components\*.tsx 2>nul || echo "TypeScript コンポーネントファイルがありません"
        dir /s /b src\components\*.ts 2>nul || echo "TypeScript ファイルがありません"
    ) else (
        echo ❌ src\components が見つかりません
    )
    echo.
    
    echo 📁 src\lib 構造:
    if exist src\lib (
        echo ✅ src\lib 存在
        dir /s /b src\lib\*.ts src\lib\*.tsx 2>nul || echo "lib ファイルがありません"
    ) else (
        echo ❌ src\lib が見つかりません
    )
) else (
    echo ❌ src ディレクトリが見つかりません
)
echo.

echo [5] 依存関係確認
echo ================
echo node_modules 存在確認:
if exist node_modules (
    echo ✅ node_modules 存在
    echo --- 主要パッケージ確認 ---
    if exist node_modules\next (echo ✅ next) else (echo ❌ next)
    if exist node_modules\react (echo ✅ react) else (echo ❌ react)
    if exist node_modules\typescript (echo ✅ typescript) else (echo ❌ typescript)
    if exist node_modules\tailwindcss (echo ✅ tailwindcss) else (echo ❌ tailwindcss)
    if exist "node_modules\@google" (echo ✅ @google/generative-ai) else (echo ❌ @google/generative-ai)
) else (
    echo ❌ node_modules が見つかりません - npm install を実行してください
)
echo.

echo [6] 環境変数確認
echo ================
echo .env ファイル:
if exist .env (echo ✅ .env 存在) else (echo ❌ .env なし)
if exist .env.local (echo ✅ .env.local 存在) else (echo ❌ .env.local なし)
if exist .env.development (echo ✅ .env.development 存在) else (echo ❌ .env.development なし)
echo.

echo [7] ポート確認
echo ==============
echo ポート 3000 使用状況:
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ✅ ポート 3000 は空いています
) else (
    echo ⚠️ ポート 3000 は使用中です
)
echo.

echo [8] TypeScript 型チェック
echo ========================
echo TypeScript コンパイル確認:
if exist tsconfig.json (
    echo tsc --noEmit でチェック中...
    npx tsc --noEmit 2>&1 | findstr /C:"error" >nul
    if errorlevel 1 (
        echo ✅ TypeScript 型エラーなし
    ) else (
        echo ❌ TypeScript 型エラーあり:
        npx tsc --noEmit
    )
) else (
    echo TypeScript 設定ファイルがありません
)
echo.

echo [9] 不足ファイル検出
echo ====================
echo 重要ファイルの存在チェック:
set missing_files=0

if not exist src\app\layout.tsx (
    echo ❌ src\app\layout.tsx が不足
    set /a missing_files+=1
)
if not exist src\app\page.tsx (
    echo ❌ src\app\page.tsx が不足
    set /a missing_files+=1
)
if not exist src\app\globals.css (
    echo ❌ src\app\globals.css が不足
    set /a missing_files+=1
)

if %missing_files%==0 (
    echo ✅ 重要ファイルはすべて存在します
)
echo.

echo [10] 診断結果サマリー
echo =====================
echo 診断完了: %date% %time%
if %missing_files% gtr 0 (
    echo ⚠️ %missing_files% 個のファイルが不足しています
) else (
    echo ✅ 基本ファイルは揃っています
)

echo.
echo 詳細なエラー情報を取得するには:
echo 1. npm run dev を実行
echo 2. 別のコマンドプロンプトでこのスクリプトを実行
echo 3. エラーメッセージを確認
echo.
pause