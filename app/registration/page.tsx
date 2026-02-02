"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Zap, Loader2, Trophy } from "lucide-react";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Event {
  id: string;
  name: string;
  category: string;
  eventId: string;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    universityCode: "",
    phoneNumber: "",
    email: "",
    event: "",
    sex: "",
    group: ""
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch events from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        setEventsError(null);

        // Fetch only upcoming and active events for registration
        const q = query(
          collection(db, "events"),
          where("status", "in", ["upcoming", "active"])
        );

        const querySnapshot = await getDocs(q);
        const eventsData: Event[] = [];

        querySnapshot.forEach((doc) => {
          eventsData.push({
            id: doc.id,
            ...doc.data()
          } as Event);
        });

        // Sort events by name
        eventsData.sort((a, b) => a.name.localeCompare(b.name));
        setEvents(eventsData);

      } catch (err) {
        console.error("Error fetching events: ", err);
        setEventsError("Failed to load events. Please try again.");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find the selected event details
    const selectedEvent = events.find(event => event.id === formData.event);

    try {
      // Add registration data to Firebase
      const registrationData = {
        ...formData,
        eventName: selectedEvent?.name || '',
        eventCategory: selectedEvent?.category || '',
        eventId: selectedEvent?.eventId || '',
        registeredAt: new Date(),
        status: 'pending' as const
      };

      // Add to athletes collection in Firestore
      await addDoc(collection(db, "athletes"), registrationData);

      // Show success message
      alert(`Registration submitted successfully for ${formData.fullName}!`);

      // Reset form
      setFormData({
        fullName: "",
        universityCode: "",
        phoneNumber: "",
        email: "",
        event: "",
        sex: "",
        group: ""
      });

    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Failed to submit registration. Please try again.");
    }
  };

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
      {/* Navigation */}
      <div className="fixed top-10 right-10 z-50 flex gap-8">
        <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/">Home</Link>
        <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/registration">Registration</Link>
        <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/scorecard">Result</Link>
        <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/winners">Winner</Link>
        <Link className="text-xs font-mono uppercase tracking-[0.4em] hover:text-primary transition-colors" href="/developers">Dev</Link>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center grow py-20 px-4">
        <div className="w-full max-w-4xl mb-12 text-center">
          <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-white/40 mb-4">Portal Access / 2025 Edition</p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter italic leading-none">
            ATHLOS<br /> <span className="text-primary">REGISTRATION</span>
          </h1>
        </div>

        <div className="w-full max-w-2xl bg-charcoal/40 border-x border-white/5 backdrop-blur-sm p-6 sm:p-8 md:p-12 relative">
          <div className="absolute -left-[1px] top-0 h-20 w-[2px] bg-primary"></div>
          <div className="absolute -right-[1px] bottom-0 h-20 w-[2px] bg-primary"></div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Full Name *</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/10"
                  placeholder="SURNAME, GIVEN NAME"
                  type="text"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">University Code *</label>
                <input
                  name="universityCode"
                  value={formData.universityCode}
                  onChange={handleChange}
                  className="w-full bg-transparent border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/10"
                  placeholder="UNI-2025-XXX"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Phone Number *</label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-transparent border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/10"
                  placeholder="+91 XXXXXXXXXX"
                  type="tel"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Email *</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/10"
                  placeholder="athlete@example.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Event *</label>
                <Select
                  value={formData.event}
                  onValueChange={(value) => setFormData({ ...formData, event: value })}
                  disabled={loadingEvents || eventsError !== null}
                >
                  <SelectTrigger className="w-full bg-charcoal border-white/20 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors">
                    <SelectValue placeholder={loadingEvents ? "LOADING EVENTS..." : eventsError ? "ERROR LOADING" : "SELECT EVENT"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-2 border-white/30 text-white font-mono rounded-none min-w-[200px] shadow-lg max-h-60 overflow-y-auto">
                    {loadingEvents ? (
                      <div className="py-3 px-4 flex items-center gap-2 text-white/60">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading events...
                      </div>
                    ) : eventsError ? (
                      <div className="py-3 px-4 text-red-400">
                        {eventsError}
                      </div>
                    ) : events.length === 0 ? (
                      <div className="py-3 px-4 text-white/60">
                        No events available
                      </div>
                    ) : (
                      events.map((event) => (
                        <SelectItem
                          key={event.id}
                          value={event.id}
                          className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10"
                        >
                          {event.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {eventsError && (
                  <p className="text-red-400 text-xs font-mono mt-1">Please refresh the page to try again</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Group *</label>
                <Select value={formData.group} onValueChange={(value) => setFormData({ ...formData, group: value })}>
                  <SelectTrigger className="w-full bg-charcoal border-white/20 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors">
                    <SelectValue placeholder="SELECT GROUP" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-2 border-white/30 text-white font-mono rounded-none min-w-[150px] shadow-lg">
                    <SelectItem value="AGNI" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">AGNI</SelectItem>
                    <SelectItem value="ASTRA" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">ASTRA</SelectItem>
                    <SelectItem value="RUDRA" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">RUDRA</SelectItem>
                    <SelectItem value="VAJRA" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">VAJRA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50">Sex *</label>
                <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                  <SelectTrigger className="w-full bg-charcoal border-white/20 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors">
                    <SelectValue placeholder="SELECT SEX" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-2 border-white/30 text-white font-mono rounded-none min-w-[150px] shadow-lg">
                    <SelectItem value="male" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">MALE</SelectItem>
                    <SelectItem value="female" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">FEMALE</SelectItem>
                    <SelectItem value="other" className="focus:bg-primary focus:text-white py-3 px-4 cursor-pointer hover:bg-white/10">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-red-700 text-white font-black text-lg sm:text-xl uppercase tracking-[0.2em] py-6 transition-all flex items-center justify-center gap-4 group"
              >
                START YOUR RACE
                <Zap className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <div className="w-2 h-2 bg-primary"></div>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">System Ready / Lane 01 Assigned</p>
            </div>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Entry Ver. 1.1</p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-10 left-10 right-10 z-50 flex justify-between items-end pointer-events-none">
        <div className="space-y-1">
          <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.5em]">Athlos 2026 College Of Engineering And Management Punnapra</p>
          <div className="flex gap-1">
            <div className="w-8 h-1 bg-white/10"></div>
            <div className="w-2 h-1 bg-primary"></div>
            <div className="w-20 h-1 bg-white/10"></div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.5em]">Athlos CEMP. © 2026</p>
        </div>
      </footer>
    </div>
  );
}