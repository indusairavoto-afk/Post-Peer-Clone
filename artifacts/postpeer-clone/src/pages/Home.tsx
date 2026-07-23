import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  FaInstagram, FaFacebook, FaTiktok, FaYoutube, 
  FaLinkedin, FaPinterest, FaTwitter 
} from "react-icons/fa";
import { SiThreads } from "react-icons/si";
import { 
  Zap, Clock, BarChart3, Shield, Bot, Globe, 
  CheckCircle2, ChevronRight, Terminal, Copy 
} from "lucide-react";

const floatingIcons = [
  { Icon: FaInstagram, delay: 0, top: "20%", left: "10%" },
  { Icon: FaTwitter, delay: 0.5, top: "25%", right: "12%" },
  { Icon: FaTiktok, delay: 1, top: "60%", left: "8%" },
  { Icon: FaLinkedin, delay: 1.5, top: "65%", right: "8%" },
  { Icon: FaYoutube, delay: 2, top: "85%", left: "20%" },
  { Icon: SiThreads, delay: 2.5, top: "80%", right: "25%" },
];

const platformIcons = [FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaTwitter, FaPinterest, FaLinkedin, SiThreads];

const features = [
  {
    icon: <Zap className="text-white" size={24} />,
    title: "Fast Setup",
    description: "Connect all platforms with one API key. Go from zero to posting in under 5 minutes."
  },
  {
    icon: <Clock className="text-white" size={24} />,
    title: "Auto Scheduling",
    description: "Queue posts with intelligent scheduling. Set it and forget it across timezones."
  },
  {
    icon: <BarChart3 className="text-white" size={24} />,
    title: "Analytics",
    description: "Track performance, impressions, and engagement metrics centrally."
  },
  {
    icon: <Shield className="text-white" size={24} />,
    title: "Secure",
    description: "Enterprise-grade security, key rotation, and rate limiting built-in."
  },
  {
    icon: <Bot className="text-white" size={24} />,
    title: "AI Ready",
    description: "Built for AI agents and automation workflows. Perfect for programmatic content."
  },
  {
    icon: <Globe className="text-white" size={24} />,
    title: "All Platforms",
    description: "Twitter, Instagram, TikTok, YouTube, LinkedIn, Pinterest, and more."
  }
];

