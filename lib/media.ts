import type { StaticImageData } from 'next/image';

import heroBannerImg from '@/src/assets/images/hero_counselling_studio.jpg';
import muftiSeniorImg from '@/public/assets/aistudio/Mufti Muhammad Qasim Attari.png';
import muftiBilalImg from '@/public/assets/aistudio/Mufti Muhammad Shafiq Attari.png';
import femalePrivacyAvatarImg from '@/src/assets/images/avatar_female_privacy.jpg';
import psychologistMaleImg from '@/src/assets/images/avatar_psychologist_male_1795505647032.jpg';
import knowledgeBooksImg from '@/src/assets/images/knowledge_editorial_books_1795505647423.jpg';

export type MediaImageKey =
  | 'hero'
  | 'mufti'
  | 'mufti_bilal'
  | 'counsellor'
  | 'psychologist'
  | 'legal'
  | 'books';

export const MEDIA_ASSETS: Record<MediaImageKey, StaticImageData> = {
  hero: heroBannerImg,
  mufti: muftiSeniorImg,
  mufti_bilal: muftiBilalImg,
  // Single faceless privacy-compliant avatar used for all female practitioners
  counsellor: femalePrivacyAvatarImg,
  psychologist: psychologistMaleImg,
  legal: femalePrivacyAvatarImg,
  books: knowledgeBooksImg,
};
