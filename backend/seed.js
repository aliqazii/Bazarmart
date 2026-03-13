import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import Order from "./models/orderModel.js";

dotenv.config();

const defaultShoeSizes = ["39", "40", "41", "42", "43", "44"];

const inferSeedColorName = (title = "") => {
  const normalized = String(title).toLowerCase();
  if (normalized.includes("black")) return "Black";
  if (normalized.includes("white")) return "White";
  if (normalized.includes("blue")) return "Blue";
  if (normalized.includes("red")) return "Red";
  if (normalized.includes("green")) return "Green";
  if (normalized.includes("pink")) return "Pink";
  if (normalized.includes("brown")) return "Brown";
  if (normalized.includes("silver")) return "Silver";
  if (normalized.includes("gold") || normalized.includes("golden")) return "Gold";
  if (normalized.includes("beige")) return "Beige";
  return "Default";
};

const inferSeedSwatch = (colorName = "Default") => {
  const swatches = {
    Black: "#111111",
    White: "#f5f5f5",
    Blue: "#2563eb",
    Red: "#dc2626",
    Green: "#059669",
    Pink: "#ec4899",
    Brown: "#8b5e3c",
    Silver: "#c0c0c0",
    Gold: "#d4a017",
    Beige: "#d6b48a",
    Default: "#374151",
  };
  return swatches[colorName] || swatches.Default;
};

// ── DummyJSON category → our store category mapping ──────
const categoryMapping = {
  laptops: "Electronics",
  smartphones: "Electronics",
  "mobile-accessories": "Electronics",
  tablets: "Electronics",
  "mens-shirts": "Clothing",
  tops: "Clothing",
  "womens-dresses": "Clothing",
  "mens-shoes": "Shoes",
  "womens-shoes": "Shoes",
  sunglasses: "Accessories",
  "womens-bags": "Accessories",
  "womens-jewellery": "Accessories",
  "mens-watches": "Accessories",
  "womens-watches": "Accessories",
  beauty: "Accessories",
  fragrances: "Accessories",
  "skin-care": "Accessories",
  "home-decoration": "Home",
  furniture: "Home",
  "kitchen-accessories": "Home",
  "sports-accessories": "Sports",
};

