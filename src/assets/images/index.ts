// ─────────────────────────────────────────────────────────────
//  IMAGE CONFIG — src/assets/images/index.ts
//
//  HOW TO ADD YOUR OWN IMAGES:
//  1. Drop your image files into this folder (src/assets/images/)
//  2. Uncomment and update the imports below
//  3. Replace the `src` placeholder strings with your imports
//
//  Example:
//    import slide1 from './gym1.jpg'
//    export const heroSlides: HeroSlide[] = [
//      { src: slide1, label: 'MUSCLE MATRIX', sub: 'Built for champions' },
//    ]
// ─────────────────────────────────────────────────────────────

export interface HeroSlide {
  src: string;
  label: string;
  sub: string;
}

// import slide1 from './slide1.jpg'
// import slide2 from './slide2.jpg'
// import slide3 from './slide3.jpg'
// import slide4 from './slide4.jpg'

export const heroSlides: HeroSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1400&h=700&fit=crop',
    label: 'MUSCLE MATRIX',
    sub: 'Premium Gym Products & Supplements',
  },
  {
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=700&fit=crop',
    label: 'STRENGTH',
    sub: 'Train harder. Recover faster.',
  },
  {
    src: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=1400&h=700&fit=crop',
    label: 'POWER',
    sub: 'Wholesale & retail in one platform.',
  },
  {
    src: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=1400&h=700&fit=crop',
    label: 'DEDICATION',
    sub: 'Built for champions.',
  },
];