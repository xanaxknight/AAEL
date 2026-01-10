import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";

// --- Types ---
type Theme = 'light' | 'dark';
type ViewMode = 'store' | 'prelaunch';

// Grid Configuration for a single breakpoint
interface GridConfig {
    span?: number | 'full';
    start?: number | 'auto'; // Explicit start column
    row?: number | 'auto';   // Explicit row (useful for headers)
    align?: 'left' | 'center' | 'right';
}

// The new Block Props supporting failproof responsive logic
interface BlockProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    // Breakpoints
    s?: GridConfig;  // Mobile (2 cols)
    m?: GridConfig;  // Tablet (4 cols)
    l?: GridConfig;  // Desktop (6 cols)
    xl?: GridConfig; // Ultra Wide (8 cols)
}

interface ThemeIconProps extends React.SVGProps<SVGSVGElement> {
  theme?: Theme;
  disabled?: boolean;
}

interface MenuToggleProps {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}

interface HeaderProps {
    theme: Theme;
    onToggleTheme: () => void;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    rightAction?: React.ReactNode;
    showMenuToggle?: boolean;
}

interface MobileMenuProps {
    isOpen: boolean;
    theme: Theme;
    onToggleTheme: () => void;
}

interface SlideData {
    light: string;
    dark: string;
    style?: React.CSSProperties;
}

interface ProductEntity {
    code: string;
    title: string;
    type: string;
    price: string;
    slides: SlideData[];
}

// --- Data ---
const STORE_PRODUCT: ProductEntity = {
    code: "AMO",
    title: "AMO",
    type: "Desk lamp",
    price: "€ 150",
    slides: [
        {
          light: 'https://i.ibb.co/YFqGLMGM/amo-5-d.webp',
          dark: 'https://i.ibb.co/x8CZ1cNY/amo-5-n.webp',
          style: { objectPosition: 'center' }
        },
        {
          light: 'https://i.ibb.co/M5N8XTHW/amo-4-d.webp',
          dark: 'https://i.ibb.co/PGdjc1mn/amo-4-n.webp',
          style: { objectPosition: 'center' }
        },
        {
          light: 'https://i.ibb.co/VWjW5STB/d-v3.webp',
          dark: 'https://i.ibb.co/fmHHdcb/n-v3.webp',
          style: { objectPosition: 'center' }
        }
    ]
};

const PRELAUNCH_PRODUCT: ProductEntity = {
    code: "AMO",
    title: "AMO",
    type: "Desk lamp",
    price: "€ 150",
    slides: [
        {
          light: 'https://i.ibb.co/YFqGLMGM/amo-5-d.webp',
          dark: 'https://i.ibb.co/x8CZ1cNY/amo-5-n.webp',
          style: { objectPosition: 'center' }
        },
        {
          light: 'https://i.ibb.co/M5N8XTHW/amo-4-d.webp',
          dark: 'https://i.ibb.co/PGdjc1mn/amo-4-n.webp',
          style: { objectPosition: 'center' }
        },
        {
          light: 'https://i.ibb.co/VWjW5STB/d-v3.webp',
          dark: 'https://i.ibb.co/fmHHdcb/n-v3.webp',
          style: { objectPosition: 'center' }
        }
    ]
};


// --- Icons ---
const ThemeIcon: React.FC<ThemeIconProps> = ({ theme, disabled, ...props }) => {
  const isDark = theme === 'dark';

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      style={{ display: 'block', width: '100%', height: '100%' }}
      {...props}
    >
       <circle 
         cx="12" 
         cy="12" 
         r="11.25" 
         stroke="currentColor" 
         strokeWidth="1.5"
         className="theme-icon-circle"
       />
       {isDark ? (
           <circle 
             cx="12" 
             cy="12" 
             r="4" 
             fill="none"
             stroke="currentColor"
             strokeWidth="1.5"
             className="theme-icon-line"
           />
       ) : (
           <rect 
             x="11.25" 
             y="7" 
             width="1.5" 
             height="10" 
             rx="0.75" 
             fill="currentColor"
             className="theme-icon-line"
           />
       )}
    </svg>
  );
};

// --- Components ---

