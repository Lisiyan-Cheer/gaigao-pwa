export type CamouflageMode = 'normal' | 'gooood' | 'vscode' | 'confluence';

export interface CamouflageSettings {
  mode: CamouflageMode;
  codeWrapper: boolean;
  fakeFileName: string;
}
