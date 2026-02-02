"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Share2, Download, Printer, Users, CheckCircle, Activity } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface TeamStandings {
  id: string;
  name: string;
  rank: string;
  sector: string;
  points: number;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  color: string;
}

interface GlobalStats {
  totalAthletes: number;
  eventsCompleted: string;
}

export default function ScorecardPage() {
  const [teams, setTeams] = useState<TeamStandings[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    totalAthletes: 0,
    eventsCompleted: "0/0"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to teams collection in real-time
    const qTeams = query(collection(db, "teams"), orderBy("points", "desc"));
    const unsubscribeTeams = onSnapshot(qTeams, (snapshot) => {
      const teamsData: TeamStandings[] = [];
      snapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() } as TeamStandings);
      });
      setTeams(teamsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching teams: ", error);
      setLoading(false);
    });

    // Dynamic aggregation for Global Stats
    // 1. Total Athletes
    const unsubscribeAthletes = onSnapshot(collection(db, "athletes"), (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalAthletes: snapshot.size
      }));
    });

    // 2. Events Summary
    const unsubscribeEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      const total = snapshot.size;
      const completed = snapshot.docs.filter(doc => doc.data().status === 'completed').length;
      setStats(prev => ({
        ...prev,
        eventsCompleted: `${completed}/${total}`
      }));
    });

    return () => {
      unsubscribeTeams();
      unsubscribeAthletes();
      unsubscribeEvents();
    };
  }, []);

  const getTeamColor = (name: string) => {
    switch (name.toUpperCase()) {
      case 'AGNI': return 'border-l-team-agni hover:border-team-agni/40';
      case 'ASTRA': return 'border-l-team-astra hover:border-team-astra/40';
      case 'VAJRA': return 'border-l-team-vajra hover:border-team-vajra/40';
      case 'RUDRA': return 'border-l-team-rudra hover:border-team-rudra/40';
      default: return 'border-l-primary hover:border-primary/40';
    }
  };

  const getTextColor = (name: string) => {
    switch (name.toUpperCase()) {
      case 'AGNI': return 'text-team-agni';
      case 'ASTRA': return 'text-team-astra';
      case 'VAJRA': return 'text-team-vajra';
      case 'RUDRA': return 'text-team-rudra';
      default: return 'text-primary';
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-white selection:bg-primary selection:text-white antialiased">
      {/* Lane numbers */}
      <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
        <div className="relative"><span className="lane-number">1</span></div>
        <div className="relative"><span className="lane-number">2</span></div>
        <div className="relative"><span className="lane-number">3</span></div>
        <div className="relative"><span className="lane-number text-primary/20">4</span></div>
        <div className="relative"><span className="lane-number">5</span></div>
        <div className="relative"><span className="lane-number">6</span></div>
        <div className="relative"><span className="lane-number">7</span></div>
        <div className="relative"><span className="lane-number">8</span></div>
      </div>

      <div className="layout-container relative z-10 flex h-full grow flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 px-4 sm:px-10 py-4 bg-background-dark/80 backdrop-blur-none gap-4 sm:gap-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="size-6 text-primary">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter">Athlos 2026</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center flex-1 sm:flex-none sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
            <nav className="hidden sm:flex items-center gap-6 lg:gap-10">
              <Link className="text-xs sm:text-sm font-mono uppercase tracking-widest hover:text-primary transition-colors" href="/registration">Registration</Link>
              <Link className="text-xs sm:text-sm font-mono uppercase tracking-widest text-primary" href="/scorecard">RESULTS</Link>
              <Link className="text-xs sm:text-sm font-mono uppercase tracking-widest hover:text-primary transition-colors" href="#">Dev</Link>
            </nav>
            <nav className="sm:hidden flex items-center gap-4">
              <div className="relative">
                <button className="font-mono text-xs uppercase tracking-widest hover:text-primary transition-colors">
                  Menu
                </button>
              </div>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col pt-12 md:pt-20 pb-20 px-6 md:px-10">
          <div className="w-full max-w-7xl mx-auto space-y-12 md:space-y-16">
            <div className="relative">
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2">Live Tournament Statistics</p>
              <h1 className="text-6xl md:text-[120px] md:leading-[0.8] font-black uppercase tracking-tighter italic">
                TEAM <span className="text-primary">STANDINGS</span>
              </h1>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="font-mono text-primary animate-pulse tracking-widest uppercase">Initializing Interface...</div>
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 bg-asphalt/50">
                <Activity className="size-12 text-primary/40 mb-4 animate-pulse" />
                <p className="font-mono text-sm text-white/40 uppercase tracking-widest">No Active Data Synchronized</p>
                <button className="mt-4 text-[10px] font-mono text-primary hover:underline uppercase tracking-widest">Force Re-sync</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:grid grid-cols-12 px-6 py-2 border-b border-white/5 font-mono text-[9px] uppercase tracking-widest text-white/30">
                  <div className="col-span-1">Pos</div>
                  <div className="col-span-6">Team Identity</div>
                  <div className="col-span-2 text-right">Points</div>
                  <div className="col-span-3 text-right">Medals (G/S/B)</div>
                </div>

                {teams.map((team, index) => (
                  <div
                    key={team.id}
                    className={`brutalist-row grid grid-cols-12 items-center bg-asphalt border border-white/5 p-4 md:p-6 transition-all duration-300 border-l-[6px] ${getTeamColor(team.name)}`}
                  >
                    <div className="col-span-2 md:col-span-1 text-2xl md:text-4xl font-black italic text-white/20">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="col-span-10 md:col-span-6">
                      <h3 className="text-2xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{team.name}</h3>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-left md:text-right mt-4 md:mt-0">
                      <p className="text-2xl md:text-3xl font-black italic">{team.points.toLocaleString()}</p>
                      <p className="font-mono text-[9px] text-white/40 uppercase">PTS</p>
                    </div>
                    <div className="col-span-6 md:col-span-3 flex justify-end gap-3 md:gap-6 font-mono mt-4 md:mt-0">
                      <div className="text-center group">
                        <p className="text-lg md:text-xl font-bold text-white transition-transform group-hover:scale-110">{team.medals.gold}</p>
                        <div className="h-0.5 w-4 bg-yellow-500 mx-auto mt-1"></div>
                      </div>
                      <div className="text-center group">
                        <p className="text-lg md:text-xl font-bold text-white transition-transform group-hover:scale-110">{team.medals.silver}</p>
                        <div className="h-0.5 w-4 bg-gray-400 mx-auto mt-1"></div>
                      </div>
                      <div className="text-center group">
                        <p className="text-lg md:text-xl font-bold text-white transition-transform group-hover:scale-110">{team.medals.bronze}</p>
                        <div className="h-0.5 w-4 bg-amber-700 mx-auto mt-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12">
              <div>
                <p className="font-mono text-[8px] text-white/40 uppercase tracking-widest mb-1">TOTAL ATHLETES</p>
                <p className="text-xl font-black italic">{stats.totalAthletes.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-mono text-[8px] text-white/40 uppercase tracking-widest mb-1">EVENTS COMPLETED</p>
                <p className="text-xl font-black italic">{stats.eventsCompleted}</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="p-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center md:items-end bg-black/50 gap-8">
          <div className="space-y-4">
            <div className="flex gap-4">
              <button className="size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-all cursor-pointer border border-white/5">
                <Share2 className="size-4" />
              </button>
              <button className="size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-all cursor-pointer border border-white/5">
                <Download className="size-4" />
              </button>
              <button className="size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-all cursor-pointer border border-white/5">
                <Printer className="size-4" />
              </button>
            </div>
            <p className="font-mono text-[6px] sm:text-[8px] text-white/20 uppercase tracking-[0.15em] sm:tracking-[0.3em]">© 2026 ATHLOS . ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