const MenuToggle: React.FC<MenuToggleProps> = ({ isOpen, onClick, className = "" }) => {
    const config = [
        { initialY: 2, targetX: 23, targetHeight: 16 },
        { initialY: 7, targetX: 17.5, targetHeight: 20 },
        { initialY: 12, targetX: 12, targetHeight: 24 },
        { initialY: 17, targetX: 6.5, targetHeight: 20 },
        { initialY: 22, targetX: 1, targetHeight: 16 },
    ];

    return (
        <button 
            className={`icon-btn ${className}`} 
            onClick={onClick} 
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isOpen}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', width: '100%', height: '100%' }}>
                {config.map((item, i) => {
                    const tx = item.targetX - 12;
                    const scale = item.targetHeight / 24;
                    const ty = 24 - (item.initialY + (item.targetHeight / 2));
                    
                    return (
                        <line 
                            key={i}
                            x1="0" y1={item.initialY} x2="24" y2={item.initialY} 
                            style={{
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 1200ms ease',
                                transformBox: 'fill-box',
                                transformOrigin: 'center',
                                transform: isOpen 
                                    ? `translate(${tx}px, ${ty}px) rotate(90deg) scaleX(${scale})`
                                    : 'translate(0, 0) rotate(0) scaleX(1)'
                            }}
                        />
                    );
                })}
            </svg>
        </button>
    );
};

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, theme, onToggleTheme }) => {
    return (
        <div className={`mobile-menu-container ${isOpen ? 'open' : ''}`}>
             <nav className="mobile-nav">
                <a href="/about" className="mobile-link" style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}>ABOUT</a>
                <a href="https://instagram.com" className="mobile-link" target="_blank" rel="noopener noreferrer" style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}>INSTA</a>
             </nav>
             <div className="mobile-theme-toggle" style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}>
                 <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle Theme">
                    <ThemeIcon theme={theme} />
                 </button>
             </div>
        </div>
    );
};

// --- The New Grid Block System ---
const Block: React.FC<BlockProps> = ({ children, className = "", style, s, m, l, xl }) => {
  // Defaults
  const defaults: GridConfig = { span: 1, start: 'auto', row: 'auto', align: 'left' };
  
  // Merge configurations cascading up: s -> m -> l -> xl
  const configS = { ...defaults, ...s };
  const configM = { ...configS, ...m }; // Tablet inherits from Mobile
  const configL = { ...configM, ...l }; // Desktop inherits from Tablet
  const configXL = { ...configL, ...xl }; // Wide inherits from Desktop

  // Helper to generate styles variables
  const getVars = (conf: GridConfig, prefix: string) => {
      const spanVal = conf.span === 'full' ? '-1' : `span ${conf.span}`;
      const startVal = conf.start === 'auto' ? 'auto' : conf.start;
      const rowVal = conf.row === 'auto' ? 'auto' : conf.row;
      
      const alignVal = conf.align === 'center' ? 'center' : conf.align === 'right' ? 'flex-end' : 'flex-start';
      const textVal = conf.align === 'center' ? 'center' : conf.align === 'right' ? 'right' : 'left';

      return {
          [`--span-${prefix}`]: spanVal,
          [`--start-${prefix}`]: startVal,
          [`--row-${prefix}`]: rowVal,
          [`--align-${prefix}`]: alignVal,
          [`--text-${prefix}`]: textVal,
      };
  };

  const cssVars = {
      ...getVars(configS, 's'),
      ...getVars(configM, 'm'),
      ...getVars(configL, 'l'),
      ...getVars(configXL, 'xl'),
      ...style
  } as React.CSSProperties;

  return (
    <div className={`grid-block ${className}`} style={cssVars}>
      {children}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, isMenuOpen, onToggleMenu, rightAction, showMenuToggle = true }) => {
  return (
    <>
      {/* Logo */}
      <Block 
        className="header-block"
        s={{ span: 1, align: 'center', row: 1 }} 
        m={{ span: 1, align: 'left', row: 1 }}
        l={{ start: 2, span: 1, row: 1 }}
        xl={{ start: 3, span: 1, row: 1 }}
      >
        <a href="/" className="logo-badge" style={{textDecoration: 'none'}}>
            <h1 className="brand-text">AAEL</h1>
            <span className="collection-text">C24</span>
        </a>
      </Block>

      {/* Theme Toggle */}
      <Block 
        className="header-block desktop-only"
        s={{ span: 0 }}
        m={{ span: 2, align: 'center', row: 1 }}
        l={{ start: 3, span: 2, row: 1 }}
        xl={{ start: 4, span: 2, row: 1 }}
      >
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle Theme">
             <ThemeIcon theme={theme} />
        </button>
      </Block>

      {/* Mobile Menu Toggle */}
      {showMenuToggle && (
        <div className="mobile-menu-absolute mobile-only">
            <MenuToggle isOpen={isMenuOpen} onClick={onToggleMenu} />
        </div>
      )}

      {/* Bag or Action */}
      <Block 
        className="header-block"
        s={{ span: 1, align: 'center', row: 1 }}
        m={{ span: 1, align: 'right', start: 4, row: 1 }}
        l={{ span: 1, align: 'center', start: 5, row: 1 }}
        xl={{ span: 1, align: 'center', start: 6, row: 1 }}
      >
        <div className="bag-container">
            {rightAction ? rightAction : <button className="bag-btn">BAG (0)</button>}
        </div>
      </Block>
    </>
  );
};

