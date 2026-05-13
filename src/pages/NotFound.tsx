import { Link } from "react-router-dom";
import { Icon } from "../components/ui/Icon";

/** Friendly 404 — keeps the brand voice rather than a sterile message. */
export function NotFound() {
  return (
    <main className="fade-in notfound">
      <h1>404</h1>
      <p>This piece has been moved to the archive. Let's find you something live.</p>
      <Link to="/shop/new" className="btn btn-primary">
        Back to the drop <Icon.Arrow />
      </Link>
    </main>
  );
}
