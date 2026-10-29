export interface Annotation {
  id: string;
  index: number; // 1, 2, 3...
  text: string; // The quoted text
  startIndex: number;
  endIndex: number;
  comment: string;
  status: 'active' | 'orphaned'; // orphaned if text was deleted
  createdAt: number;
}

export interface Chapter {
  id: string;
  bookName: string;
  chapterNum: string;
  title: string;
  content: string;
  annotations: Annotation[];
  updatedAt: number;
  createdAt: number;
}

export interface TextMetrics {
  charsNoSpaces: number;
  charsWithSpaces: number;
  cjkChars: number;
  words: number;
  paragraphs: number;
  avgParagraphChars: number;
}