interface ProductCardProps {
    title: string;
    type: string;
    price: string;
    code: string;
    theme: Theme;
    slides: SlideData[];
    variant?: 'portrait' | 'landscape' | 'prelaunch';
    style?: React.CSSProperties;
    slideDuration?: number | number[];
}

const ProductCard = ({ title, type, price, code, theme, slides, variant = 'portrait', style, slideDuration = 4000 }: ProductCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const activeDuration = Array.isArray(slideDuration) 
      ? (slideDuration[currentSlide] ?? slideDuration[slideDuration.length - 1]) 
      : slideDuration;
  
  const [path, setPath] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!cardRef.current) return;

    const updatePath = () => {
        const { width: w, height: h } = cardRef.current!.getBoundingClientRect();
        if (w === 0 || h === 0) return;

        const r = 12; // Radius
        const k = 12 * 0.8; 

        let d = `M 0,${r}`;
        d += ` C 0,${r-k} ${r-k},0 ${r},0`;
        d += ` L ${w-r},0`;
        d += ` C ${w-r+k},0 ${w},${r-k} ${w},${r}`;
        d += ` L ${w},${h-r}`;
        d += ` C ${w},${h-r+k} ${w-r+k},${h} ${w-r},${h}`;
        d += ` L ${r},${h}`;
        d += ` C ${r-k},${h} 0,${h-r+k} 0,${h-r}`;
        d += ` Z`;

        setPath(d);
    };

    updatePath();
    const observer = new ResizeObserver(updatePath);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDotClick = (index: number) => {
      setCurrentSlide(index);
  };

  return (
    <div 
        className={`product-card ${variant}`}
        ref={cardRef}
        style={{ clipPath: path ? `path('${path}')` : 'none', ...style }}
    >
      <div className="product-visual">
         {slides.map((slide, index) => {
             const isActive = index === currentSlide;
             return (
                 <div 
                    key={index} 
                    className="slide-container"
                    style={{ 
                        opacity: isActive ? 1 : 0,
                        zIndex: isActive ? 2 : 1,
                        transition: 'opacity 800ms ease'
                    }}
                 >
                     <img 
                        src={slide.light} 
                        alt={title} 
                        className="product-image"
                        style={{ ...slide.style, opacity: theme === 'light' ? 1 : 0 }}
                        draggable="false"
                        loading="lazy"
                     />
                     <img 
                        src={slide.dark} 
                        alt={title} 
                        className="product-image"
                        style={{ ...slide.style, opacity: theme === 'dark' ? 1 : 0 }}
                        draggable="false"
                        loading="lazy"
                     />
                 </div>
             )
         })}
      </div>
      
      {/* Controls Wrapper - Centered */}
      <div className="card-controls">
          <button 
            className="control-btn" 
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <rect width="3.5" height="12" rx="1.75" />
                    <rect x="6.5" width="3.5" height="12" rx="1.75" />
                </svg>
            ) : (
                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" style={{transform: 'translateX(2px)'}}>
                     <path d="M9.359 5.25391C9.88281 5.58984 9.88281 6.36328 9.359 6.69922L1.47461 11.7246C0.919922 12.0781 0.189453 11.6816 0.189453 11.0117V0.941406C0.189453 0.271484 0.919922 -0.125 1.47461 0.228516L9.359 5.25391Z" />
                </svg>
            )}
          </button>
          
          <div className="dotnav-container">
              {slides.map((_, index) => (
                  <button 
                    key={index} 
                    className={`dotnav-item ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide}
                  >
                      {index === currentSlide && (
                          <div 
                            className="dot-progress" 
                            style={{ 
                                animationDuration: `${activeDuration}ms`,
                                animationPlayState: isPlaying ? 'running' : 'paused'
                            }} 
                            onAnimationEnd={() => {
                                setCurrentSlide(prev => (prev + 1) % slides.length);
                            }}
                          />
                      )}
                  </button>
              ))}
          </div>
      </div>
    </div>
  );
};

const Footer = () => {
    return (
        <>
            <Block 
                className="footer-block"
                s={{ span: 1, align: 'center' }}
                m={{ span: 1, align: 'center' }}
                l={{ start: 2, span: 1 }}
                xl={{ start: 3, span: 1 }}
            >
                <div className="logo-badge">
                    <h1 className="brand-text">AAEL</h1>
                    <span className="collection-text">C24</span>
                </div>
            </Block>

            <Block 
                className="footer-block desktop-only"
                m={{ span: 1, align: 'center' }}
                l={{ span: 1 }}
            >
                 <a href="/about" className="footer-text">ABOUT</a>
            </Block>

            <Block 
                className="footer-block desktop-only"
                m={{ span: 1, align: 'center' }}
                l={{ span: 1 }}
            >
                 <a href="https://instagram.com" className="footer-text" target="_blank" rel="noopener noreferrer">INSTA</a>
            </Block>

            <Block 
                className="footer-block"
                s={{ span: 1, align: 'center' }}
                m={{ span: 1, align: 'center' }}
                l={{ start: 5, span: 1 }}
                xl={{ start: 6, span: 1 }}
            >
                 <span className="footer-text static-text">©2026</span>
            </Block>
        </>
    )
}

const NewsletterForm = () => {
    return (
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="ENTER YOUR EMAIL" className="newsletter-input" required />
            <button type="submit" className="newsletter-submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 24, height: 24}}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </form>
    );
};

const GridBackground = () => {
  return (
    <div className="grid-background">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="grid-stripe" />
      ))}
    </div>
  );
};

const PrelaunchView = ({ theme, onToggleTheme }: { theme: Theme, onToggleTheme: () => void }) => {
    const formRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const LetMeKnowBtn = (
        <button 
            onClick={scrollToForm}
            className="pill-btn"
        >
            Let me know
        </button>
    );

    return (
        <div className="prelaunch-container">
             {/* Header */}
             <div className="prelaunch-header">
                 <div className="grid-container">
                    <Header 
                        theme={theme} 
                        onToggleTheme={onToggleTheme} 
                        isMenuOpen={false} 
                        onToggleMenu={()=>{}}
                        rightAction={LetMeKnowBtn}
                        showMenuToggle={false}
                    />
                 </div>
             </div>

             {/* Content */}
             <div className="grid-container prelaunch-content">
                 {/* Hero Text */}
                 <Block 
                    className="prelaunch-hero"
                    s={{span: 2, align: 'center'}} m={{span: 4, align: 'center'}} l={{span: 6, align: 'center'}} xl={{span: 8, align: 'center'}} 
                 >
                    <h1 className="lead-text" style={{
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}>
                        AAEL creates limited series of interior artifacts primarily out of metal.
                    </h1>
                 </Block>
                 
                 {/* Product Card - Prelaunch Variant (1440x1152 ratio) */}
                 <Block 
                    className="prelaunch-card-block"
                    s={{span: 2, align: 'center'}} m={{span: 4, align: 'center'}} l={{span: 6, align: 'center'}} xl={{span: 8, align: 'center'}} 
                 >
                     <ProductCard 
                        {...PRELAUNCH_PRODUCT}
                        theme={theme}
                        variant="prelaunch"
                        style={{ maxWidth: '1440px' }}
                        slideDuration={[12000, 6000]}
                     />
                 </Block>

                 {/* Newsletter */}
                 <Block 
                    className="prelaunch-newsletter-block"
                    s={{span: 2, align: 'center'}} m={{span: 4, align: 'center'}} l={{span: 6, align: 'center'}} xl={{span: 8, align: 'center'}}
                 >
                     <div ref={formRef} style={{width: '100%', maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
                        <h2 className="lead-text" style={{marginBottom: '32px'}}>
                            Let me know when AMO is available
                        </h2>
                        <form onSubmit={(e) => e.preventDefault()} style={{display: 'flex', width: '100%', gap: '8px', alignItems: 'center'}}>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                style={{
                                    flexGrow: 1, 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                    color: 'var(--fg)',
                                    fontSize: '16px',
                                    height: '42px',
                                    outline: 'none',
                                    transition: 'background-color 1200ms ease, color 1200ms ease'
                                }}
                                required
                            />
                            <button 
                                type="submit"
                                className="pill-btn"
                            >
                                Send
                            </button>
                        </form>
                     </div>
                 </Block>
             </div>
             
             {/* Sticky Footer */}
             <div className="grid-container" style={{marginTop: 'auto'}}>
                <Footer />
             </div>
        </div>
    );
};

const App = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<ViewMode>('store');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  }

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <style>{`
        /* Global Reset */
        *, *::before, *::after {
            box-sizing: border-box;
        }

        :root {
          --gap: 0px;
          --bg: #ffffff;
          --fg: #000000;
          --gray-bg: #EAEAEA;
          --stripe-col: #F7F7F7;
          --font-main: "Neue Haas Grotesk Display Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
          --text-xs: 11px;
          --text-sm: 13px;
          --text-md: 16px;
          --text-lg: 32px;
          --text-xl: 48px;
          --header-height: 72px;
          --cols: 2; 
          
          /* Prelaunch specific vars */
          --prelaunch-bg: #EAEAEA;
          --prelaunch-fg: #000000;

          /* Controls */
          --control-col: rgba(0, 0, 0, 0.6);
          --control-col-hover: rgba(0, 0, 0, 0.9);
          --progress-col: #222;
          
          /* Button Variables (Light Mode Default) */
          --btn-bg: #000000;
          --btn-fg: #ffffff;
          --btn-shadow: none;
          --btn-radius: 99px;
        }

        @media (min-width: 768px) { :root { --cols: 4; } }
        @media (min-width: 1440px) { :root { --cols: 6; } }
        @media (min-width: 1920px) { :root { --cols: 8; } }

        body.dark {
          --bg: #1E1E1E;
          --fg: #f0f0f0;
          --gray-bg: #2a2a2a;
          --stripe-col: #1a1a1a;
          
          /* Prelaunch dark */
          --prelaunch-bg: #1E1E1E;
          --prelaunch-fg: #f0f0f0;

          /* Controls Dark Mode */
          --control-col: rgba(255, 255, 255, 0.8);
          --control-col-hover: #ffffff;
          --progress-col: rgba(255, 255, 255, 0.8);
          
          /* Button Variables (Dark Mode) */
          --btn-bg: rgba(255, 255, 255, 0.10);
          --btn-fg: #ffffff;
          --btn-shadow: 0 -0.5px 1px 0 #FFF inset, 0 0 3px 0 rgba(0, 0, 0, 0.35) inset;
        }

        body {
          background-color: var(--bg);
          color: var(--fg);
          margin: 0;
          font-family: var(--font-main);
          font-size: var(--text-sm);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          transition: background-color 1200ms ease, color 1200ms ease;
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        body:has(.mobile-menu-container.open) { overflow: hidden; }

        .app-container {
            position: relative;
            min-height: 100vh;
            width: 100%;
            overflow-x: hidden;
        }

        /* --- Grid System --- */
        .grid-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(var(--cols), 1fr);
          gap: 0;
          width: 100%;
        }

        .grid-block {
            grid-column-start: var(--start-s);
            grid-column-end: var(--span-s);
            grid-row: var(--row-s);
            display: flex;
            flex-direction: column;
            align-items: var(--align-s);
            text-align: var(--text-s);
            position: relative;
        }

        @media (min-width: 768px) {
            .grid-block {
                grid-column-start: var(--start-m);
                grid-column-end: var(--span-m);
                grid-row: var(--row-m);
                align-items: var(--align-m);
                text-align: var(--text-m);
            }
        }

        @media (min-width: 1440px) {
            .grid-block {
                grid-column-start: var(--start-l);
                grid-column-end: var(--span-l);
                grid-row: var(--row-l);
                align-items: var(--align-l);
                text-align: var(--text-l);
            }
        }

        @media (min-width: 1920px) {
            .grid-block {
                grid-column-start: var(--start-xl);
                grid-column-end: var(--span-xl);
                grid-row: var(--row-xl);
                align-items: var(--align-xl);
                text-align: var(--text-xl);
            }
        }

        /* --- Background Grid --- */
        .grid-background {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 0;
            display: grid;
            grid-template-columns: repeat(var(--cols), 1fr);
            gap: 0;
            pointer-events: none;
        }
        .grid-stripe {
            height: 100%;
            border-right: 1px solid transparent; 
            transition: background-color 1200ms ease;
        }
        .grid-stripe:nth-child(even) { background-color: var(--stripe-col); }
        .grid-stripe:nth-child(n+3) { display: none; }
        @media (min-width: 768px) { .grid-stripe:nth-child(-n+4) { display: block; } .grid-stripe:nth-child(n+5) { display: none; } }
        @media (min-width: 1440px) { .grid-stripe:nth-child(-n+6) { display: block; } .grid-stripe:nth-child(n+7) { display: none; } }
        @media (min-width: 1920px) { .grid-stripe:nth-child(-n+8) { display: block; } }


        /* --- Component Styles --- */
        .mobile-menu-container {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: calc(100vh - var(--header-height));
            z-index: 100;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            transform: translateY(-100%);
            transition: transform 1200ms cubic-bezier(0.65, 0, 0.35, 1);
        }
        .mobile-menu-container.open { transform: translateY(0); }
        @media (min-width: 768px) { .mobile-menu-container { display: none !important; } }
        
        .mobile-nav { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
        .mobile-link {
            font-family: var(--font-main);
            font-size: 2rem; text-decoration: none; color: var(--fg); text-transform: uppercase; font-weight: 400;
            opacity: 0; transform: translateY(-20px);
            transition: opacity 1200ms ease, transform 1200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mobile-theme-toggle { margin-top: 4rem; opacity: 0; transform: translateY(-20px); transition: opacity 1200ms ease, transform 1200ms cubic-bezier(0.22, 1, 0.36, 1); }
        .mobile-menu-container.open .mobile-link, .mobile-menu-container.open .mobile-theme-toggle { opacity: 1; transform: translateY(0); }

        .content-pusher {
            position: relative; width: 100%; min-height: 100vh;
            transition: transform 1200ms cubic-bezier(0.65, 0, 0.35, 1); will-change: transform; z-index: 10;
        }
        .content-pusher.pushed { transform: translateY(calc(100vh - var(--header-height))); }

        /* Fixed Header Layer */
        .fixed-header-wrapper {
            position: fixed; top: 0; left: 0; width: 100%;
            z-index: 50;
            mix-blend-mode: exclusion;
            color: #ffffff;
            pointer-events: none;
            transition: transform 1200ms cubic-bezier(0.65, 0, 0.35, 1);
            will-change: transform;
        }
        
        .fixed-header-wrapper.pushed {
            transform: translateY(calc(100vh - var(--header-height)));
        }

        .header-block {
            padding-top: 24px; padding-bottom: 24px;
            justify-content: center; min-height: var(--header-height);
            pointer-events: auto;
        }
        
        /* Updated header text colors to allow inheritance */
        .header-block .brand-text, 
        .header-block .collection-text, 
        .header-block .bag-btn, 
        .header-block .icon-btn {
            color: inherit;
        }

        .footer-block {
            padding-top: 24px; padding-bottom: 24px;
            justify-content: center; min-height: var(--header-height);
        }

        .mobile-menu-absolute {
            position: absolute; top: 24px; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; justify-content: center; height: 24px;
            pointer-events: auto;
            color: #ffffff;
        }
        
        .mobile-menu-absolute .icon-btn {
            color: #ffffff;
        }

        @media (max-width: 767px) { .desktop-only { display: none !important; } .mobile-only { display: flex !important; } }
        @media (min-width: 768px) { .desktop-only { display: flex !important; } .mobile-only { display: none !important; } }

        h1, h2, p { margin: 0; font-weight: 400; }
        
        .logo-badge {
            display: flex; flex-direction: row; align-items: center;
            gap: 12px; width: 100%; height: 24px; text-decoration: none;
            color: inherit; /* FIX: Ensure logo does not appear blue */
        }
        @media (min-width: 768px) { .logo-badge { justify-content: space-between; padding: 0 24px; } }
        @media (max-width: 767px) { .logo-badge { justify-content: center; } }
        
        .brand-text, .collection-text {
            font-family: var(--font-main);
            font-size: 1.5rem; font-weight: 500; line-height: 1; letter-spacing: 0.45rem;
            color: inherit; text-transform: uppercase; white-space: nowrap; transition: color 1200ms ease;
        }
        @media (max-width: 767px) { .collection-text { display: none; } }

        .bag-container { display: flex; align-items: center; height: 24px; }
        @media (min-width: 768px) { .bag-container { padding: 0 24px; } }
        
        .bag-btn, .footer-text {
            display: inline-flex; height: auto; padding: 0; justify-content: center; align-items: center; gap: 0.5rem;
            background: transparent; border: none; color: var(--fg);
            font-family: var(--font-main);
            font-size: 1.5rem; font-weight: 500; line-height: 1; letter-spacing: 0.075rem;
            text-transform: uppercase; cursor: pointer; transition: opacity 0.2s ease, color 1200ms ease;
            white-space: nowrap; text-decoration: none;
        }
        .footer-text.static-text { cursor: default; }
        .bag-btn:hover, .footer-text:not(.static-text):hover { opacity: 0.6; }
        
        .pill-btn {
            display: flex;
            height: 42px;
            padding: 8px 24px;
            justify-content: center;
            align-items: center;
            gap: 8px;
            border-radius: var(--btn-radius);
            border: 1px solid rgba(0, 0, 0, 0.00);
            background: var(--btn-bg);
            color: var(--btn-fg);
            box-shadow: var(--btn-shadow);
            font-family: var(--font-main);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            white-space: nowrap;
        }
        
        .pill-btn:hover {
            box-shadow: 0 0 17px 0 rgba(255, 255, 255, 0.55) inset;
        }
        
        .pill-btn:disabled {
            background: #6F6F6F;
            cursor: not-allowed;
            box-shadow: none;
        }

        button {
            background: none; border: none; color: inherit; font-family: inherit;
            cursor: pointer; padding: 0; font-size: inherit; -webkit-appearance: none; appearance: none;
        }

        .icon-btn { 
            display: flex; align-items: center; justify-content: center; 
            color: inherit; transition: opacity 0.2s, color 1200ms ease; 
            height: 24px; width: 24px;
        }
        
        .mobile-theme-toggle .icon-btn {
            height: 36px; width: 36px;
        }
        
        .icon-btn svg { width: 100%; height: 100%; }

        /* Updated Lead Typography Class */
        .lead-text {
            text-align: center;
            font-family: "Neue Haas Grotesk Display Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 48px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
            letter-spacing: 0.96px;
        }
        @media (max-width: 767px) {
            .lead-text {
                font-size: 32px;
            }
        }

        .hero-text {
            font-size: 28px; 
            line-height: 1.1; 
            width: 100%; 
            letter-spacing: 0.02em; 
            padding: 72px 24px;
        }
        @media (min-width: 768px) { 
            .hero-text { 
                font-size: 42px; 
                padding: 100px;
            } 
        }
        @media (min-width: 1440px) {
            .hero-text {
                padding: 150px;
            }
        }

        .product-card {
            width: 100%; position: relative; background-color: #B0B0B0;
            display: flex; justify-content: center; align-items: center;
            overflow: hidden; transition: background-color 1200ms ease;
        }
        body.dark .product-card { background-color: #333; }
        
        .product-card.portrait { aspect-ratio: 3/4; }
        .product-card.landscape { 
            aspect-ratio: 16/9; 
            max-width: 1440px; 
            margin: 0 auto;
        }
        
        /* Prelaunch Card: 3:4 on mobile, 5:4 on desktop */
        .product-card.prelaunch {
             aspect-ratio: 3/4;
             width: 100%;
        }
        @media (min-width: 768px) {
            .product-card.prelaunch {
                 aspect-ratio: 5/4; /* Desktop */
                 max-width: 1440px;
                 margin: 0 auto;
            }
        }

        .product-visual { width: 100%; height: 100%; position: relative; overflow: hidden; }
        .slide-container {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        }
        .product-image { 
            width: 100%; height: 100%; object-fit: cover; display: block; 
            position: absolute; top: 0; left: 0;
            transition: opacity 1200ms ease, transform 1200ms ease;
        }
        
        .product-details-overlay { 
            position: absolute; bottom: 24px; left: 24px; right: 24px;
            display: flex; flex-direction: column; gap: 0px; z-index: 10; 
            mix-blend-mode: exclusion;
            color: #ffffff;
            pointer-events: none;
        }
        @media (min-width: 768px) {
            .product-details-overlay { 
                flex-direction: row; 
                gap: 24px; 
            }
        }
        
        .card-controls {
            position: absolute; bottom: 24px; 
            left: 50%; transform: translateX(-50%); /* Centered controls */
            display: flex; gap: 8px; align-items: center; z-index: 20;
        }
        
        .dotnav-container {
            display: flex;
            width: auto;
            padding: 0.75rem;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;

            border-radius: 18px;
            border: 1px solid rgba(0, 0, 0, 0.00);
            background: rgba(255, 255, 255, 0.10);
            box-shadow: 0 -0.5px 1px 0 rgba(255, 255, 255, 0.70) inset, 0 0 2px 0 rgba(0, 0, 0, 0.35) inset;
            backdrop-filter: blur(5px);
        }
        
        .control-btn {
            width: 32px; height: 32px;
            border-radius: 50%;
            display: flex; justify-content: center; align-items: center;
            
            border: 1px solid rgba(0, 0, 0, 0.00);
            background: rgba(255, 255, 255, 0.10);
            box-shadow: 0 -0.5px 1px 0 rgba(255, 255, 255, 0.70) inset, 0 0 2px 0 rgba(0, 0, 0, 0.35) inset;
            backdrop-filter: blur(5px);
            
            padding: 0;
            cursor: pointer;
            color: var(--control-col);
            transition: background 0.3s, color 0.3s;
        }
        .control-btn:hover {
            background: rgba(255, 255, 255, 0.20);
            color: var(--control-col-hover);
        }

        .dotnav-item {
            position: relative; 
            width: 8px; 
            height: 8px; 
            border-radius: 99px;
            background: rgba(0, 0, 0, 0.25); 
            cursor: pointer; 
            border: none;
            padding: 0;
            transition: width 0.4s cubic-bezier(0.3, 1.2, 0.2, 1), background-color 0.3s;
        }
        
        .dotnav-item:hover { background: rgba(0, 0, 0, 0.45); }
        
        .dotnav-item.active { 
            width: 32px; 
            background: rgba(0, 0, 0, 0.25);
        }
        
        .dot-progress {
            position: absolute; top: 0; left: 0; height: 100%; width: 0%;
            background: var(--progress-col);
            border-radius: 99px;
            animation: progress-fill linear forwards;
        }
        @keyframes progress-fill {
            from { width: 8px; }
            to { width: 100%; }
        }

        .p-text { 
            font-size: 18px;
            font-weight: 500; 
            letter-spacing: 0.02em;
        }
        .theme-icon-circle { 
            opacity: 0.3;
            transition: opacity 0.3s ease, stroke 1200ms ease;
        }
        .icon-btn:hover .theme-icon-circle {
            opacity: 1;
        }
        .theme-icon-line { transition: stroke 1200ms ease, fill 1200ms ease; }

        .newsletter-form {
            display: flex; flex-direction: row; width: 100%; border-bottom: 1px solid var(--fg);
            padding-bottom: 8px; transition: border-color 1200ms ease;
        }
        .newsletter-input {
            flex-grow: 1; background: none; border: none; outline: none;
            font-family: var(--font-main); font-size: 18px; color: var(--fg);
            padding: 0; letter-spacing: 0.02em;
        }
        .newsletter-input::placeholder { color: var(--fg); opacity: 0.4; transition: color 1200ms ease; }
        .newsletter-submit {
            background: none; border: none; padding: 0; color: var(--fg); cursor: pointer;
            transition: opacity 0.2s, color 1200ms ease;
        }
        .newsletter-submit:hover { opacity: 0.6; }
        
        .dev-toggle {
            position: fixed; bottom: 24px; right: 24px; z-index: 200;
            background: var(--fg); color: var(--bg);
            padding: 8px 12px; font-size: 12px; font-weight: 500; text-transform: uppercase;
            border-radius: 4px; cursor: pointer; opacity: 0.3; transition: opacity 0.2s;
            mix-blend-mode: difference;
        }
        .dev-toggle:hover { opacity: 1; }

        /* Prelaunch Specifics */
        .prelaunch-container {
            background-color: var(--prelaunch-bg);
            min-height: 100vh;
            color: var(--prelaunch-fg);
            --fg: var(--prelaunch-fg);
            --bg: var(--prelaunch-bg);
            display: flex;
            flex-direction: column;
            transition: background-color 1200ms ease, color 1200ms ease;
        }
        .prelaunch-header {
            color: inherit;
        }
        
        /* Prelaunch Spacing */
        .prelaunch-content {
            padding-top: 4vh;
            flex-grow: 1;
        }
        .prelaunch-hero { 
            margin-bottom: 64px; 
            padding-left: 24px;
            padding-right: 24px;
        }
        .prelaunch-card-block { margin-bottom: 80px; }
        .prelaunch-newsletter-block { 
            margin-bottom: 120px; 
            padding-left: 24px;
            padding-right: 24px;
        }

        @media (min-width: 768px) {
            .prelaunch-content { padding-top: 6vh; }
            .prelaunch-hero { 
                margin-bottom: 8vh; 
                padding-left: 0;
                padding-right: 0;
            }
            .prelaunch-card-block { margin-bottom: 15vh; }
            .prelaunch-newsletter-block { 
                margin-bottom: 20vh; 
                padding-left: 0;
                padding-right: 0;
            }
        }

      `}</style>
      
      {/* ... rest of existing render logic ... */}
      {view === 'store' && <GridBackground />}
      
      {/* Dev Mode Toggle */}
      <button className="dev-toggle" onClick={() => setView(v => v === 'store' ? 'prelaunch' : 'store')}>
        {view === 'store' ? 'Dev: Prelaunch' : 'Dev: Store'}
      </button>

      {view === 'store' ? (
        <>
            <div className={`fixed-header-wrapper ${isMenuOpen ? 'pushed' : ''}`}>
                 <div className="grid-container">
                    <Header 
                        theme={theme} 
                        onToggleTheme={toggleTheme} 
                        isMenuOpen={isMenuOpen}
                        onToggleMenu={handleToggleMenu}
                    />
                 </div>
            </div>

            <MobileMenu isOpen={isMenuOpen} theme={theme} onToggleTheme={toggleTheme} />

            <div className={`content-pusher ${isMenuOpen ? 'pushed' : ''}`}>
                  <div className="grid-container">
                    <Block s={{span: 'full'}} style={{height: 'var(--header-height)'}}><div/></Block>
                    
                    <Block 
                        s={{ span: 2, align: 'center' }} 
                        m={{ span: 4, align: 'center' }}
                        l={{ start: 2, span: 4, align: 'center' }}
                        xl={{ start: 3, span: 4, align: 'center' }}
                    >
                        <h2 className="hero-text">
                            AAEL creates limited series of interior artifacts primarily out of metal.
                        </h2>
                    </Block>

                    <Block 
                        s={{ span: 2 }}
                        m={{ start: 1, span: 4 }}
                        l={{ start: 1, span: 6 }}
                        xl={{ start: 2, span: 6 }}
                    >
                        <ProductCard 
                            {...STORE_PRODUCT}
                            theme={theme}
                        />
                    </Block>
                    
                    <Block s={{ span: 'full' }} style={{height: '120px'}}><div/></Block>

                    <Footer />
                  </div>
            </div>
        </>
      ) : (
        <PrelaunchView theme={theme} onToggleTheme={toggleTheme} />
      )}

    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);