// src/components/CartDrawer.jsx
import { motion, AnimatePresence } from "framer-motion";
import { modalAnim, overlayAnim } from "../motionVariants";

/**
 * Animated cart drawer/modal for modern e-commerce UI
 * Props: open (bool), onClose (func), children
 */
const CartDrawer = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="drawer-overlay"
          variants={overlayAnim}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000 }}
        />
        <motion.aside
          className="cart-drawer"
          variants={modalAnim}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ position: 'fixed', top: 0, right: 0, width: 380, height: '100%', background: '#fff', zIndex: 1100, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}
        >
          {children}
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

export default CartDrawer;
