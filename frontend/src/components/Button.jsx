// src/components/Button.jsx
import { motion } from "framer-motion";
import { buttonAnim } from "../motionVariants";

/**
 * Reusable animated button for modern e-commerce UI
 * Props: children, className, onClick, type, ...rest
 */
const Button = ({ children, className = "", onClick, type = "button", ...rest }) => (
  <motion.button
    type={type}
    className={`animated-btn ${className}`}
    whileHover={buttonAnim.whileHover}
    whileTap={buttonAnim.whileTap}
    onClick={onClick}
    {...rest}
  >
    {children}
  </motion.button>
);

export default Button;
