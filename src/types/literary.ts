/**
 * @fileoverview 文学的インスピレーション関連の型定義
 */

export interface LiteraryGuideline {
  id: string;
  technique: string;
  description: string;
  example: string;
  reference: string;
  applicableContexts: string[];
}

export interface LiteraryGuidelinesData {
  [genre: string]: LiteraryGuideline[];
}

export interface JudgmentAxis {
  key: string;
  priority: number;
  extractor: () => Promise<any>;
  formatter: (data: any) => string;
  validator?: (data: any) => boolean;
}

export interface CollectedContext {
  axisKey: string;
  formattedText: string;
  rawData: any;
  priority: number;
}

export interface LiteraryInspiration {
  plotTechniques: LiteraryTechnique[];
  characterTechniques: LiteraryTechnique[];
  atmosphereTechniques: LiteraryTechnique[];
}

export interface LiteraryTechnique {
  technique: string;
  description: string;
  example: string;
  reference: string;
}
