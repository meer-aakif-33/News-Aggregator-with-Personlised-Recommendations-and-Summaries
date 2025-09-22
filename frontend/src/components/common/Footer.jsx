import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div>
            <h2 className="text-2xl font-bold mb-3">NewsApp</h2>
            <p className="text-gray-200 text-sm">
              Stay updated with the latest news and personalized content. 
              Bringing trending topics directly to your feed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-gray-200">
              <li><a href="/" className="hover:text-yellow-300 transition">Home</a></li>
              <li><a href="/trending" className="hover:text-yellow-300 transition">Trending</a></li>
              <li><a href="/profile" className="hover:text-yellow-300 transition">Profile</a></li>
              {/* <li><a href="/about" className="hover:text-yellow-300 transition">About Us</a></li> */}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Connect with Me</h3>
            <div className="flex space-x-4 text-2xl">
              <a
                href="https://github.com/meer-aakif-33"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300 transition"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/aakif-ahmad-mir-2b5b80288"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300 transition"
              >
                <FaLinkedin />
              </a>
              {/* <a
                href="https://twitter.com/your-twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300 transition"
              >
                <FaTwitter />
              </a> */}
              <a
                href="mailto:aakifofficial@gmail.com"
                className="hover:text-yellow-300 transition"
              >
                <FaEnvelope />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-6 pt-4 text-center text-sm text-gray-300">
          © {new Date().getFullYear()} NewsApp. Built with ❤️ by Aakif.
        </div>
      </div>
    </footer>
  );
}
