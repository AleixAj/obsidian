// ===========================================
// KYLEN — Shared bits: icons, placeholders, marquee
// ===========================================

const { useEffect, useState, useRef } = React;

/* ---------- ICONS ---------- */
const Icon = {
  search: (p) => (
    <svg {...p} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="7" cy="7" r="5"></circle>
      <line x1="11" y1="11" x2="14" y2="14"></line>
    </svg>
  ),
  bag: (p) => (
    <svg {...p} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M3 5h10l-1 9H4L3 5z"></path>
      <path d="M6 5V3.5a2 2 0 0 1 4 0V5"></path>
    </svg>
  ),
  user: (p) => (
    <svg {...p} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="8" cy="6" r="2.5"></circle>
      <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5"></path>
    </svg>
  ),
  arrow: (p) => (
    <svg {...p} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <line x1="2" y1="7" x2="12" y2="7"></line>
      <polyline points="8,3 12,7 8,11"></polyline>
    </svg>
  ),
  arrowDown: (p) => (
    <svg {...p} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <line x1="6" y1="2" x2="6" y2="10"></line>
      <polyline points="2,6 6,10 10,6"></polyline>
    </svg>
  ),
  heart: (p) => (
    <svg {...p} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M9 15.5l-5.5-5a3.5 3.5 0 0 1 5-5L9 6.5l.5-1a3.5 3.5 0 0 1 5 5L9 15.5z"></path>
    </svg>
  ),
  plus: (p) => (
    <svg {...p} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <line x1="6" y1="2" x2="6" y2="10"></line>
      <line x1="2" y1="6" x2="10" y2="6"></line>
    </svg>
  ),
  close: (p) => (
    <svg {...p} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <line x1="3" y1="3" x2="11" y2="11"></line>
      <line x1="11" y1="3" x2="3" y2="11"></line>
    </svg>
  ),
  zoom: (p) => (
    <svg {...p} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="6" cy="6" r="4"></circle>
      <line x1="9" y1="9" x2="12" y2="12"></line>
      <line x1="6" y1="4" x2="6" y2="8"></line>
      <line x1="4" y1="6" x2="8" y2="6"></line>
    </svg>
  ),
};

/* ---------- PLACEHOLDER IMAGE ---------- */
function Placeholder({ label, palette = "warm", corner = true, className = "", style = {}, img = null, tint = true }) {
  const bgStyle = img ? {
    backgroundImage: `${tint ? "linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.45) 100%)," : ""} url(${img})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    ...style
  } : style;
  return (
    <div className={`ph ${palette} ${img ? "has-img" : ""} ${className}`} style={bgStyle}>
      {corner && <span className="ph-corner"></span>}
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
}

/* ---------- MARQUEE ---------- */
function Marquee({ items, speed = "" }) {
  // Duplicate items to enable seamless loop
  const doubled = [...items, ...items];
  return (
    <div className={`marquee ${speed}`}>
      {doubled.map((it, i) => (
        <span key={i} className="marquee-item">
          {it}
          <span className="star">✦</span>
        </span>
      ))}
    </div>
  );
}

/* ---------- REVEAL ON SCROLL ---------- */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- CURSOR BLOB ---------- */
function CursorBlob() {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);
  return <div ref={ref} className="cursor-blob"></div>;
}

Object.assign(window, { Icon, Placeholder, Marquee, Reveal, CursorBlob });
