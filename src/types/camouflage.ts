export type CamouflageMode = 'normal' | 'vscode' | 'confluence';

export interface CamouflageSettings {
  mode: CamouflageMode;
  codeWrapper: boolean; // whether to wrap novel text with fake code comment headers
  fakeFileName: string;
}
