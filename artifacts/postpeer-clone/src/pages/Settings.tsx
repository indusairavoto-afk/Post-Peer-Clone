import { useUser, useClerk } from "@clerk/react";
import { useGetUserProfile, useGetDashboardStats, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { User, CreditCard, LogOut, ExternalLink } from "lucide-react";

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const { data: profile } = useGetUserProfile({
    query: { queryKey: getGetUserProfileQueryKey() },
  });
  const { data: stats } = useGetDashboardStats();

  const percentUsed = stats ? Math.min(100, Math.round((stats.creditsUsed / stats.creditsTotal) * 100)) : 0;

  const planLabels: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    standard: "Standard",
    pro: "Pro",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account and subscription.</p>
      </header>

      <div className="space-y-6">

        {/* Account */}
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
                  <span className="text-xl text-white">
                    {user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.fullName ?? "User"}</h3>
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
                onClick={() => window.open("https://accounts.clerk.com/user", "_blank")}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors border border-[#333] hover:border-gray-500 px-4 py-2 rounded bg-[#0a0a0a]"
              >
                Manage Profile <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <h2 className="text-sm font-medium text-white">Subscription & Usage</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">
                    {planLabels[profile?.plan ?? "free"] ?? "Free"}
                  </span>
                  <span className="text-xs border border-[#333] text-gray-400 px-2 py-0.5 rounded-full">
                    {profile?.plan ?? "free"}
                  </span>
                </div>
              </div>
            </div>

            {stats && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Posts this month</p>
                  <p className="text-xs text-gray-400 font-mono">{stats.creditsUsed} / {stats.creditsTotal}</p>
                </div>
                <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${percentUsed > 90 ? "bg-red-500" : percentUsed > 70 ? "bg-yellow-500" : "bg-white"}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{percentUsed}% used</p>
              </div>
            )}
          </div>
        </section>

        {/* Sign Out */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="p-6">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
