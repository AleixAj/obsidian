import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";

/** Footer navigation columns — kept as data so they're easy to extend. */
const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { to: "/shop/new", label: "New In" },
      { to: "/shop/outerwear", label: "Outerwear" },
      { to: "/shop/knitwear", label: "Knitwear" },
      { to: "/shop/accessories", label: "Accessories" },
      { to: "/shop/archive", label: "Archive Sale" },
    ],
  },
  {
    title: "About",
    links: [
      { to: "/lookbook", label: "Story" },
      { to: "/lookbook", label: "Lookbook" },
      { to: "/lookbook", label: "Materials" },
      { to: "/lookbook", label: "Stockists" },
      { to: "/lookbook", label: "Journal" },
    ],
  },
  {
    title: "Service",
    links: [
      { to: "/lookbook", label: "Shipping" },
      { to: "/lookbook", label: "Returns" },
      { to: "/lookbook", label: "Size guide" },
      { to: "/lookbook", label: "Contact" },
      { to: "/lookbook", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Logo />
          <p>
            Heavyweight goods cast in gold. Designed in Barcelona, crafted in Los Angeles, worn
            after midnight in every city that matters.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div className="footer-col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-col footer-newsletter">
          <h4>Join the Inner Circle</h4>
          <p style={{ color: "var(--fg-dim)", fontSize: 13, marginBottom: 16 }}>
            Early access to drops, exclusive pieces, and private events.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // The newsletter submit is a UI mock for now.
            }}
          >
            <input type="email" placeholder="your@email.com" required />
            <button type="submit">Subscribe →</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Aleix Auqué · Barcelona / Los Angeles / Tokyo
        </span>
        <div className="links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a>Cookies</a>
          <a>Instagram ↗</a>
          <a>TikTok ↗</a>
        </div>
      </div>
    </footer>
  );
}
