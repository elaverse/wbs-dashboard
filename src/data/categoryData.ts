/** 카테고리 데이터 - WBS 카테고리 선택 옵션 */
export const CATEGORY_OPTIONS = [
  '서비스개발',
  '운영관리',
  '운영효율화',
  '기술개발(R&D)',
  '품질관리',
  '거버넌스',
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];