// ── Detailed electronics specs (keyed by DummyJSON title) ──
const electronicsSpecs = {
  // Laptops
  "Apple MacBook Pro 14 Inch Space Grey": "Model: MacBook Pro 14\" (M3 Pro) | Display: 14.2\" Liquid Retina XDR, 3024×1964, 120Hz ProMotion | Chip: Apple M3 Pro (11-core CPU, 14-core GPU) | RAM: 18 GB unified | Storage: 512 GB SSD | Battery: 70 Wh, up to 17 hrs | Weight: 1.60 kg | Ports: 3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3 | OS: macOS Sonoma",
  "Asus Zenbook Pro Dual Screen Laptop": "Model: Zenbook Pro 14 Duo OLED (UX8402) | Display: 14.5\" 2.8K OLED 120Hz + 12.7\" ScreenPad Plus | Processor: Intel Core i9-13900H (14 cores, 5.4 GHz) | RAM: 32 GB DDR5 | Storage: 1 TB PCIe 4.0 SSD | GPU: NVIDIA RTX 4060 (8 GB) | Battery: 76 Wh, up to 9.5 hrs | Weight: 1.75 kg | Ports: 2× Thunderbolt 4, USB-A, HDMI 2.1",
  "Huawei Matebook X Pro": "Model: MateBook X Pro 2023 | Display: 14.2\" 3.1K LTPS, 90Hz, 500 nits, 100% sRGB | Processor: Intel Core i7-1360P (12 cores) | RAM: 16 GB LPDDR5 | Storage: 512 GB NVMe SSD | GPU: Intel Iris Xe | Battery: 60 Wh, up to 13 hrs | Weight: 1.26 kg | Ports: 4× USB-C (2× Thunderbolt 4) | Fingerprint power button",
  "Lenovo Yoga 920": "Model: Yoga 920-13IKB | Display: 13.9\" 4K UHD IPS touchscreen, 3840×2160 | Processor: Intel Core i7-8550U (4 cores, 4.0 GHz) | RAM: 16 GB DDR4 | Storage: 512 GB PCIe SSD | GPU: Intel UHD 620 | Battery: 70 Wh, up to 15.5 hrs | Weight: 1.37 kg | Features: 360° hinge, Garaged stylus pen, Dolby Atmos speakers",
  "New DELL XPS 13 9300 Laptop": "Model: XPS 13 9300 | Display: 13.4\" FHD+ InfinityEdge (1920×1200), 500 nits, anti-reflective | Processor: Intel Core i7-1065G7 (4 cores, 3.9 GHz) | RAM: 16 GB LPDDR4x | Storage: 512 GB PCIe SSD | GPU: Intel Iris Plus | Battery: 52 Wh, up to 12 hrs | Weight: 1.20 kg | Ports: 2× Thunderbolt 3, microSD",

  // Smartphones
  "iPhone 5s": "Model: A1533 | Display: 4.0\" IPS Retina, 1136×640, 326 ppi | Chip: Apple A7 (64-bit) | RAM: 1 GB | Storage: 16/32/64 GB | Rear Camera: 8 MP, f/2.2, True Tone flash | Front Camera: 1.2 MP | Battery: 1560 mAh, up to 10 hrs talk time | OS: iOS 12 (max) | Features: Touch ID (1st gen), aluminum body",
  "iPhone 6": "Model: A1549 | Display: 4.7\" IPS Retina HD, 1334×750, 326 ppi | Chip: Apple A8 (Dual-core 1.4 GHz) | RAM: 1 GB | Storage: 16/64/128 GB | Rear Camera: 8 MP, f/2.2, OIS | Front Camera: 1.2 MP | Battery: 1810 mAh, up to 14 hrs talk time | OS: iOS 12 (max) | Features: Touch ID, NFC (Apple Pay)",
  "iPhone 13 Pro": "Model: A2483 | Display: 6.1\" Super Retina XDR OLED, 2532×1170, 120Hz ProMotion, 1000 nits | Chip: Apple A15 Bionic (6-core) | RAM: 6 GB | Storage: 128/256/512 GB/1 TB | Rear Camera: Triple 12 MP (Wide f/1.5 + Ultra Wide + Telephoto 3×) | Front Camera: 12 MP TrueDepth | Battery: 3095 mAh, up to 22 hrs video | 5G | Features: Ceramic Shield, IP68, MagSafe, Cinematic mode",
  "iPhone X": "Model: A1865 | Display: 5.8\" Super Retina OLED, 2436×1125, 458 ppi, HDR10, Dolby Vision | Chip: Apple A11 Bionic (6-core) | RAM: 3 GB | Storage: 64/256 GB | Rear Camera: Dual 12 MP (Wide f/1.8 + Telephoto f/2.4, 2× optical zoom) | Front Camera: 7 MP TrueDepth | Battery: 2716 mAh, up to 21 hrs talk time | Features: Face ID, Animoji, IP67, wireless charging",
  "Oppo A57": "Model: OPPO A57 (CPH2387) | Display: 6.56\" HD+ IPS, 1612×720, 60Hz | Processor: MediaTek Helio G35 (Octa-core 2.3 GHz) | RAM: 4 GB | Storage: 64 GB (expandable to 1 TB) | Rear Camera: 13 MP + 2 MP depth | Front Camera: 8 MP | Battery: 5000 mAh, 33W SuperVOOC fast charging | OS: Android 12 (ColorOS 12.1) | Features: Side fingerprint, Face unlock",
  "Oppo F19 Pro Plus": "Model: OPPO F19 Pro+ 5G (CPH2213) | Display: 6.43\" FHD+ AMOLED, 2400×1080, 60Hz, in-display fingerprint | Processor: MediaTek Dimensity 800U (5G, Octa-core 2.4 GHz) | RAM: 8 GB | Storage: 128 GB (expandable) | Rear Camera: 48 MP + 8 MP ultra-wide + 2 MP macro + 2 MP depth | Front Camera: 16 MP | Battery: 4310 mAh, 50W Flash Charge (full in 48 min) | OS: Android 11 (ColorOS 11.1)",
  "Oppo K1": "Model: OPPO K1 (CPH1893) | Display: 6.4\" FHD+ AMOLED, 2340×1080, in-display fingerprint | Processor: Snapdragon 660 (Octa-core 2.2 GHz) | RAM: 4 GB | Storage: 64 GB (expandable to 256 GB) | Rear Camera: 16 MP + 2 MP depth | Front Camera: 25 MP AI Beautification | Battery: 3600 mAh | OS: Android 9 (ColorOS 5.2) | Features: Waterdrop notch, AI scene recognition",
  "Realme C35": "Model: Realme C35 (RMX3511) | Display: 6.6\" FHD+ IPS, 2408×1080, 60Hz | Processor: Unisoc T616 (Octa-core 2.0 GHz) | RAM: 4 GB | Storage: 64/128 GB (expandable to 1 TB) | Rear Camera: 50 MP + 2 MP macro + 0.3 MP depth | Front Camera: 8 MP | Battery: 5000 mAh, 18W fast charging | OS: Android 11 (Realme UI R Edition) | Weight: 189 g",
  "Realme X": "Model: Realme X (RMX1901) | Display: 6.53\" FHD+ AMOLED, 2340×1080, in-display fingerprint | Processor: Snapdragon 710 (Octa-core 2.2 GHz) | RAM: 4/8 GB | Storage: 64/128 GB | Rear Camera: 48 MP + 5 MP depth | Front Camera: 16 MP pop-up | Battery: 3765 mAh, 20W VOOC 3.0 fast charging | OS: Android 9 (ColorOS 6) | Features: Motorized pop-up selfie camera",
  "Realme XT": "Model: Realme XT (RMX1921) | Display: 6.4\" FHD+ Super AMOLED, 2340×1080, Gorilla Glass 5 | Processor: Snapdragon 712 (Octa-core 2.3 GHz) | RAM: 4/6/8 GB | Storage: 64/128 GB | Rear Camera: 64 MP + 8 MP ultra-wide + 2 MP macro + 2 MP depth | Front Camera: 16 MP | Battery: 4000 mAh, 20W VOOC fast charging | OS: Android 9 (ColorOS 6) | Features: First 64 MP quad-camera phone",
  "Samsung Galaxy S7": "Model: SM-G930 | Display: 5.1\" Quad HD Super AMOLED, 2560×1440, 577 ppi, Always-On Display | Processor: Exynos 8890 (Octa-core 2.3 GHz) | RAM: 4 GB | Storage: 32 GB (expandable to 200 GB) | Rear Camera: 12 MP Dual Pixel, f/1.7, OIS | Front Camera: 5 MP | Battery: 3000 mAh, fast + wireless charging | OS: Android 8 | Features: IP68 waterproof, Samsung Pay",
  "Samsung Galaxy S8": "Model: SM-G950 | Display: 5.8\" Quad HD+ Super AMOLED Infinity Display, 2960×1440, 570 ppi, HDR10 | Processor: Exynos 8895 (Octa-core 2.3 GHz) | RAM: 4 GB | Storage: 64 GB (expandable to 256 GB) | Rear Camera: 12 MP Dual Pixel, f/1.7, OIS | Front Camera: 8 MP, f/1.7 | Battery: 3000 mAh, fast + wireless charging | OS: Android 9 | Features: Iris scanner, IP68, Bixby, DeX support",
  "Samsung Galaxy S10": "Model: SM-G973 | Display: 6.1\" Quad HD+ Dynamic AMOLED, 3040×1440, HDR10+, 550 nits | Processor: Exynos 9820 (Octa-core 2.7 GHz) | RAM: 8 GB | Storage: 128/512 GB (expandable to 512 GB) | Rear Camera: Triple — 12 MP wide (f/1.5-2.4) + 12 MP telephoto + 16 MP ultra-wide | Front Camera: 10 MP | Battery: 3400 mAh, fast + wireless + reverse charging | OS: Android 12 | Features: Ultrasonic fingerprint, IP68, Wi-Fi 6",
  "Vivo S1": "Model: Vivo S1 (V1907) | Display: 6.38\" FHD+ Super AMOLED, 2340×1080, in-display fingerprint | Processor: MediaTek Helio P65 (Octa-core 2.0 GHz) | RAM: 4/6 GB | Storage: 64/128 GB (expandable to 256 GB) | Rear Camera: 16 MP + 8 MP ultra-wide + 2 MP depth | Front Camera: 32 MP | Battery: 4500 mAh, 18W Dual Engine fast charging | OS: Android 9 (Funtouch OS 9)",
  "Vivo V9": "Model: Vivo V9 (V1723) | Display: 6.3\" FHD+ IPS FullView, 2280×1080, 19:9 notch | Processor: Snapdragon 626 (Octa-core 2.2 GHz) | RAM: 4 GB | Storage: 64 GB (expandable to 256 GB) | Rear Camera: 16 MP + 5 MP depth, f/2.0 | Front Camera: 24 MP AI Beautification | Battery: 3260 mAh | OS: Android 8.1 (Funtouch OS 4.0) | Features: Face Access, AI-powered camera",
  "Vivo X21": "Model: Vivo X21 (V1801) | Display: 6.28\" FHD+ Super AMOLED, 2280×1080, in-display fingerprint (1st gen) | Processor: Snapdragon 660 (Octa-core 2.2 GHz) | RAM: 6 GB | Storage: 128 GB (expandable to 256 GB) | Rear Camera: 12 MP Dual Pixel + 5 MP depth, f/1.8 | Front Camera: 12 MP AI lighting | Battery: 3200 mAh, 18W fast charging | OS: Android 8.1 (Funtouch OS 4.0) | Features: World's first in-display fingerprint phone, AI face beauty",

  // Tablets
  "iPad Mini 2021 Starlight": "Model: iPad mini (6th gen, A2567) | Display: 8.3\" Liquid Retina IPS, 2266×1488, 326 ppi, 500 nits, True Tone, P3 wide color | Chip: Apple A15 Bionic (6-core CPU, 5-core GPU) | RAM: 4 GB | Storage: 64/256 GB | Rear Camera: 12 MP, f/1.8, Smart HDR 3, 4K video | Front Camera: 12 MP Ultra Wide, Center Stage | Battery: 19.3 Wh, up to 10 hrs | Connectivity: Wi-Fi 6, USB-C, optional 5G | Features: Apple Pencil 2 support, Touch ID top button | Weight: 293 g",
  "Samsung Galaxy Tab S8 Plus Grey": "Model: SM-X800 | Display: 12.4\" Super AMOLED, 2800×1752, 120Hz, HDR10+, 420 nits | Processor: Snapdragon 8 Gen 1 (Octa-core 3.0 GHz) | RAM: 8 GB | Storage: 128/256 GB (expandable to 1 TB) | Rear Camera: 13 MP + 6 MP ultra-wide | Front Camera: 12 MP | Battery: 10090 mAh, 45W fast charging | S Pen included | OS: Android 12 (One UI 4.1) | Weight: 567 g | Features: DeX mode, quad speakers by AKG",
  "Samsung Galaxy Tab White": "Model: SM-T295 (Galaxy Tab A 8.0) | Display: 8.0\" TFT, 1280×800, 189 ppi | Processor: Snapdragon 429 (Quad-core 2.0 GHz) | RAM: 2 GB | Storage: 32 GB (expandable to 512 GB) | Rear Camera: 8 MP | Front Camera: 2 MP | Battery: 5100 mAh, up to 11 hrs video | OS: Android 11 | Connectivity: Wi-Fi + LTE | Weight: 345 g",

  // Mobile Accessories
  "Amazon Echo Plus": "Model: Echo Plus (2nd Gen) | Speaker: 3\" woofer + 0.8\" tweeter, Dolby processing | Connectivity: Wi-Fi (dual-band), Bluetooth 4.2, Zigbee smart home hub | Voice: Amazon Alexa built-in | Features: Built-in temperature sensor, 7-microphone array, far-field voice recognition | Power: 15W adapter | Dimensions: 148 × 99 mm | Weight: 780 g",
  "Apple Airpods": "Model: AirPods (3rd Gen, A2564) | Audio: Apple H1 chip, Adaptive EQ, Spatial Audio with head tracking | Battery: Up to 6 hrs listening, 30 hrs with MagSafe case | Charging: Lightning + MagSafe wireless | Connectivity: Bluetooth 5.0 | Water Resistance: IPX4 (sweat/water resistant) | Features: Force sensor controls, skin-detect sensor, auto-switching | Weight: 4.28 g per earbud",
  "Apple AirPods Max Silver": "Model: AirPods Max (A2096) | Audio: Apple H1 chip (×2), 40mm custom driver, Active Noise Cancellation, Spatial Audio with Dolby Atmos | Battery: Up to 20 hrs with ANC on | Charging: Lightning, 5 min = 1.5 hrs playback | Connectivity: Bluetooth 5.0 | Features: Digital Crown, Transparency mode, computational audio, aluminum ear cups, stainless steel headband | Weight: 384.8 g",
  "Apple Airpower Wireless Charger": "Model: MagSafe Charger (A2140) | Charging: Up to 15W MagSafe for iPhone, 7.5W Qi compatible | Compatibility: iPhone 12 and later, AirPods (wireless case) | Cable: 1m USB-C cable attached | Features: Perfectly aligned magnets, snap-on charging",
  "Apple HomePod Mini Cosmic Grey": "Model: HomePod mini (A2374) | Audio: Full-range driver + dual passive radiators, computational audio | Voice: Siri built-in (7-microphone array) | Connectivity: Wi-Fi 5, Bluetooth 5.0, Thread, UWB (U1 chip) | Features: Intercom, stereo pairing, multi-room audio, smart home hub | Power: 20W adapter | Dimensions: 84.3 × 97.9 mm | Weight: 345 g",
  "Apple iPhone Charger": "Model: 20W USB-C Power Adapter (A2305) | Input: 100–240V AC | Output: 9V/2.22A (20W) or 5V/3A (15W) | Connector: USB-C | Compatibility: iPhone 8 and later, iPad, AirPods | Features: Fast charging (50% in 30 min with USB-C to Lightning cable) | Weight: 60 g",
  "Apple MagSafe Battery Pack": "Model: MagSafe Battery Pack (A2384) | Capacity: 1460 mAh (11.13 Wh) | Charging: 5W wireless (on-the-go), 15W when connected to 20W+ adapter | Compatibility: iPhone 12 and later | Connector: Lightning (for recharging pack) | Features: Magnetic alignment, auto charge management | Dimensions: 95.8 × 64.8 × 11.3 mm | Weight: 115 g | Reverse charging supported",
  "Apple Watch Series 4 Gold": "Model: A1977 | Display: 1.78\" LTPO OLED Retina (44mm), 368×448, 1000 nits | Chip: Apple S4 (64-bit dual-core) | Storage: 16 GB | Sensors: Heart rate (optical + electrical ECG), accelerometer, gyroscope, barometric altimeter | Battery: Up to 18 hrs | Water Resistance: WR50 (swim-proof) | Connectivity: Wi-Fi, Bluetooth 5.0, GPS, optional LTE | Features: Fall detection, ECG app, Digital Crown with haptic feedback | Weight: 36.7 g",
  "Beats Flex Wireless Earphones": "Model: Beats Flex (A2295) | Audio: Apple W1 chip, dual-chamber driver, Laser-cut micro-venting | Battery: Up to 12 hrs playback, 10 min Fast Fuel = 1.5 hrs | Charging: USB-C | Connectivity: Bluetooth Class 1 | Features: Magnetic earbuds auto play/pause, RemoteTalk cable mic, shared audio (Audio Sharing) | Weight: 18.6 g",
  "iPhone 12 Silicone Case with MagSafe Plum": "Model: MagSafe Silicone Case (MHL23ZM/A) | Material: Soft-touch silicone exterior, microfiber lining interior | Compatibility: iPhone 12 / 12 Pro | MagSafe: Built-in magnets for snap-on fit, compatible with all MagSafe accessories | Features: Wireless charging compatible, scratch-resistant | Available Colors: Plum, Black, White, Blue, Green, Red",
  "Monopod": "Type: Bluetooth Selfie Monopod | Material: Aluminum alloy | Extended Length: 80 cm | Collapsed: 19 cm | Compatibility: iOS & Android (Bluetooth 3.0+) | Features: Built-in Bluetooth shutter button, 270° adjustable head, anti-slip grip | Battery: Built-in Li-ion, 50 hrs standby | Max Load: 500 g | Weight: 150 g",
  "Selfie Lamp with iPhone": "Type: LED Ring Light with Phone Holder | LEDs: 36 LEDs, 3 color modes (warm/cool/daylight) | Brightness: 10 adjustable levels | Power: USB rechargeable (1000 mAh built-in battery, 3 hrs use) | Mount: Flexible clip-on for phones up to 6.5\" | Features: Wide-angle lens attachment included, 360° rotation | Weight: 85 g",
  "Selfie Stick Monopod": "Type: Extendable Selfie Stick with Tripod | Material: Stainless steel + ABS | Extended Length: 100 cm | Collapsed: 22 cm | Features: Built-in Bluetooth remote (10m range), detachable tripod base, 360° phone holder | Compatibility: Phones 4.5\"–6.5\" | Battery: CR1632 (remote), 6 months standby | Max Load: 500 g | Weight: 180 g",
  "TV Studio Camera Pedestal": "Type: Professional Studio Camera Pedestal | Material: Heavy-duty aluminum + steel | Height Range: 75–155 cm (adjustable pneumatic column) | Base: Tri-wheel caster base with locks | Max Load: 45 kg | Head Mount: 100mm bowl mount | Features: Smooth pneumatic elevation, cable guards, level indicator | Weight: 25 kg",
};


