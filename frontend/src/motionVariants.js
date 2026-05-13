// src/motionVariants.js
// Centralized Framer Motion animation variants for glassmorphic e-commerce UI

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.25 } }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -24, transition: { duration: 0.25 } }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3 } }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.3 } }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

export const staggerGrid = {
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

// glassReveal: opacity + subtle y/scale only — filter:blur() removed (causes full repaints every frame)
export const glassReveal = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.25 } }
};

export const scaleGlass = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }
};

export const cardHover = {
  whileHover: {
    scale: 1.03,
    y: -6,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.15 }
  }
};

export const glassCardHover = {
  whileHover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.15), 0 0 30px rgba(34, 197, 94, 0.08)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.15 }
  }
};

export const buttonAnim = {
  whileHover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const glowButton = {
  whileHover: {
    scale: 1.05,
    boxShadow: '0 0 25px rgba(99, 102, 241, 0.4), 0 0 50px rgba(99, 102, 241, 0.15)',
    transition: { duration: 0.25 }
  },
  whileTap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const modalAnim = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } }
};

export const overlayAnim = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } }
};

export const stickyNav = {
  initial: { y: -60, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } }
};

export const cartBounce = {
  animate: { scale: [1, 1.15, 0.95, 1], transition: { duration: 0.4, times: [0, 0.2, 0.6, 1] } }
};

export const slideInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.25 } }
};

// heroFloat: reduced amplitude + slower cycle = fewer repaints per second
export const heroFloat = {
  animate: {
    y: [0, -5, 0],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
  }
};

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' }
  }
};

export const navItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};
