"use client";

import Link from "next/link";
import { Github, Code, Cpu, Globe, Terminal } from "lucide-react";

export default function DevelopersPage() {
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
            <main className="relative z-10 flex flex-col grow py-20 px-4 sm:px-10 justify-center">
                <div className="w-full max-w-7xl mx-auto space-y-12">

                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/10 pb-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Code className="text-primary h-8 w-8" />
                                <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-white/40">System Architecture</p>
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter italic leading-none">
                                DEV <span className="text-primary">TEAM</span>
                            </h1>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Athlos 2026</p>
                            <p className="text-xl font-bold italic">ENGINEERING DIVISION</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        {/* Profile Card */}
                        <div className="bg-[#111] border border-white/10 p-1 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <div className="relative p-8 border border-white/5 h-full bg-[#0a0a0a]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                        <Terminal className="h-8 w-8 text-white/60 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-mono text-[9px] text-primary uppercase tracking-widest border border-primary/20 px-2 py-1 rounded-full mb-2">
                                            Lead Architect
                                        </span>
                                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
                                            ID: DEV-001
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black uppercase italic tracking-tight text-white mb-2 group-hover:text-primary transition-colors">
                                    Sword-Saint69
                                </h3>
                                <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-8">
                                    Full Stack Engineering
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                        <Cpu className="h-4 w-4 text-primary" />
                                        <span>Next.js 14 / React Server Components</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <span>Firebase / Real-time Infrastructure</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                        <Code className="h-4 w-4 text-primary" />
                                        <span>Tailwind CSS / Brutalist Design System</span>
                                    </div>
                                </div>

                                <Link
                                    href="https://github.com/Sword-Saint69"
                                    target="_blank"
                                    className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white text-white hover:text-black font-mono text-xs uppercase font-bold py-4 transition-all"
                                >
                                    <Github className="h-4 w-4" />
                                    View GitHub Profile
                                </Link>
                            </div>
                        </div>

                        {/* Tech Stack Info */}
                        <div className="space-y-8">
                            <div className="bg-charcoal/50 p-6 border-l-2 border-primary">
                                <h4 className="font-black italic text-xl uppercase mb-2">System Core</h4>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Built on the Next.js App Router for maximum performance and SEO.
                                    Leveraging Server Side Rendering (SSR) for initial loads and
                                    Client Components for interactive features.
                                </p>
                            </div>

                            <div className="bg-charcoal/50 p-6 border-l-2 border-white/20">
                                <h4 className="font-black italic text-xl uppercase mb-2">Real-time Data</h4>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Powered by Google Firebase Firestore for instant updates on
                                    event results, winner announcements, and certificate generation.
                                </p>
                            </div>

                            <div className="bg-charcoal/50 p-6 border-l-2 border-white/20">
                                <h4 className="font-black italic text-xl uppercase mb-2">Design System</h4>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    Custom-built Brutalist aesthetic using Tailwind CSS.
                                    Featuring high-contrast typography, raw borders, and
                                    motion-reduced interactions for a professional athletic feel.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <footer className="fixed bottom-10 left-10 right-10 z-50 flex justify-between items-end pointer-events-none">
                <div className="space-y-1">
                    <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.5em]">Engineering</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-mono text-[9px] uppercase text-white/40">Systems Nominal</span>
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
