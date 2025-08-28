import { Link } from "react-router-dom";

export default function Header({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="logo">NewsApp</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/trending">Trending</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li>
          <button onClick={onLogout} className="logout-btn text-white cursor-pointer">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

