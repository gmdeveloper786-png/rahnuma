import type { StaticImageData } from 'next/image';

import heroBannerImg from '@/src/assets/images/hero_counselling_studio.jpg';
import muftiSeniorImg from '@/public/assets/aistudio/Mufti Muhammad Qasim Attari.png';
import muftiBilalImg from '@/public/assets/aistudio/Mufti Muhammad Shafiq Attari.png';
import femalePrivacyAvatarImg from '@/src/assets/images/avatar_female_privacy.jpg';
import psychologistMaleImg from '@/src/assets/images/avatar_psychologist_male_1795505647032.jpg';
import knowledgeBooksImg from '@/src/assets/images/knowledge_editorial_books_1795505647423.jpg';
import slideDomesticAbuseImg from '@/src/assets/images/slide-1.png';
import slideChildAbuseImg from '@/src/assets/images/slide-2.jpg';
import slideKhulaImg from '@/src/assets/images/slide-3.jpg';
import slideDivorceImg from '@/src/assets/images/sldie-4.png';
import slideMarriageNikahImg from '@/src/assets/images/slide-5.png';

export type MediaImageKey =
  | 'hero'
  | 'mufti'
  | 'mufti_bilal'
  | 'counsellor'
  | 'psychologist'
  | 'legal'
  | 'books'
  | 'slide_domestic_abuse'
  | 'slide_child_abuse'
  | 'slide_khula'
  | 'slide_divorce'
  | 'slide_marriage_nikah';

export const MEDIA_ASSETS: Record<MediaImageKey, StaticImageData> = {
  hero: heroBannerImg,
  mufti: muftiSeniorImg,
  mufti_bilal: muftiBilalImg,
  // Single faceless privacy-compliant avatar used for all female practitioners
  counsellor: femalePrivacyAvatarImg,
  psychologist: psychologistMaleImg,
  legal: femalePrivacyAvatarImg,
  books: knowledgeBooksImg,
  slide_domestic_abuse: slideDomesticAbuseImg,
  slide_child_abuse: slideChildAbuseImg,
  slide_khula: slideKhulaImg,
  slide_divorce: slideDivorceImg,
  slide_marriage_nikah: slideMarriageNikahImg,
};