// ── Books with Open Library ISBN covers ──────────────────
const books = [
  { name: "JavaScript: The Good Parts", description: "A deep dive into the beautiful parts of JavaScript, revealing the language's best features.", price: 29.99, stock: 40, ratings: 4.7, numOfReviews: 312, isbn: "0596517742" },
  { name: "Clean Code", description: "A handbook of agile software craftsmanship. Learn to write code that is clean, readable and maintainable.", price: 34.99, stock: 35, ratings: 4.8, numOfReviews: 456, isbn: "0132350882" },
  { name: "Design Patterns", description: "Elements of Reusable Object-Oriented Software by the Gang of Four.", price: 44.99, stock: 20, ratings: 4.5, numOfReviews: 198, isbn: "0201633612" },
  { name: "The Pragmatic Programmer", description: "Your journey to mastery. Classic advice on all aspects of the programming craft.", price: 39.99, stock: 30, ratings: 4.8, numOfReviews: 345, isbn: "020161622X" },
  { name: "You Don't Know JS Yet", description: "A deep exploration of core mechanisms in the JavaScript language.", price: 24.99, stock: 50, ratings: 4.6, numOfReviews: 234, isbn: "1491924462" },
  { name: "Eloquent JavaScript", description: "A modern introduction to programming with JavaScript, covering language fundamentals and browser APIs.", price: 27.99, stock: 45, ratings: 4.5, numOfReviews: 189, isbn: "1593279507" },
  { name: "Structure and Interpretation", description: "Foundational MIT textbook on computer science using Scheme programming language.", price: 49.99, stock: 15, ratings: 4.7, numOfReviews: 167, isbn: "0262510871" },
  { name: "Cracking the Coding Interview", description: "189 programming questions and solutions for tech interview preparation.", price: 35.99, stock: 60, ratings: 4.7, numOfReviews: 523, isbn: "0984782850" },
  { name: "Introduction to Algorithms", description: "Comprehensive reference on algorithms by Cormen, Leiserson, Rivest, and Stein.", price: 69.99, stock: 18, ratings: 4.4, numOfReviews: 145, isbn: "0262033844" },
  { name: "Refactoring", description: "Improving the design of existing code by Martin Fowler. A definitive guide.", price: 39.99, stock: 25, ratings: 4.6, numOfReviews: 201, isbn: "0134757599" },
  { name: "Head First Design Patterns", description: "A brain-friendly visual guide to design patterns in object-oriented programming.", price: 32.99, stock: 35, ratings: 4.5, numOfReviews: 278, isbn: "0596007124" },
  { name: "The Art of Computer Programming", description: "Knuth's legendary multi-volume series on computer science fundamentals.", price: 79.99, stock: 10, ratings: 4.9, numOfReviews: 89, isbn: "0201896834" },
  { name: "Learning React", description: "Modern patterns for developing React applications with hooks and functional components.", price: 29.99, stock: 40, ratings: 4.3, numOfReviews: 156, isbn: "1492051721" },
  { name: "Python Crash Course", description: "A hands-on project-based introduction to Python programming for beginners.", price: 26.99, stock: 55, ratings: 4.6, numOfReviews: 345, isbn: "1593279280" },
  { name: "System Design Interview", description: "Insider's guide to system design interviews with real-world architecture examples.", price: 36.99, stock: 30, ratings: 4.7, numOfReviews: 412, isbn: "1736049119" },
  { name: "Atomic Habits", description: "Tiny changes, remarkable results. A proven framework for improving every day.", price: 16.99, stock: 80, ratings: 4.8, numOfReviews: 1203, isbn: "0735211299" },
  { name: "Deep Work", description: "Rules for focused success in a distracted world by Cal Newport.", price: 14.99, stock: 65, ratings: 4.5, numOfReviews: 567, isbn: "1455586692" },
  { name: "Thinking, Fast and Slow", description: "Daniel Kahneman explores the two systems that drive the way we think.", price: 15.99, stock: 45, ratings: 4.6, numOfReviews: 890, isbn: "0374533555" },
  { name: "The Lean Startup", description: "How today's entrepreneurs use continuous innovation to create successful businesses.", price: 16.99, stock: 50, ratings: 4.4, numOfReviews: 678, isbn: "0307887898" },
  { name: "Sapiens", description: "A brief history of humankind by Yuval Noah Harari, covering 70,000 years of human evolution.", price: 17.99, stock: 55, ratings: 4.7, numOfReviews: 1456, isbn: "0062316095" },
  { name: "Educated: A Memoir", description: "Tara Westover's memoir about growing up in a survivalist family and finding education.", price: 14.99, stock: 40, ratings: 4.6, numOfReviews: 789, isbn: "0399590501" },
  { name: "Dune", description: "Frank Herbert's epic science fiction masterpiece set on the desert planet Arrakis.", price: 12.99, stock: 60, ratings: 4.7, numOfReviews: 1023, isbn: "0441013597" },
  { name: "The Great Gatsby", description: "F. Scott Fitzgerald's classic novel about the American dream in the Jazz Age.", price: 10.99, stock: 70, ratings: 4.4, numOfReviews: 2345, isbn: "0743273567" },
  { name: "1984", description: "George Orwell's dystopian masterpiece about totalitarianism and surveillance.", price: 11.99, stock: 75, ratings: 4.7, numOfReviews: 3456, isbn: "0451524934" },
  { name: "To Kill a Mockingbird", description: "Harper Lee's Pulitzer Prize-winning novel about racial injustice in the deep South.", price: 11.99, stock: 65, ratings: 4.8, numOfReviews: 2890, isbn: "0060935464" },
  { name: "The Alchemist", description: "Paulo Coelho's enchanting story about a shepherd's journey to find treasure.", price: 13.99, stock: 70, ratings: 4.5, numOfReviews: 1567, isbn: "0061122416" },
  { name: "Brave New World", description: "Aldous Huxley's visionary novel about a future world of genetically modified citizens.", price: 12.99, stock: 50, ratings: 4.5, numOfReviews: 1234, isbn: "0060850523" },
  { name: "The Catcher in the Rye", description: "J.D. Salinger's classic coming-of-age story narrated by Holden Caulfield.", price: 10.99, stock: 55, ratings: 4.3, numOfReviews: 1890, isbn: "0316769177" },
  { name: "Rich Dad Poor Dad", description: "Robert Kiyosaki's personal finance classic about financial literacy and wealth building.", price: 14.99, stock: 80, ratings: 4.5, numOfReviews: 2345, isbn: "1612680178" },
  { name: "The 48 Laws of Power", description: "Robert Greene's comprehensive guide to the fundamental laws of power and strategy.", price: 18.99, stock: 40, ratings: 4.4, numOfReviews: 1567, isbn: "0140280197" },
  { name: "Zero to One", description: "Peter Thiel's notes on startups and how to build a company that creates new things.", price: 16.99, stock: 45, ratings: 4.5, numOfReviews: 890, isbn: "0804139296" },
  { name: "The Subtle Art of Not Caring", description: "A counterintuitive approach to living a good life by Mark Manson.", price: 15.99, stock: 60, ratings: 4.3, numOfReviews: 1678, isbn: "0062457713" },
  { name: "Grit", description: "Angela Duckworth reveals why passion and persistence matter more than talent.", price: 14.99, stock: 35, ratings: 4.5, numOfReviews: 678, isbn: "1501111108" },
  { name: "The Power of Habit", description: "Charles Duhigg explores the science of habits and how they can be changed.", price: 15.99, stock: 50, ratings: 4.5, numOfReviews: 890, isbn: "081298160X" },
  { name: "Outliers", description: "Malcolm Gladwell examines what makes high achievers different from ordinary people.", price: 14.99, stock: 55, ratings: 4.4, numOfReviews: 1234, isbn: "0316017930" },
  { name: "Node.js Design Patterns", description: "Master best practices for building server-side applications with Node.js.", price: 39.99, stock: 20, ratings: 4.6, numOfReviews: 145, isbn: "1839214112" },
  { name: "The Mythical Man-Month", description: "Fred Brooks' classic essays on software engineering and project management.", price: 29.99, stock: 15, ratings: 4.5, numOfReviews: 234, isbn: "0201835959" },
  { name: "Code Complete", description: "Steve McConnell's practical handbook of software construction best practices.", price: 44.99, stock: 20, ratings: 4.6, numOfReviews: 312, isbn: "0735619670" },
  { name: "Don't Make Me Think", description: "Steve Krug's common sense approach to web and mobile usability design.", price: 25.99, stock: 40, ratings: 4.7, numOfReviews: 567, isbn: "0321965515" },
  { name: "Algorithms to Live By", description: "The computer science of human decisions, exploring how algorithms apply to daily life.", price: 15.99, stock: 35, ratings: 4.5, numOfReviews: 345, isbn: "1627790365" },
  { name: "Shoe Dog", description: "Phil Knight's memoir about the creation and growth of Nike from scratch.", price: 16.99, stock: 45, ratings: 4.7, numOfReviews: 890, isbn: "1501135910" },
  { name: "The Hitchhiker's Guide", description: "Douglas Adams' absurdly funny sci-fi comedy about the meaning of life.", price: 12.99, stock: 60, ratings: 4.6, numOfReviews: 2345, isbn: "0345391802" },
  { name: "Harry Potter Box Set", description: "The complete collection of J.K. Rowling's beloved Harry Potter series.", price: 54.99, stock: 25, ratings: 4.9, numOfReviews: 4567, isbn: "0545162076" },
  { name: "Lord of the Rings Trilogy", description: "J.R.R. Tolkien's epic high fantasy trilogy in one complete volume.", price: 24.99, stock: 30, ratings: 4.9, numOfReviews: 3456, isbn: "0618640150" },
  { name: "The Art of War", description: "Sun Tzu's ancient Chinese military treatise on strategy and tactics.", price: 9.99, stock: 65, ratings: 4.4, numOfReviews: 1890, isbn: "1590302257" },
];

