import type { Easing } from 'framer-motion';

declare module 'framer-motion' {
  export interface Variants {
    [key: string]: Variant | undefined;
  }
}

// Type augmentation for easeOut
const easeOut: Easing = 'easeOut';
const easeIn: Easing = 'easeIn';
const easeInOut: Easing = 'easeInOut';
const linear: Easing = 'linear';

export { easeOut, easeIn, easeInOut, linear };

