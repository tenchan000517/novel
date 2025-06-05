import re
import os
import glob
import sys

def replace_logger_with_logerror(content):
    """
    loggerを使用したエラーロギングをlogErrorに置き換える
    """
    # logger.errorのパターンを検索
    logger_error_pattern = re.compile(r'logger\.error\(\s*[\'"`](.*?)[\'"`]\s*,\s*(?:error|.*?error.*?)\s*\)')
    
    # logger.error -> logError変換
    content = re.sub(
        r'logger\.error\(\s*[\'"`](.*?)[\'"`]\s*,\s*(error.*?)\s*\)',
        r'logError(\2, {}, "\1")',
        content
    )
    
    # メタデータがある場合の変換
    content = re.sub(
        r'logger\.error\(\s*[\'"`](.*?)[\'"`]\s*,\s*\{(.*?)\}\s*\)',
        r'logError(error, {\2}, "\1")',
        content
    )
    
    return content

def add_error_handler_import(content):
    """error-handlerからlogErrorをインポート"""
    # 既にlogErrorがインポートされているか確認
    if re.search(r"import\s+\{.*logError.*\}\s+from", content):
        return content  # 既にインポートされている
    
    # 既に error-handler からインポートがあるか確認
    error_handler_import = re.search(r"import\s+\{(.*)\}\s+from\s+(['\"].*?utils/error-handler['\"])", content)
    if error_handler_import:
        # 既存のインポートステートメントにlogErrorを追加
        if "logError" not in error_handler_import.group(1):
            return re.sub(
                r"import\s+\{(.*)\}\s+from\s+(['\"].*?utils/error-handler['\"])",
                r"import {\1, logError} from \2",
                content
            )
        return content
    else:
        # エラーハンドラーのインポートがない場合、新しいインポートステートメントを追加
        import_statement = "import { logError } from '@/lib/utils/error-handler';\n"
        # 最初のimportステートメントの後に追加
        import_match = re.search(r"^import.*$", content, re.MULTILINE)
        if import_match:
            end_pos = import_match.end()
            # 最後のインポート行を探す
            all_imports = list(re.finditer(r"^import.*$", content, re.MULTILINE))
            if all_imports:
                end_pos = all_imports[-1].end()
            return content[:end_pos] + "\n" + import_statement + content[end_pos:]
        else:
            # インポートステートメントがない場合は先頭に追加
            return import_statement + content

def check_logger_import(content):
    """loggerがまだ他の目的で使用されているかチェック"""
    # logger.errorのパターン以外のlogger使用箇所を探す
    other_logger_uses = re.search(r'logger\.(info|warn|debug)', content)
    return bool(other_logger_uses)

def remove_logger_import(content):
    """loggerのインポートを削除（他に使用箇所がない場合）"""
    if check_logger_import(content):
        return content  # 他にもlogger使用箇所があれば削除しない
    
    # logger単独インポートを削除
    content = re.sub(
        r"import\s+\{\s*logger\s*\}\s+from\s+['\"].*?utils/logger['\"];\s*\n",
        "",
        content
    )
    
    # 複数インポート内のloggerを削除
    content = re.sub(
        r"import\s+\{(.*),\s*logger(,.*?)?\}\s+from\s+(['\"].*?utils/logger['\"]);\s*\n",
        r"import {\1\2} from \3;\n",
        content
    )
    
    # 最後のインポート要素としてのloggerを削除
    content = re.sub(
        r"import\s+\{(.*),\s*logger\}\s+from\s+(['\"].*?utils/logger['\"]);\s*\n",
        r"import {\1} from \2;\n",
        content
    )
    
    # 空のインポート文を削除
    content = re.sub(
        r"import\s+\{\s*\}\s+from\s+['\"].*?utils/logger['\"];\s*\n",
        "",
        content
    )
    
    return content

def modify_catch_blocks(content):
    """catch(error)ブロックのエラーを適切に型付け"""
    # catch (error) パターンを探して修正
    content = re.sub(
        r"catch\s*\(\s*error\s*\)",
        r"catch (error: unknown)",
        content
    )
    return content

def process_file(file_path):
    """ファイルを処理してロガー呼び出しを修正"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # 元のコンテンツを保存
        original_content = content
        
        # logger.errorがあるか確認
        if "logger.error" in content:
            # logger.errorをlogErrorに置き換え
            content = replace_logger_with_logerror(content)
            
            # error-handlerインポートの追加
            content = add_error_handler_import(content)
            
            # loggerインポートの削除（必要に応じて）
            content = remove_logger_import(content)
            
            # catch (error)ブロックの修正
            content = modify_catch_blocks(content)
        
        # 変更があった場合のみ書き込み
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False
    
    return False

def process_directories(directories):
    """指定されたディレクトリ内のすべてのTypeScriptファイルを処理"""
    modified_files = []
    
    for directory in directories:
        if not os.path.exists(directory):
            print(f"警告: ディレクトリが存在しません: {directory}")
            continue
            
        for file_path in glob.glob(f"{directory}/**/*.ts", recursive=True):
            if process_file(file_path):
                modified_files.append(file_path)
    
    return modified_files

if __name__ == "__main__":
    # コマンドライン引数からディレクトリを取得するか、デフォルト値を使用
    if len(sys.argv) > 1:
        directories = sys.argv[1:]
    else:
        # デフォルトディレクトリ
        directories = [
            "src/lib/storage",
            "src/lib/deployment",
            "src/lib/monitoring",
            "src/lib/cache"
        ]
    
    modified_files = process_directories(directories)
    
    print(f"{len(modified_files)}ファイルを変換しました:")
    for file in modified_files:
        print(f"- {file}")