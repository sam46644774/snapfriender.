
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SnapUser, AppStatus } from './types';
import { searchRealUsers, RealSnapUser } from './services/geminiService';

const GhostIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={`${className} text-black ghost-float`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.21.89 4.21 2.34 5.66.16.16.32.32.49.47C6.31 16.5 6 17.17 6 18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-.83-.31-1.5-.83-1.87.17-.15.33-.31.49-.47C19.11 14.21 20 12.21 20 10c0-4.42-3.58-8-8-8zm0 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const ITEMS_PER_PAGE = 30;

const CATEGORIES = [
  { label: '🔥 Streaks', query: 'Snapchat streaks' },
  { label: '❤️ Dating', query: 'Snapchat dating' },
  { label: '🎮 Gamers', query: 'Snapchat gamers' },
  { label: '🎓 Students', query: 'College Snapchat' },
  { label: '🔞 Mature', query: 'Adult Snapchat' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'discover'>('discover');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('Snapchat friends');
  const [realUsers, setRealUsers] = useState<RealSnapUser[]>([]);
  const [discoveryStatus, setDiscoveryStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [recordsScanned, setRecordsScanned] = useState(4821094);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [batchOffset, setBatchOffset] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecordsScanned(prev => prev + Math.floor(Math.random() * 20));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'discover' && realUsers.length === 0) {
      handleSearch();
    }
  }, [activeTab]);

  const handleSearch = async (queryOverride?: string, loadMore: boolean = false) => {
    const query = queryOverride || searchQuery;
    setDiscoveryStatus(AppStatus.PROCESSING);
    
    if (!loadMore) {
      setRealUsers([]);
      setBatchOffset(0);
    }

    const { users, error } = await searchRealUsers(query, batchOffset, genderFilter);
    
    if (users) {
      setRealUsers(prev => [...prev, ...users]);
      setBatchOffset(prev => prev + 1);
    }
    setDiscoveryStatus(AppStatus.IDLE);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const openSnapchat = (username: string) => {
    window.open(`https://www.snapchat.com/add/${username}`, '_blank');
  };

  const filteredResults = useMemo(() => {
    if (genderFilter === 'all') return realUsers;
    return realUsers.filter(u => u.gender?.toLowerCase() === genderFilter);
  }, [realUsers, genderFilter]);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-black text-white overflow-hidden select-none font-sans">
      <header className="bg-[#FFFC00] pt-10 pb-4 px-6 flex flex-col items-center border-b-2 border-black sticky top-0 z-50 shadow-xl">
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-black uppercase tracking-tighter">Engine v4.0 Active</span>
        </div>
        
        <GhostIcon className="w-12 h-12" />
        <h1 className="text-2xl font-black mt-2 tracking-tighter text-black uppercase italic">SnapConnect</h1>
        
        <div className="flex w-full mt-6 bg-black/5 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 rounded-lg font-black text-[11px] uppercase transition-all ${activeTab === 'discover' ? 'bg-black text-[#FFFC00]' : 'text-black/40'}`}
          >
            Ghost Crawler
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 rounded-lg font-black text-[11px] uppercase transition-all ${activeTab === 'add' ? 'bg-black text-[#FFFC00]' : 'text-black/40'}`}
          >
            Manual Batch
          </button>
        </div>
      </header>

      {activeTab === 'discover' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 bg-zinc-900/50 border-b border-white/5 space-y-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => { setSearchQuery(cat.query); handleSearch(cat.query); }}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${searchQuery === cat.query ? 'bg-[#FFFC00] text-black border-[#FFFC00]' : 'bg-black/40 text-white/40 border-white/10'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
               {(['all', 'male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGenderFilter(g); handleSearch(); }}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${genderFilter === g ? 'bg-[#FFFC00] text-black shadow-lg' : 'text-white/40'}`}
                  >
                    {g}
                  </button>
               ))}
            </div>
          </div>

          <main ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 pb-24 scrollbar-hide">
            {discoveryStatus === AppStatus.PROCESSING && filteredResults.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#FFFC00] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-[#FFFC00] uppercase tracking-widest animate-pulse">Initializing Pulse...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-32 text-center opacity-20">
                <GhostIcon className="w-16 h-16 mx-auto mb-4 grayscale" />
                <p className="text-xs font-black uppercase">No Nodes Found</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-[#FFFC00] uppercase tracking-widest">
                    Live Nodes: {filteredResults.length}
                  </span>
                  <span className="text-[8px] font-black text-white/20 uppercase italic">Updating 1.2ms</span>
                </div>

                {filteredResults.map((user, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl hover:border-[#FFFC00]/40 transition-all flex items-center justify-between group active:scale-[0.98]">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-white group-hover:text-[#FFFC00] transition-colors truncate">@{user.username}</h3>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${user.gender === 'female' ? 'bg-pink-500/20 text-pink-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          {user.gender}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 italic line-clamp-1">{user.bio}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => copyToClipboard(user.username, `u-${idx}`)} 
                        className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase transition-all ${copiedId === `u-${idx}` ? 'bg-green-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
                      >
                        {copiedId === `u-${idx}` ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                        onClick={() => openSnapchat(user.username)} 
                        className="px-4 py-2.5 rounded-xl font-black text-[9px] uppercase bg-[#FFFC00] text-black active:scale-90"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => handleSearch(undefined, true)}
                  disabled={discoveryStatus === AppStatus.PROCESSING}
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase text-[#FFFC00] hover:bg-white/10 transition-all"
                >
                  {discoveryStatus === AppStatus.PROCESSING ? 'Loading...' : 'Ingest More Nodes'}
                </button>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-1 p-6 space-y-6 flex flex-col bg-zinc-950">
          <h2 className="text-xl font-black text-[#FFFC00] uppercase italic">Local Batch Ingest</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text dumps here..."
            className="flex-1 w-full p-6 bg-zinc-900 border border-white/5 rounded-3xl font-bold text-sm focus:border-[#FFFC00] outline-none text-white resize-none shadow-inner"
          />
          <button
            onClick={() => {
              const regex = /(?:snapchat\.com\/add\/|@)?([a-zA-Z0-9._-]+)/gi;
              const matches = Array.from(inputText.matchAll(regex)).map(m => m[1]);
              const results = matches.map(m => ({ username: m, bio: 'Manual import', sourceUrl: 'Local', gender: 'unknown' as const }));
              setRealUsers(prev => [...results, ...prev]);
              setInputText('');
              setActiveTab('discover');
            }}
            className="w-full py-5 bg-[#FFFC00] text-black font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            Extract & Ingest
          </button>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-50">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Global Nodes</span>
          <span className="text-[11px] font-black text-green-500 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {recordsScanned.toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Filter</span>
          <span className="text-[11px] font-black text-white/60 uppercase">{genderFilter.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
