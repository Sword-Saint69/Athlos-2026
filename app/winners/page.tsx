"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Event {
    id: string;
    name: string;
    category: string;
    eventId: string;
    maxParticipants: number;
    status: 'upcoming' | 'active' | 'completed';
    winners?: {
        name: string;
        group: string;
        position: number;
        universityCode?: string;
    }[];
}

export default function WinnersPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const q = query(
                    collection(db, "events"),
                    where("status", "==", "completed")
                );

                const querySnapshot = await getDocs(q);
                const eventsData: Event[] = [];

                querySnapshot.forEach((doc) => {
                    eventsData.push({
                        id: doc.id,
                        ...doc.data()
                    } as Event);
                });

                eventsData.sort((a, b) => a.name.localeCompare(b.name));
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching winners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWinners();
    }, []);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-dark text-white font-display overflow-hidden">
            {/* Track lines background */}
            <div className="fixed inset-0 track-lines opacity-60 pointer-events-none"></div>

            {/* Lane numbers */}
            <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                <div className="relative"><span className="lane-number">01</span></div>
                <div className="relative"><span className="lane-number">02</span></div>
                <div className="relative"><span className="lane-number">03</span></div>
                <div className="relative"><span className="lane-number text-primary/20">04</span></div>
                <div className="relative"><span className="lane-number">05</span></div>
                <div className="relative"><span className="lane-number">06</span></div>
                <div className="relative"><span className="lane-number">07</span></div>
                <div className="relative"><span className="lane-number">08</span></div>
            </div>

            {/* Navigation */}
            <div className="fixed top-10 right-10 z-50 flex gap-8">
                <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/">Home</Link>
                <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/registration">Registration</Link>
                <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/scorecard">Result</Link>
                <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/winners">Winner</Link>
                <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/developers">Dev</Link>
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col grow py-20 px-4 sm:px-10">
                <div className="w-full max-w-7xl mx-auto space-y-12">

                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/10 pb-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Trophy className="text-primary h-8 w-8" />
                                <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-white/40">Hall of Fame</p>
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter italic leading-none">
                                EVENT <span className="text-primary">WINNERS</span>
                            </h1>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Athlos 2026</p>
                            <p className="text-xl font-bold italic">OFFICIAL RESULTS</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-white/30 space-y-4">
                            <Trophy className="h-20 w-20 opacity-20" />
                            <p className="font-mono text-lg uppercase tracking-widest">No results published yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <div key={event.id} className="bg-[#111] border border-white/5 hover:border-primary/50 transition-colors group">
                                    <div className="p-6 border-b border-white/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="font-mono text-[9px] text-primary uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded-full">
                                                {event.category}
                                            </span>
                                            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
                                                ID: {event.eventId}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">
                                            {event.name}
                                        </h3>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {event.winners && event.winners.length > 0 ? (
                                            event.winners.sort((a, b) => a.position - b.position).map((winner, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className={`
                            w-10 h-10 flex items-center justify-center font-black italic text-lg clip-path-slant
                            ${winner.position === 1 ? 'bg-yellow-500 text-black' :
                                                            winner.position === 2 ? 'bg-gray-400 text-black' :
                                                                'bg-amber-700 text-white'}
                          `}>
                                                        {winner.position}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-lg font-bold text-white uppercase truncate">{winner.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-mono text-[10px] uppercase tracking-wider
                                ${winner.group === 'AGNI' ? 'text-red-500' :
                                                                    winner.group === 'ASTRA' ? 'text-blue-500' :
                                                                        winner.group === 'VAJRA' ? 'text-yellow-500' :
                                                                            winner.group === 'RUDRA' ? 'text-orange-500' : 'text-white/40'}
                              `}>
                                                                {winner.group}
                                                            </p>
                                                            {winner.universityCode && (
                                                                <>
                                                                    <span className="text-white/10 text-[10px]">•</span>
                                                                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                                                                        {winner.universityCode}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="font-mono text-xs text-white/30 uppercase tracking-widest">Results pending</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="fixed bottom-10 left-10 right-10 z-50 flex justify-between items-end pointer-events-none">
                <div className="space-y-1">
                    <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.5em]">Trophy Standings</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500"></div>
                            <span className="font-mono text-[9px] uppercase text-white/40">Gold</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400"></div>
                            <span className="font-mono text-[9px] uppercase text-white/40">Silver</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-700"></div>
                            <span className="font-mono text-[9px] uppercase text-white/40">Bronze</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.5em]">Athlos CEMP. © 2026</p>
                </div>
            </footer>
        </div>
    );
}
