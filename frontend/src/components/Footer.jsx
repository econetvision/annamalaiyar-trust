import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>Annamalaiyar Trust &middot; Chinna Salem - 606201, Kallakurichi District</div>
        <div>Sri Muruga Vilas Group of Company &middot; Since 1923 &middot; 100+ Years of Trust</div>
        <Link to="/admin" className="footer-admin-link">
          Admin Login
        </Link>
      </div>
    </footer>
  );
}
