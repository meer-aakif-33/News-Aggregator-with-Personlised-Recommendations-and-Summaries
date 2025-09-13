import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Trending", path: "/trending" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav
    className={`fixed top-0 left-0 w-full z-50 transition-colors transition-shadow duration-300
      ${scrolled
        ? "bg-white/50 backdrop-blur-md border-b border-white/50 shadow-lg"
        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition"
            onClick={() => setIsOpen(false)} // ✅ close mobile menu if open
          >
            NewsApp
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex space-x-8 text-black font-medium">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`relative group transition ${
                      isActive
                        ? "text-yellow-300 font-bold"
                        : "hover:text-orange-300"
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-300 transition-all ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                </li>
              );
            })}

            {/* Logout button (neutral, no highlight) */}
            <li>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg 
                           transition shadow-md"
              >
                Logout
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 shadow-lg backdrop-blur-md"
          >
            <ul className="flex flex-col space-y-3 px-4 py-4 text-white font-medium">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block py-2 px-2 rounded-md transition ${
                        isActive
                          ? "bg-white/20 text-yellow-300 font-bold"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}

              {/* Logout button (neutral, no highlight) */}
              <li>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition w-full shadow-md"
                >
                  Logout
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
