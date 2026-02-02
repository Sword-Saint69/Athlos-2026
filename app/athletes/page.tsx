"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  Play,
  CheckCircle,
  Clock,
  User
} from "lucide-react";
import { collection, getDocs, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Athlete {
  id: string;
  fullName: string;
  universityCode: string;
  event: string;
  phoneNumber: string;
  email: string;
  sex: string;
  status: 'upcoming' | 'active' | 'completed';
  createdAt?: Date;
}

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [events, setEvents] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [filterUniversity, setFilterUniversity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updatingAthlete, setUpdatingAthlete] = useState<string | null>(null);

  // Fetch athletes from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch events first for mapping
        const eventsQ = query(collection(db, "events"));
        const eventsSnapshot = await getDocs(eventsQ);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setEvents(eventsData);

        const q = query(collection(db, "athletes"));
        const querySnapshot = await getDocs(q);

        const athletesData: Athlete[] = [];
        querySnapshot.forEach((doc) => {
          athletesData.push({
            id: doc.id,
            ...doc.data()
          } as Athlete);
        });

        setAthletes(athletesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data: ", err);
        setError("Failed to load athletes data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique events and universities for filters
  const uniqueEvents = Array.from(new Set(athletes.map(a => a.event).filter(Boolean)));
  const uniqueUniversities = Array.from(new Set(athletes.map(a => a.universityCode).filter(Boolean)));
  const statusOptions = ['upcoming', 'active', 'completed'];

  // Update athlete status
  const updateAthleteStatus = async (athleteId: string, newStatus: 'upcoming' | 'active' | 'completed') => {
    try {
      setUpdatingAthlete(athleteId);
      const athleteRef = doc(db, "athletes", athleteId);
      await updateDoc(athleteRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setAthletes(prevAthletes =>
        prevAthletes.map(athlete =>
          athlete.id === athleteId
            ? { ...athlete, status: newStatus, updatedAt: new Date() }
            : athlete
        )
      );
    } catch (error) {
      console.error("Error updating athlete status:", error);
      alert("Failed to update athlete status. Please try again.");
    } finally {
      setUpdatingAthlete(null);
    }
  };

  // Get next status in cycle
  const getNextStatus = (currentStatus: string): 'upcoming' | 'active' | 'completed' => {
    const statusCycle: ('upcoming' | 'active' | 'completed')[] = ['upcoming', 'active', 'completed'];
    const currentIndex = statusCycle.indexOf(currentStatus as any);
    return statusCycle[(currentIndex + 1) % statusCycle.length];
  };

  // Get status display info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'upcoming':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/30',
          label: 'UPCOMING'
        };
      case 'active':
        return {
          icon: Play,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-400/30',
          label: 'ACTIVE'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-purple-400',
          bg: 'bg-purple-500/20',
          border: 'border-purple-400/30',
          label: 'COMPLETED'
        };
      default:
        return {
          icon: User,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
          label: 'UNKNOWN'
        };
    }
  };

  // Filter athletes based on search and filters
  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch =
      (athlete.fullName && athlete.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      athlete.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (athlete.event && athlete.event.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (athlete.universityCode && athlete.universityCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEvent = filterEvent === "all" || athlete.event === filterEvent;
    const matchesUniversity = filterUniversity === "all" || athlete.universityCode === filterUniversity;
    const matchesStatus = filterStatus === "all" || athlete.status === filterStatus;

    return matchesSearch && matchesEvent && matchesUniversity && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Full Name', 'University Code', 'Event', 'Status', 'Phone', 'Email', 'Sex'],
      ...filteredAthletes.map(athlete => [
        athlete.id,
        athlete.fullName || '',
        athlete.universityCode || '',
        athlete.event || '',
        athlete.status || '',
        athlete.phoneNumber || '',
        athlete.email || '',
        athlete.sex || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `athletes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark text-white font-display overflow-hidden">
      {/* Track lines background */}
      <div className="fixed inset-0 track-lines opacity-40 pointer-events-none"></div>

      {/* Lane number background */}
      <div className="absolute right-0 bottom-0 lane-bg-number opacity-5">08</div>

      <div className="flex h-full relative z-10">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 border-r border-white/10 bg-black/80 backdrop-blur-md flex flex-col items-center lg:items-start py-8">
          <div className="px-6 mb-12">
            <div className="w-12 h-12 bg-primary flex items-center justify-center font-black text-2xl">A</div>
            <p className="hidden lg:block mt-4 font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">Athlos / Athletes</p>
          </div>

          <nav className="w-full space-y-2">
            <Link
              href="/"
              className="flex items-center gap-4 px-6 py-4 text-white/40 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Dashboard</span>
            </Link>
            <button className="flex items-center gap-4 px-6 py-4 w-full text-left bg-primary text-white transition-all">
              <Users className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Athletes</span>
            </button>
            <Link href="/registration" className="flex items-center gap-4 px-6 py-4 text-white/40 hover:bg-white/5 hover:text-white transition-all">
              <Plus className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Register</span>
            </Link>
          </nav>

          <div className="mt-auto px-6 w-full">
            <div className="hidden lg:block p-4 border border-white/5 bg-charcoal/50">
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-[10px] uppercase text-white/60">Server Optimal</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="p-8 pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-primary mb-2">Athlete Management / Alpha-01</p>
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none italic">
                ATHLETE <span className="text-primary">DATABASE</span>
              </h1>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="px-8 py-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-charcoal p-6 border-l-4 border-white flex flex-col justify-between h-28 relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 relative z-10">Total Athletes</p>
              <p className="text-3xl font-black italic relative z-10">{loading ? '...' : athletes.length}</p>
              <Users className="absolute -right-2 -bottom-2 text-6xl opacity-5" />
            </div>
            <div className="bg-blue-900/30 p-6 border-l-4 border-blue-400 flex flex-col justify-between h-28 relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-blue-400/80 relative z-10">Upcoming</p>
              <p className="text-3xl font-black italic relative z-10">{loading ? '...' : athletes.filter(a => a.status === 'upcoming').length}</p>
              <Clock className="absolute -right-2 -bottom-2 text-6xl opacity-20" />
            </div>
            <div className="bg-green-900/30 p-6 border-l-4 border-green-400 flex flex-col justify-between h-28 relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-green-400/80 relative z-10">Active</p>
              <p className="text-3xl font-black italic relative z-10">{loading ? '...' : athletes.filter(a => a.status === 'active').length}</p>
              <Play className="absolute -right-2 -bottom-2 text-6xl opacity-20" />
            </div>
            <div className="bg-purple-900/30 p-6 border-l-4 border-purple-400 flex flex-col justify-between h-28 relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-purple-400/80 relative z-10">Completed</p>
              <p className="text-3xl font-black italic relative z-10">{loading ? '...' : athletes.filter(a => a.status === 'completed').length}</p>
              <CheckCircle className="absolute -right-2 -bottom-2 text-6xl opacity-20" />
            </div>
            <div className="bg-charcoal p-6 border-l-4 border-red-500 flex flex-col justify-between h-28 relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 relative z-10">Filtered Results</p>
              <p className="text-3xl font-black italic relative z-10">{filteredAthletes.length}</p>
              <Filter className="absolute -right-2 -bottom-2 text-6xl opacity-5" />
            </div>
          </section>

          {/* Controls */}
          <section className="px-8 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 border-t-0 border-x-0 font-mono text-[10px] tracking-widest uppercase focus:ring-0 focus:border-primary pl-10 placeholder:text-white/20 py-2"
                  placeholder="SEARCH ATHLETES..."
                />
              </div>

              {/* Event Filter */}
              <div className="relative">
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="bg-transparent border-b border-white/20 font-mono text-[10px] tracking-widest uppercase focus:ring-0 focus:border-primary px-4 py-2 appearance-none pr-8"
                >
                  <option value="all">ALL EVENTS</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name.toUpperCase()}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* University Filter */}
              <div className="relative">
                <select
                  value={filterUniversity}
                  onChange={(e) => setFilterUniversity(e.target.value)}
                  className="bg-transparent border-b border-white/20 font-mono text-[10px] tracking-widest uppercase focus:ring-0 focus:border-primary px-4 py-2 appearance-none pr-8"
                >
                  <option value="all">ALL UNIVERSITIES</option>
                  {uniqueUniversities.map(university => (
                    <option key={university} value={university}>{university}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent border-b border-white/20 font-mono text-[10px] tracking-widest uppercase focus:ring-0 focus:border-primary px-4 py-2 appearance-none pr-8"
                >
                  <option value="all">ALL STATUSES</option>
                  <option value="upcoming">UPCOMING</option>
                  <option value="active">ACTIVE</option>
                  <option value="completed">COMPLETED</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-mono text-xs uppercase hover:bg-red-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </section>

          {/* Athlete Table */}
          <section className="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto border border-white/10 bg-black/40 backdrop-blur-sm">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="font-mono text-white/60 mt-4">Loading athletes data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="font-mono text-red-400 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-primary text-white font-mono text-xs uppercase hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : filteredAthletes.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="font-mono text-white/60">No athletes found matching your criteria</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-charcoal z-20">
                    <tr>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">ID</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Athlete Name</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Event</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">University</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Status</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Contact</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAthletes.map((athlete) => {
                      const statusInfo = getStatusInfo(athlete.status);
                      const StatusIcon = statusInfo.icon;
                      const nextStatus = getNextStatus(athlete.status);
                      const nextStatusInfo = getStatusInfo(nextStatus);
                      const NextStatusIcon = nextStatusInfo.icon;

                      return (
                        <tr key={athlete.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4 font-mono text-xs text-primary">{athlete.id.substring(0, 8)}</td>
                          <td className="p-4 font-bold uppercase tracking-tight">{athlete.fullName || 'N/A'}</td>
                          <td className="p-4 font-mono text-xs text-white/60">
                            {events.find(e => e.id === athlete.event)?.name || athlete.event || 'Not assigned'}
                          </td>
                          <td className="p-4 font-mono text-xs text-white/60">{athlete.universityCode || 'N/A'}</td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase ${statusInfo.bg} ${statusInfo.border} border`}>
                              <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                              <span className={statusInfo.color}>{statusInfo.label}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-white/60">{athlete.email || athlete.phoneNumber || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {/* Status Change Button */}
                              <button
                                onClick={() => updateAthleteStatus(athlete.id, nextStatus)}
                                disabled={updatingAthlete === athlete.id}
                                className={`text-[10px] font-mono uppercase px-2 py-1 flex items-center gap-1 transition-all ${updatingAthlete === athlete.id
                                    ? 'bg-gray-500/20 text-gray-400 border border-gray-400/30 cursor-not-allowed'
                                    : `${nextStatusInfo.bg} ${nextStatusInfo.border} border text-white hover:brightness-125`
                                  }`}
                              >
                                {updatingAthlete === athlete.id ? (
                                  <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <NextStatusIcon className={`h-3 w-3 ${nextStatusInfo.color}`} />
                                )}
                                {updatingAthlete === athlete.id ? 'UPDATING...' : `TO ${nextStatusInfo.label}`}
                              </button>

                              {/* View/Edit Buttons */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[10px] font-mono uppercase text-primary border border-primary/20 px-2 py-1 flex items-center gap-1 hover:bg-primary/10 transition-colors">
                                  <Eye className="h-3 w-3" /> View
                                </button>
                                <button className="text-[10px] font-mono uppercase text-white/40 hover:text-white flex items-center gap-1 px-2 py-1 transition-colors">
                                  <Edit className="h-3 w-3" /> Edit
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 left-20 lg:left-64 bg-black border-t border-white/10 px-8 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary"></div>
            <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Athlete Database v1.0</p>
          </div>
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.3em] hidden sm:block">Athletic Administration Terminal</p>
        </div>
        <div className="flex gap-4">
          <span className="font-mono text-[9px] text-white/40 uppercase">Records: {filteredAthletes.length}</span>
          <span className="font-mono text-[9px] text-blue-400/60 uppercase">Upcoming: {athletes.filter(a => a.status === 'upcoming').length}</span>
          <span className="font-mono text-[9px] text-green-400/60 uppercase">Active: {athletes.filter(a => a.status === 'active').length}</span>
          <span className="font-mono text-[9px] text-purple-400/60 uppercase">Completed: {athletes.filter(a => a.status === 'completed').length}</span>
        </div>
      </footer>
    </div>
  );
}