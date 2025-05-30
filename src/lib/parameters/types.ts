import { SystemParameters, ParameterPreset } from '../../types/parameters';

/**
 * パラメータマネージャーのインターフェース定義
 * パラメータ管理システムの公開APIを定義
 */
export interface IParameterManager {
  /**
   * 初期化処理を実行
   * 各種ファイルの読み込みとデータの準備を行う
   */
  initialize(): Promise<void>;
  
  /**
   * 現在のパラメータを取得
   * @returns 現在のパラメータのコピー
   */
  getParameters(): SystemParameters;
  
  /**
   * 指定されたファイルからパラメータを読み込む
   * @param filePath パラメータファイルのパス
   * @returns 読み込まれたパラメータ
   */
  loadParameters(filePath: string): Promise<SystemParameters>;
  
  /**
   * 現在のパラメータをファイルに保存
   * @param filePath 保存先ファイルパス（省略時はデフォルト）
   * @returns 保存成功時にtrue
   */
  saveParameters(filePath?: string): Promise<boolean>;
  
  /**
   * JSONテキストからパラメータをインポート
   * @param jsonContent JSONテキスト
   * @returns インポート成功時にtrue
   */
  importParameters(jsonContent: string): Promise<boolean>;
  
  /**
   * 現在のパラメータをJSON形式にエクスポート
   * @returns エクスポートされたJSONテキスト
   */
  exportParameters(): string;
  
  /**
   * 単一パラメータの値を更新
   * @param path パラメータのパス（ドット区切り）
   * @param value 新しい値
   */
  updateParameter(path: string, value: any): void;
  
  /**
   * すべてのパラメータをデフォルト値にリセット
   */
  resetToDefaults(): void;
  
  /**
   * 指定されたプリセットを適用
   * @param presetName プリセット名
   * @returns 適用成功時にtrue
   */
  applyPreset(presetName: string): boolean;
  
  /**
   * 現在のパラメータをプリセットとして保存
   * @param name プリセット名
   * @param description プリセットの説明
   * @returns 保存成功時にtrue
   */
  saveAsPreset(name: string, description?: string): Promise<boolean>;
  
  /**
   * 利用可能なプリセット名の一覧を取得
   * @returns プリセット名の配列
   */
  getPresets(): string[];
  
  /**
   * 利用可能なプリセットの詳細情報を取得
   * @returns プリセット情報の配列
   */
  getPresetDetails(): ParameterPreset[];
  
  /**
   * パラメータ変更イベントの購読
   * @param callback 変更通知を受け取るコールバック関数
   */
  onParameterChanged(callback: (path: string, value: any) => void): void;
  
  /**
   * パラメータ変更リスナーの削除
   * @param callback 削除するコールバック関数
   */
  removeParameterChangedListener(callback: (path: string, value: any) => void): void;
}