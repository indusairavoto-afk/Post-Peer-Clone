import { Link, useLocation } from "wouter";
import { Flame, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? "bg-black/70 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-white text-black flex items-center justify-center transition-transform group-hover:scale-105">
            <Flame size={20} className="fill-black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">PostPeer</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors">
            APIs <ChevronDown size={14} className="opacity-50 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
          </div>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/pricing" className={`hover:text-white transition-colors ${location === '/pricing' ? 'text-white' : ''}`}>Pricing</Link>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-gray-400 hover:text-white hidden sm:block transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors border border-white">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
