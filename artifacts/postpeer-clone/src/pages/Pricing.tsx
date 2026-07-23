import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly" | "payg">("monthly");

  const plans = [
    {
      name: "Free",
      price: "$0",
      credits: "20 credits",
      per1k: "—",
      team: "1",
      cta: "Current Plan",
      features: [
        "Twitter/X APIs",
        "TikTok APIs",
        "Instagram APIs",
        "YouTube APIs",
        "Facebook APIs",
        "Pinterest APIs",
        "Bluesky APIs",
        "LinkedIn APIs",
        "Threads APIs",
        "More Coming Soon",
        "Unlimited Connected Accounts"
      ],
      popular: false
    },
    {
      name: "Starter",
      price: "$25",
      credits: "2,000 credits",
      per1k: "$12.50",
      team: "5",
      cta: "Get Started",
      features: [
        "Twitter/X APIs",
        "TikTok APIs",
        "Instagram APIs",
        "YouTube APIs",
        "Facebook APIs",
        "Pinterest APIs",
        "Bluesky APIs",
        "LinkedIn APIs",
        "Threads APIs",
        "More Coming Soon",
        "Unlimited Connected Accounts"
      ],
      popular: false
    },
    {
      name: "Standard",
      price: "$43",
      credits: "6,000 credits",
      per1k: "$7.17",
      team: "20",
      cta: "Get Started",
      features: [
        "Twitter/X APIs",
        "TikTok APIs",
        "Instagram APIs",
        "YouTube APIs",
        "Facebook APIs",
        "Pinterest APIs",
        "Bluesky APIs",
        "LinkedIn APIs",
        "Threads APIs",
        "More Coming Soon",
        "Unlimited Connected Accounts"
      ],
      popular: true
    },
    {
      name: "Pro",
      price: "$120",
      credits: "20,000 credits",
      per1k: "$6.00",
      team: "Unlimited",
      cta: "Get Started",
      features: [
        "Twitter/X APIs",
        "TikTok APIs",
        "Instagram APIs",
        "YouTube APIs",
        "Facebook APIs",
        "Pinterest APIs",
        "Bluesky APIs",
        "LinkedIn APIs",
        "Threads APIs",
        "More Coming Soon",
        "Unlimited Connected Accounts"
      ],
      popular: false
    }
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white pt-32 pb-24 px-6 relative selection:bg-white selection:text-black z-10">
      
      {/* Background Effect */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-mono uppercase tracking-wider mb-6">
            Pricing
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
            Get Started <span className="bg-white text-black px-4 py-1 rounded-lg inline-block transform rotate-1">for Free</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm md:text-base leading-relaxed">
            Post, schedule, and manage content across Twitter, Instagram, YouTube, TikTok, Facebook, and more with one API.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-sm">
            <button 
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${billing === "monthly" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${billing === "yearly" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            >
              Yearly (30% off)
            </button>
            <button 
              onClick={() => setBilling("payg")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${billing === "payg" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            >
              PAYG
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl border ${
                plan.popular 
                  ? "bg-white text-black border-transparent shadow-2xl shadow-white/10" 
                  : "bg-black text-white border-white/20"
              } p-8 flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-black" : "text-white"}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.price !== "$0" && <span className={`text-sm ${plan.popular ? "text-gray-600" : "text-gray-500"}`}>/mo</span>}
                </div>
                <div className={`text-sm font-mono ${plan.popular ? "text-gray-700" : "text-gray-400"}`}>
                  {plan.credits}
                </div>
              </div>

              <button 
                className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mb-8 ${
                  plan.popular
                    ? "bg-black text-white hover:bg-gray-800"
                    : plan.name === "Free"
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {plan.cta} <ChevronRight size={16} />
              </button>

              <div className={`space-y-4 mb-8 text-sm font-mono flex-grow ${plan.popular ? "text-gray-800" : "text-gray-300"}`}>
                <div className="flex justify-between border-b border-inherit pb-2">
                  <span>Per 1k credits</span>
                  <span className="font-bold">{plan.per1k}</span>
                </div>
                <div className="flex justify-between border-b border-inherit pb-2">
                  <span>Team members</span>
                  <span className="font-bold">{plan.team}</span>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-bold mb-4 uppercase tracking-wider ${plan.popular ? "text-black" : "text-white"}`}>
                  Includes All APIs
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm font-mono">
                      <CheckCircle2 size={16} className={plan.popular ? "text-black" : "text-white"} />
                      <span className={plan.popular ? "text-gray-700" : "text-gray-400"}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
