/** Who a licensed photograph is credited to. Never sent with a question: see backend/src/metas/image-credit.ts. */
export interface ImageCredit {
  author: string | null;
  license: string | null;
  sourceUrl: string | null;
}
