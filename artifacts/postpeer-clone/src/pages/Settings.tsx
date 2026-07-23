import { useGetUserProfile, useGetDashboardStats, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { useUser, useClerk } from "@clerk/react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { User, CreditCard, LogOut, ExternalLink, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const { data: profile, isLoading: profileLoading } = useGetUserProfile({
    query: { queryKey: getGetUserProfileQueryKey() }
  });

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  const percentUsed = stats ? Math.min(100, Math.round((stats.creditsUsed / stats.creditsTotal) * 100)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account preferences and subscription.</p>
      </header>

      <div className="space-y-6">
        
        {/* Account Section */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <h2 className="text-sm font-medium text-white">Account Details</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-md bg-[#222] flex items-center justify-center border border-[#333] overflow-hidden shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.fullName || "User"}</h3>
                <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                {profile && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t border-[#222] pt-6">
              <button 
                onClick={() => window.open('https://accounts.clerk.com/user', '_blank')}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors border border-[#333] hover:border-gray-500 px-4 py-2 rounded bg-[#0a0a0a]"
              >
                Manage Profile in Clerk <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <h2 className="text-sm font-medium text-white">Subscription & Usage</h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white capitalize">{profile?.plan || "Free"}</h3>
                  <span className="bg-[#222] text-xs px-2 py-1 rounded text-gray-300 border border-[#333]">Active</span>
                </div>
              </div>
              <Link 
                href="/pricing" 
                className="bg-white text-black px-4 py-2 text-sm font-bold rounded hover:bg-gray-200 transition-colors text-center"
              >
                Upgrade Plan
              </Link>
            </div>

            <div className="border-t border-[#222] pt-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs text-white mb-1">Monthly API Credits</p>
                  <p className="text-xs text-gray-500">
                    {statsLoading ? "—" : stats?.creditsUsed.toLocaleString()} used of {statsLoading ? "—" : stats?.creditsTotal.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {percentUsed}%
                </span>
              </div>
              
              <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${percentUsed > 90 ? 'bg-red-500' : 'bg-white'}`}
                  style={{ width: `${percentUsed}%` }}
                ></div>
              </div>
              {percentUsed > 90 && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <Shield size={12} /> You are approaching your monthly limit.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-950/10 border border-red-900/30 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/20 bg-red-950/20 flex items-center gap-2">
            <Shield size={16} className="text-red-400" />
            <h2 className="text-sm font-medium text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Sign Out</h3>
                <p className="text-xs text-gray-500">Securely log out of your PostMVP dashboard.</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="bg-[#0a0a0a] border border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300 px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 justify-center"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}