// ── Seed Database ────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();
    console.log("Cleared existing data.");

    // Fetch real products from DummyJSON (each has matching images)
    console.log("Fetching products from DummyJSON...");
    const response = await fetch("https://dummyjson.com/products?limit=0");
    const data = await response.json();
    console.log(`Fetched ${data.products.length} products from DummyJSON.`);

    // Gender mapping for clothing DummyJSON categories
    const genderMapping = {
      "mens-shirts": "Men",
      tops: "Women",
      "womens-dresses": "Women",
    };

    const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];

    // Map DummyJSON products to our categories
    const allProducts = [];
    for (const p of data.products) {
      const category = categoryMapping[p.category];
      if (!category) continue; // skip unmapped categories (groceries, motorcycle, vehicle)
      const product = {
        name: p.title,
        description: (category === "Electronics" && electronicsSpecs[p.title]) ? electronicsSpecs[p.title] : p.description,
        price: p.price,
        category,
        stock: p.stock,
        ratings: p.rating,
        numOfReviews: Math.floor(p.rating * 50 + p.id * 3),
        images: (p.images?.length > 0 ? p.images : [p.thumbnail]).map((url) => ({ url })),
      };

      // Add sizes and gender for clothing products
      if (category === "Clothing") {
        product.sizes = clothingSizes;
        product.gender = genderMapping[p.category] || "Unisex";
      }

      if (category === "Shoes") {
        const colorName = inferSeedColorName(p.title);
        product.sizes = defaultShoeSizes;
        product.gender = p.category === "womens-shoes" ? "Women" : p.category === "mens-shoes" ? "Men" : "Unisex";
        product.colorOptions = [
          {
            name: colorName,
            swatch: inferSeedSwatch(colorName),
            images: (p.images?.length > 0 ? p.images : [p.thumbnail]).map((url) => ({ url })),
          },
        ];
      }

      allProducts.push(product);
    }

    // Add books with Open Library covers
    for (const book of books) {
      allProducts.push({
        name: book.name,
        description: book.description,
        price: book.price,
        category: "Books",
        stock: book.stock,
        ratings: book.ratings,
        numOfReviews: book.numOfReviews,
        images: [{ url: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` }],
      });
    }

    // Log category breakdown
    const counts = {};
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    console.log("Products by category:", counts);

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@ecomweb.com",
      password: "admin123",
      role: "admin",
    });

    // Create regular user
    await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    // Add admin user to all products and insert
    const productsWithUser = allProducts.map((p) => ({ ...p, user: admin._id }));
    await Product.insertMany(productsWithUser);

    console.log(`Database seeded with ${productsWithUser.length} products!`);
    console.log("Admin: admin@ecomweb.com / admin123");
    console.log("User: john@example.com / password123");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
