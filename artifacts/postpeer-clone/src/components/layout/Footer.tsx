import { Link } from "wouter";
import { Flame, Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8 text-sm relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center">
                <Flame size={14} className="fill-black" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">PostPeer</span>
            </Link>
            <p className="text-gray-400 max-w-xs leading-relaxed font-mono text-xs">
              One API to post, schedule, and automate across every social media platform. Built for developers and AI agents.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide uppercase text-xs">Product</h4>
            <ul className="space-y-3 text-gray-500 font-mono text-xs">
              <li><Link href="/apis" className="hover:text-white transition-colors">APIs</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 tracking-wide uppercase text-xs">Company</h4>
            <ul className="space-y-3 text-gray-500 font-mono text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-gray-600 font-mono text-xs">
          <p>© 2024 PostPeer, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors"><Twitter size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Github size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