export default function Home() {
  return (
    <div className="w-full overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center min-h-[90vh] justify-center bg-grid z-10">
        
        {/* Floating Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((item, i) => (
            <motion.div
              key={i}
              className="absolute w-14 h-14 md:w-20 md:h-20 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white/40 shadow-2xl shadow-white/5"
              style={{ top: item.top, left: item.left, right: item.right }}
              animate={{ 
                y: [0, -30, 0], 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                delay: item.delay, 
                ease: "easeInOut" 
              }}
            >
              <item.Icon size={32} />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-xs font-mono uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Unified Social Media API
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] mb-6">
            Post to All Socials With <br/> 
            <span className="relative inline-block mt-2">
              <span className="absolute inset-0 bg-white transform -skew-x-6"></span>
              <span className="relative text-black px-4 py-1">One API</span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-mono">
            Add social media posting, scheduling, and automation to your product in minutes. One API, all platforms, unlimited accounts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-gray-500">
            {platformIcons.map((Icon, idx) => (
              <Icon key={idx} size={20} className="hover:text-white transition-colors" />
            ))}
            <span className="font-mono text-sm ml-2">+ more</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              Start Posting for Free <ChevronRight size={18} />
            </Link>
            <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-black text-white border border-white/20 font-bold rounded-md hover:bg-white/5 transition-colors">
              Book a Demo
            </Link>
          </div>
          <p className="text-xs text-gray-500 font-mono">No credit card required.</p>

          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-mono text-gray-300">
            <Zap size={14} className="text-white" /> I'm working with AI agents
          </div>
        </motion.div>

        {/* Terminal & Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 w-full max-w-4xl mx-auto mt-20"
        >
          <div className="rounded-xl overflow-hidden border border-white/20 bg-black shadow-2xl shadow-white/5 text-left">
            <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="ml-4 text-xs font-mono text-gray-500 flex-1 text-center">bash</div>
            </div>
            <div className="p-6 font-mono text-sm md:text-base leading-relaxed overflow-x-auto whitespace-pre">
              <span className="text-gray-500">POST</span> <span className="text-white">https://api.postpeer.dev/v1/posts</span>
              <br/>
              <span className="text-gray-400">&#123;</span>
              <br/>
              <span className="text-white">  "platforms"</span><span className="text-gray-400">: [</span><span className="text-gray-300">"twitter"</span><span className="text-gray-400">, </span><span className="text-gray-300">"linkedin"</span><span className="text-gray-400">],</span>
              <br/>
              <span className="text-white">  "content"</span><span className="text-gray-400">: </span><span className="text-gray-300">"Hello world!"</span>
              <br/>
              <span className="text-gray-400">&#125;</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-sm text-left hover:bg-white/10 transition-colors">
              <div className="text-white font-mono text-xs mb-3 uppercase tracking-wider">Published</div>
              <div className="text-2xl font-bold text-white mb-1">2 platforms</div>
              <div className="text-gray-500 text-xs font-mono">All posts delivered</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-sm text-left hover:bg-white/10 transition-colors">
              <div className="text-white font-mono text-xs mb-3 uppercase tracking-wider">Scheduled queue</div>
              <div className="text-2xl font-bold text-white mb-1">12 Queued</div>
              <div className="text-gray-500 text-xs font-mono">847 Sent / Next: In 15 min</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-sm text-left hover:bg-white/10 transition-colors">
              <div className="text-white font-mono text-xs mb-3 uppercase tracking-wider">Platforms connected</div>
              <div className="text-2xl font-bold text-white mb-1 tracking-widest">X LI FB TT</div>
              <div className="text-gray-500 text-xs font-mono">One API, every platform</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Marquee */}
      <section className="py-10 border-y border-white/10 bg-black/50 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
        
        <div className="flex w-[200%] animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex flex-1 justify-around items-center px-4">
              {['VERCEL', 'RAILWAY', 'SUPABASE', 'LINEAR', 'NOTION', 'FIGMA', 'STRIPE'].map((company, j) => (
                <span key={j} className="text-2xl md:text-3xl font-bold text-white/20 tracking-tighter px-8">{company}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Simple Integration</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono">Everything you need to automate your social presence, accessible via a single robust REST API.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-black border border-white/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-mono">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Code Showcase */}
      <section className="py-24 px-6 border-y border-white/10 bg-black/80 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Integrate in <br/>3 lines of code</h2>
              <p className="text-gray-400 font-mono mb-8 leading-relaxed">
                Stop managing half a dozen OAuth flows and API wrappers. Send one JSON payload and we handle the formatting, rate limiting, and delivery for every network.
              </p>
              <ul className="space-y-4 mb-8">
                {['No OAuth headaches', 'Automatic media resizing', 'Built-in retry logic'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 font-mono text-sm">
                    <CheckCircle2 size={18} className="text-white" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/docs" className="inline-flex items-center gap-2 text-white font-bold hover:underline underline-offset-4">
                Read the Documentation <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center px-4 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                  </div>
                  <button className="text-gray-500 hover:text-white transition-colors"><Copy size={14} /></button>
                </div>
                <div className="p-6 font-mono text-sm overflow-x-auto whitespace-pre text-gray-400">
                  <span className="text-white">curl</span> -X POST https://api.postpeer.dev/v1/posts \
                  <br/>
                  <span className="text-gray-500">  -H</span> "Authorization: Bearer YOUR_API_KEY" \
                  <br/>
                  <span className="text-gray-500">  -d</span> '&#123;"platforms": ["twitter","instagram","linkedin"], "content": "Hello world!"&#125;'
                </div>
              </div>

              <div className="bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl relative left-4 md:left-8 -top-8">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono text-gray-500">Response</div>
                <div className="p-6 font-mono text-sm overflow-x-auto whitespace-pre text-gray-400">
                  &#123;
                  <br/>
                  <span className="text-white">  "status"</span>: <span className="text-white">"success"</span>,
                  <br/>
                  <span className="text-white">  "id"</span>: <span className="text-white">"post_8f72k9d"</span>,
                  <br/>
                  <span className="text-white">  "delivered_to"</span>: [<span className="text-white">"twitter"</span>, <span className="text-white">"instagram"</span>, <span className="text-white">"linkedin"</span>]
                  <br/>
                  &#125;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Simple, transparent pricing</h2>
        <p className="text-gray-400 font-mono mb-10 max-w-2xl mx-auto">Start free, upgrade when you need more volume. No hidden fees or surprise overages.</p>
        <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors">
          View Pricing <ChevronRight size={18} />
        </Link>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-white text-black text-center relative z-10 border-t border-white/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter leading-tight">Start posting to every platform with one API key</h2>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-black text-white font-bold rounded-md hover:bg-gray-900 transition-transform hover:scale-105 active:scale-95 shadow-xl">
            Start Posting for Free <Terminal size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
