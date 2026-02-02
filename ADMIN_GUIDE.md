<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ATHLOS 2025 | Team Standings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&amp;family=Noto+Sans:wght@100..900&amp;family=Roboto+Mono:wght@300;400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#f20d0d",
                        "background-dark": "#000000",
                        "track-gray": "#1a1a1a",
                        "asphalt": "#111111",
                        "team-agni": "#f20d0d",
                        "team-astra": "#0d6ef2",
                        "team-vajra": "#f2d60d",
                        "team-rudra": "#f27c0d",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"],
                        "mono": ["'Roboto Mono'", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
                },
            },
        }
    </script>
<style type="text/tailwindcss">
        .track-lines {
            background-image: linear-gradient(to right, #1a1a1a 1px, transparent 1px);
            background-size: 12.5% 100%;
        }
        .lane-number {
            font-family: 'Lexend', sans-serif;
            font-weight: 900;
            opacity: 0.03;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20rem;
            pointer-events: none;
            user-select: none;
        }
        .brutalist-row {
            border-left: 4px solid transparent;
            transition: all 0.2s ease;
        }
        .brutalist-row:hover {
            background: #0a0a0a;
            transform: translateX(8px);
        }
    </style>
</head>
<body class="bg-background-dark font-display text-white selection:bg-primary selection:text-white antialiased">
<div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
<div class="fixed inset-0 track-lines pointer-events-none"></div>
<div class="fixed inset-0 grid grid-cols-8 pointer-events-none">
<div class="relative"><span class="lane-number">1</span></div>
<div class="relative"><span class="lane-number">2</span></div>
<div class="relative"><span class="lane-number">3</span></div>
<div class="relative"><span class="lane-number">4</span></div>
<div class="relative"><span class="lane-number">5</span></div>
<div class="relative"><span class="lane-number">6</span></div>
<div class="relative"><span class="lane-number">7</span></div>
<div class="relative"><span class="lane-number">8</span></div>
</div>
<div class="layout-container relative z-10 flex h-full grow flex-col">
<header class="flex items-center justify-between border-b border-white/10 px-10 py-4 bg-black/80 backdrop-blur-md sticky top-0 z-50">
<div class="flex items-center gap-4">
<div class="size-6 text-primary">
<svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
</svg>
</div>
<h2 class="text-xl font-black uppercase tracking-tighter">Athlos 2025</h2>
</div>
<div class="flex flex-1 justify-end gap-12">
<nav class="flex items-center gap-10">
<a class="text-xs font-mono uppercase tracking-widest hover:text-primary transition-colors" href="#">Certificates</a>
<a class="text-xs font-mono uppercase tracking-widest text-primary" href="#">Rankings</a>
<a class="text-xs font-mono uppercase tracking-widest hover:text-primary transition-colors" href="#">Profile</a>
</nav>
<button class="bg-primary hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-8 py-2 transition-all">
                        Login
                    </button>
</div>
</header>
<main class="flex-1 flex flex-col pt-20 pb-20 px-10">
<div class="w-full max-w-7xl mx-auto space-y-16">
<div class="relative">
<p class="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2">Live Tournament Statistics</p>
<h1 class="text-[120px] leading-[0.8] font-black uppercase tracking-tighter italic">
                            TEAM <span class="text-primary">STANDINGS</span>
</h1>
</div>
<div class="space-y-4">
<div class="grid grid-cols-12 px-6 py-2 border-b border-white/5 font-mono text-[9px] uppercase tracking-widest text-white/30">
<div class="col-span-1">Pos</div>
<div class="col-span-6">Team Identity</div>
<div class="col-span-2 text-right">Points</div>
<div class="col-span-3 text-right">Medals (G/S/B)</div>
</div>
<div class="brutalist-row grid grid-cols-12 items-center bg-asphalt border border-white/5 p-6 hover:border-team-agni/40 border-l-team-agni" style="border-left-width: 6px;">
<div class="col-span-1 text-4xl font-black italic text-white/20">01</div>
<div class="col-span-6">
<h3 class="text-6xl font-black italic uppercase tracking-tighter text-white">AGNI</h3>
<p class="font-mono text-[10px] text-team-agni tracking-widest mt-1">SECTOR: CORE INFERNO</p>
</div>
<div class="col-span-2 text-right">
<p class="text-3xl font-black italic">4,820</p>
<p class="font-mono text-[9px] text-white/40 uppercase">PTS</p>
</div>
<div class="col-span-3 flex justify-end gap-6 font-mono">
<div class="text-center">
<p class="text-xl font-bold text-white">24</p>
<div class="h-0.5 w-4 bg-yellow-500 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">18</p>
<div class="h-0.5 w-4 bg-gray-400 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">12</p>
<div class="h-0.5 w-4 bg-amber-700 mx-auto mt-1"></div>
</div>
</div>
</div>
<div class="brutalist-row grid grid-cols-12 items-center bg-asphalt border border-white/5 p-6 hover:border-team-astra/40 border-l-team-astra" style="border-left-width: 6px;">
<div class="col-span-1 text-4xl font-black italic text-white/20">02</div>
<div class="col-span-6">
<h3 class="text-6xl font-black italic uppercase tracking-tighter text-white">ASTRA</h3>
<p class="font-mono text-[10px] text-team-astra tracking-widest mt-1">SECTOR: CELESTIAL VELOCITY</p>
</div>
<div class="col-span-2 text-right">
<p class="text-3xl font-black italic">4,150</p>
<p class="font-mono text-[9px] text-white/40 uppercase">PTS</p>
</div>
<div class="col-span-3 flex justify-end gap-6 font-mono">
<div class="text-center">
<p class="text-xl font-bold text-white">19</p>
<div class="h-0.5 w-4 bg-yellow-500 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">22</p>
<div class="h-0.5 w-4 bg-gray-400 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">15</p>
<div class="h-0.5 w-4 bg-amber-700 mx-auto mt-1"></div>
</div>
</div>
</div>
<div class="brutalist-row grid grid-cols-12 items-center bg-asphalt border border-white/5 p-6 hover:border-team-vajra/40 border-l-team-vajra" style="border-left-width: 6px;">
<div class="col-span-1 text-4xl font-black italic text-white/20">03</div>
<div class="col-span-6">
<h3 class="text-6xl font-black italic uppercase tracking-tighter text-white">VAJRA</h3>
<p class="font-mono text-[10px] text-team-vajra tracking-widest mt-1">SECTOR: THUNDERBOLT IMPACT</p>
</div>
<div class="col-span-2 text-right">
<p class="text-3xl font-black italic">3,890</p>
<p class="font-mono text-[9px] text-white/40 uppercase">PTS</p>
</div>
<div class="col-span-3 flex justify-end gap-6 font-mono">
<div class="text-center">
<p class="text-xl font-bold text-white">15</p>
<div class="h-0.5 w-4 bg-yellow-500 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">14</p>
<div class="h-0.5 w-4 bg-gray-400 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">20</p>
<div class="h-0.5 w-4 bg-amber-700 mx-auto mt-1"></div>
</div>
</div>
</div>
<div class="brutalist-row grid grid-cols-12 items-center bg-asphalt border border-white/5 p-6 hover:border-team-rudra/40 border-l-team-rudra" style="border-left-width: 6px;">
<div class="col-span-1 text-4xl font-black italic text-white/20">04</div>
<div class="col-span-6">
<h3 class="text-6xl font-black italic uppercase tracking-tighter text-white">RUDRA</h3>
<p class="font-mono text-[10px] text-team-rudra tracking-widest mt-1">SECTOR: STORM RESILIENCE</p>
</div>
<div class="col-span-2 text-right">
<p class="text-3xl font-black italic">3,420</p>
<p class="font-mono text-[9px] text-white/40 uppercase">PTS</p>
</div>
<div class="col-span-3 flex justify-end gap-6 font-mono">
<div class="text-center">
<p class="text-xl font-bold text-white">12</p>
<div class="h-0.5 w-4 bg-yellow-500 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">16</p>
<div class="h-0.5 w-4 bg-gray-400 mx-auto mt-1"></div>
</div>
<div class="text-center">
<p class="text-xl font-bold text-white">18</p>
<div class="h-0.5 w-4 bg-amber-700 mx-auto mt-1"></div>
</div>
</div>
</div>
</div>
<div class="flex justify-between items-center border-t border-white/5 pt-8">
<div class="flex gap-12">
<div>
<p class="font-mono text-[8px] text-white/40 uppercase tracking-widest mb-1">TOTAL ATHLETES</p>
<p class="text-xl font-black italic">1,402</p>
</div>
<div>
<p class="font-mono text-[8px] text-white/40 uppercase tracking-widest mb-1">EVENTS COMPLETED</p>
<p class="text-xl font-black italic">84/120</p>
</div>
<div>
<p class="font-mono text-[8px] text-white/40 uppercase tracking-widest mb-1">SYNC FREQUENCY</p>
<p class="text-xl font-black italic">0.2s</p>
</div>
</div>
<div class="text-right">
<p class="font-mono text-[8px] text-white/40 uppercase tracking-widest mb-1">LAST CALCULATION</p>
<p class="text-lg font-mono">2025-08-24T14:32:01.004Z</p>
</div>
</div>
</div>
</main>
<footer class="p-10 border-t border-white/5 flex justify-between items-end bg-black/50">
<div class="space-y-4">
<div class="flex gap-4">
<div class="size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-sm">share</span>
</div>
<div class="size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-sm">download</span>
</div>
<div class="size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-sm">print</span>
</div>
</div>
<p class="font-mono text-[8px] text-white/20 uppercase tracking-[0.3em]">© 2025 ATHLOS INTERNATIONAL. DATA INTEGRITY VERIFIED.</p>
</div>
<div class="text-right">
<p class="font-mono text-[9px] text-white/40 uppercase mb-1">Global Competition Pace</p>
<p class="text-2xl font-black italic tracking-tighter">MAXIMUM EFFORT</p>
</div>
</footer>
</div>
</div>

</body></html>