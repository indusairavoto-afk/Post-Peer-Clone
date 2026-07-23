import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenSquare, FileText, Globe, Key, Settings, Flame, LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { useGetUserProfile } from "@workspace/api-client-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const { data: profile } = useGetUserProfile({
    query: {
      queryKey: ["/api/users/profile"],
    }
  });

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Compose", href: "/compose", icon: PenSquare },
    { name: "Posts", href: "/posts", icon: FileText },
    { name: "Platforms", href: "/platforms", icon: Globe },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-mono overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-[#222222] bg-black flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-sm bg-white text-black flex items-center justify-center">
              <Flame size={16} className="fill-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">PostMVP</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive 
                    ? "bg-white text-black font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-[#111111]"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#222222]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center border border-[#333333] shrink-0 overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-white truncate">{user?.firstName || user?.emailAddresses?.[0]?.emailAddress}</p>
                <p className="text-[10px] text-gray-500 capitalize">{profile?.plan || "Free"} Plan</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-grid relative relative z-0">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="relative z-10 p-8 max-w-6xl mx-auto h-full min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}