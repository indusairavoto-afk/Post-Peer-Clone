import { useGetDashboardStats, useListPosts, getGetDashboardStatsQueryKey, getListPostsQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { format } from "date-fns";
import { PenSquare, Activity, CheckCircle2, Clock, Globe, ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";

const PlatformIcons: Record<string, any> = {
  twitter: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  pinterest: FaPinterest,
  bluesky: SiBluesky,
  threads: SiThreads,
};

export default function Dashboard() {
  const { user } = useUser();
  
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });
  
  const { data: recentPostsData, isLoading: postsLoading } = useListPosts(
    { limit: 5 },
    { query: { queryKey: getListPostsQueryKey({ limit: 5 }) } }
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const percentUsed = stats ? Math.min(100, Math.round((stats.creditsUsed / stats.creditsTotal) * 100)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            {getGreeting()}, {user?.firstName || "Developer"}
          </h1>
          <p className="text-gray-400 text-sm">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        <Link 
          href="/compose" 
          className="bg-white text-black px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2 border border-white"
        >
          <PenSquare size={16} /> Compose Post
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Posts" 
          value={statsLoading ? "—" : stats?.totalPosts} 
          icon={Activity} 
          subtitle="All time created" 
        />
        <StatCard 
          title="Published" 
          value={statsLoading ? "—" : stats?.publishedPosts} 
          icon={CheckCircle2} 
          subtitle="Successfully delivered" 
        />
        <StatCard 
          title="Scheduled" 
          value={statsLoading ? "—" : stats?.scheduledPosts} 
          icon={Clock} 
          subtitle="Awaiting delivery" 
        />
        <StatCard 
          title="Platforms" 
          value={statsLoading ? "—" : stats?.connectedPlatforms} 
          icon={Globe} 
          subtitle="Currently connected" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-4">
            <h2 className="text-lg font-medium text-white">Recent Posts</h2>
            <Link href="/posts" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
            {postsLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
            ) : !recentPostsData?.posts.length ? (
              <div className="p-8 text-center border-b border-[#222]">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
                  <FileText size={20} className="text-gray-500" />
                </div>
                <h3 className="text-white text-sm font-medium mb-1">No posts yet</h3>
                <p className="text-xs text-gray-500 mb-4">Create your first post to see it here.</p>
                <Link href="/compose" className="text-xs text-black bg-white px-3 py-1.5 rounded-sm hover:bg-gray-200">
                  Compose
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222] text-gray-500 bg-[#0a0a0a]">
                    <th className="text-left py-3 px-4 font-medium w-1/2">Content</th>
                    <th className="text-left py-3 px-4 font-medium">Platforms</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPostsData.posts.map((post) => (
                    <tr key={post.id} className="border-b border-[#222] last:border-0 hover:bg-[#151515] transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-gray-300 truncate max-w-[200px] lg:max-w-[300px]">
                          {post.content}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex -space-x-1">
                          {post.platforms.map((p, i) => {
                            const Icon = PlatformIcons[p] || Globe;
                            return (
                              <div key={i} className="w-6 h-6 rounded-full bg-[#222] border border-[#111] flex items-center justify-center text-white" title={p}>
                                <Icon size={10} />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-sm border ${
                          post.status === 'published' ? 'border-green-900 text-green-400 bg-green-950/30' :
                          post.status === 'scheduled' ? 'border-yellow-900 text-yellow-400 bg-yellow-950/30' :
                          post.status === 'failed' ? 'border-red-900 text-red-400 bg-red-950/30' :
                          'border-gray-800 text-gray-400 bg-gray-900'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            post.status === 'published' ? 'bg-green-400' :
                            post.status === 'scheduled' ? 'bg-yellow-400' :
                            post.status === 'failed' ? 'bg-red-400' :
                            'bg-gray-400'
                          }`}></span>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {format(new Date(post.createdAt), "MMM d, h:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white border-b border-[#222] pb-4">API Usage</h2>
          <div className="bg-[#111] border border-[#222] rounded-md p-5">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Credits</p>
                <p className="text-2xl font-semibold text-white">
                  {statsLoading ? "—" : stats?.creditsUsed.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ {statsLoading ? "—" : stats?.creditsTotal.toLocaleString()}</span>
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-[#222] text-gray-300">
                {percentUsed}%
              </span>
            </div>
            
            <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden mt-4">
              <div 
                className={`h-full rounded-full ${percentUsed > 90 ? 'bg-red-500' : 'bg-white'}`}
                style={{ width: `${percentUsed}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Resets on the 1st of next month. <Link href="/settings" className="text-white hover:underline">Upgrade plan</Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, subtitle }: any) {
  return (
    <div className="bg-[#111] border border-[#222] p-5 rounded-md hover:border-[#333] transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="text-[#333] group-hover:text-white transition-colors">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  );
}