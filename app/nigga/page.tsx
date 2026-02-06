"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Settings,
  Search,
  Eye,
  Edit,
  Calendar,
  Plus,
  X,
  Trash2,
  Trophy,
  Play,
  CheckCircle,
  Clock,
  ShieldCheck,
  Medal
} from "lucide-react";
import { collection, getDocs, query, addDoc, deleteDoc, doc, updateDoc, where, orderBy, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { CertificateService, CertificateData } from "@/lib/certificateService";

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

interface Winner {
  name: string;
  group: string;
  position: number;
  universityCode?: string;
}

interface Event {
  id: string;
  name: string;
  category: string;
  eventId: string;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  winners?: Winner[];
}

interface TeamStandings {
  id: string;
  name: string;
  sector: string;
  points: number;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

export default function AdminPanel() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<TeamStandings[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'standings' | 'winners' | 'certificates'>('dashboard');
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState<boolean>(false);
  const [certificatesError, setCertificatesError] = useState<string | null>(null);
  const [showCertificateForm, setShowCertificateForm] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);
  const [updatingTeam, setUpdatingTeam] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    name: '',
    category: '',
    eventId: '',
    maxParticipants: 100
  });

  // Winner management state
  const [selectedEventForWinners, setSelectedEventForWinners] = useState<Event | null>(null);
  const [winnerForm, setWinnerForm] = useState({
    name: '',
    group: 'AGNI',
    position: 1,
    universityCode: ''
  });

  const [athleteSearchTerm, setAthleteSearchTerm] = useState("");
  const [showAthleteSuggestions, setShowAthleteSuggestions] = useState(false);

  // Certificate form state
  const [certificateForm, setCertificateForm] = useState({
    "Full Name": '',
    "Certificate ID": '',
    "University Code": '',
    "Event": '',
    "Category": 'Participant',
    "Date": '',
    "Email": '',
    "Phone Number": '',
    "Sex": '',
    "SEARCH ID 1": '',
    "SEARCH ID 2": '',
    "certificate_base64": ''
  });

  const [isAddingCertificate, setIsAddingCertificate] = useState(false);

  // Reset form when closing
  useEffect(() => {
    if (!showEventForm) {
      setEventForm({
        name: '',
        category: '',
        eventId: '',
        maxParticipants: 100
      });
      setEditingEvent(null);
    }
  }, [showEventForm]);

  // Fetch athletes from Firebase
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Also fetch events to map IDs to names
        const eventsQ = query(collection(db, "events"));
        const eventsSnapshot = await getDocs(eventsQ);
        const eventsData: Event[] = [];
        eventsSnapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() } as Event);
        });
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
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      const q = query(collection(db, "events"));
      const querySnapshot = await getDocs(q);

      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({
          id: doc.id,
          ...doc.data()
        } as Event);
      });

      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events: ", err);
      setEventsError("Failed to load events data");
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch teams from Firebase
  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);
      setTeamsError(null);
      const q = query(collection(db, "teams"), orderBy("points", "desc"));
      const querySnapshot = await getDocs(q);

      const teamsData: TeamStandings[] = [];
      querySnapshot.forEach((doc) => {
        teamsData.push({
          id: doc.id,
          ...doc.data()
        } as TeamStandings);
      });

      setTeams(teamsData);
    } catch (err) {
      console.error("Error fetching teams: ", err);
      setTeamsError("Failed to load standings data");
    } finally {
      setTeamsLoading(false);
    }
  };
  // Initialize Teams (AGNI, VAJRA, RUDRA, ASTRA)
  const initializeTeams = async () => {
    if (!confirm('This will create/reset AGNI, VAJRA, RUDRA, and ASTRA teams to 0 points. Continue?')) {
      return;
    }

    try {
      setTeamsLoading(true);
      const teamNames = ['AGNI', 'VAJRA', 'RUDRA', 'ASTRA'];

      for (const name of teamNames) {
        // Check if team already exists
        const q = query(collection(db, "teams"), where("name", "==", name));
        const querySnapshot = await getDocs(q);

        const initialStats = {
          name,
          sector: 'Core',
          points: 0,
          medals: {
            gold: 0,
            silver: 0,
            bronze: 0
          },
          updatedAt: new Date()
        };

        if (querySnapshot.empty) {
          await addDoc(collection(db, "teams"), initialStats);
        } else {
          const teamId = querySnapshot.docs[0].id;
          await updateDoc(doc(db, "teams", teamId), initialStats);
        }
      }

      await fetchTeams();
      alert("Teams initialized successfully!");
    } catch (error) {
      console.error("Error initializing teams:", error);
      alert("Failed to initialize teams.");
    } finally {
      setTeamsLoading(false);
    }
  };

  // Fetch certificates from Firebase
  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      setCertificatesError(null);
      const data = await CertificateService.getAllCertificates();
      setCertificates(data);
    } catch (err) {
      console.error("Error fetching certificates: ", err);
      setCertificatesError("Failed to load certificates");
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Handle certificate form submit
  const handleCertificateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingCertificate(true);
      await CertificateService.addCertificate(certificateForm);
      toast.success("Certificate added successfully!");
      setShowCertificateForm(false);
      setCertificateForm({
        "Full Name": '',
        "Certificate ID": '',
        "University Code": '',
        "Event": '',
        "Category": 'Participant',
        "Date": '',
        "Email": '',
        "Phone Number": '',
        "Sex": '',
        "SEARCH ID 1": '',
        "SEARCH ID 2": '',
        "certificate_base64": ''
      });
      fetchCertificates();
    } catch (error: any) {
      console.error("Error adding certificate:", error);
      toast.error(error.message || "Failed to add certificate");
    } finally {
      setIsAddingCertificate(false);
    }
  };

  // Handle certificate delete
  const handleDeleteCertificate = async (certificate: CertificateData) => {
    if (!confirm(`Are you sure you want to delete the certificate for ${certificate.name}?`)) {
      return;
    }

    try {
      await CertificateService.deleteCertificate(certificate.id, !!certificate.isFromDb1);
      toast.success("Certificate deleted successfully");
      fetchCertificates();
    } catch (error: any) {
      console.error("Error deleting certificate:", error);
      toast.error(error.message || "Failed to delete certificate");
    }
  };

  // Handle tab specific fetching
  useEffect(() => {
    if (activeTab === 'events' || activeTab === 'winners') {
      fetchEvents();
    } else if (activeTab === 'standings') {
      fetchTeams();
    } else if (activeTab === 'certificates') {
      fetchCertificates();
    }
  }, [activeTab]);

  // Update event status
  const updateEventStatus = async (eventId: string, newStatus: 'upcoming' | 'active' | 'completed') => {
    try {
      setUpdatingEvent(eventId);
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId
            ? { ...event, status: newStatus, updatedAt: new Date() }
            : event
        )
      );

      alert(`Event status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating event status:", error);
      alert("Failed to update event status. Please try again.");
    } finally {
      setUpdatingEvent(null);
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
          icon: Clock,
          color: 'text-gray-400',
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
          label: 'UNKNOWN'
        };
    }
  };

  const updateTeamStats = async (teamId: string, updates: Partial<TeamStandings>) => {
    try {
      setUpdatingTeam(teamId);
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, updates);

      // Update local state
      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === teamId ? { ...team, ...updates } : team
        )
      );

      // Also update the points order if points were changed
      if (updates.points !== undefined) {
        setTeams(prevTeams => [...prevTeams].sort((a, b) => b.points - a.points));
      }

      alert("Standings updated successfully!");
    } catch (error) {
      console.error("Error updating team stats:", error);
      alert("Failed to update standings. Please try again.");
    } finally {
      setUpdatingTeam(null);
    }
  };

  const handleMedalChange = (teamId: string, type: 'gold' | 'silver' | 'bronze', value: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const newMedals = { ...team.medals, [type]: value };
    setTeams(teams.map(t =>
      t.id === teamId ? { ...t, medals: newMedals } : t
    ));
  };

  const handlePointsChange = (teamId: string, value: number) => {
    setTeams(teams.map(t =>
      t.id === teamId ? { ...t, points: value } : t
    ));
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        // Update existing event
        const eventRef = doc(db, "events", editingEvent.id);
        await updateDoc(eventRef, {
          name: eventForm.name,
          category: eventForm.category,
          eventId: eventForm.eventId,
          maxParticipants: eventForm.maxParticipants
        });

        // Update local state
        setEvents(events.map(event =>
          event.id === editingEvent.id
            ? { ...event, ...eventForm }
            : event
        ));

        alert("Event updated successfully!");
      } else {
        // Add new event
        const newEvent = {
          ...eventForm,
          status: 'upcoming' as const,
          createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, "events"), newEvent);

        // Update local state
        const savedEvent: Event = {
          id: docRef.id,
          ...newEvent
        } as Event;

        setEvents([...events, savedEvent]);
        alert("Event created successfully!");
      }

      setShowEventForm(false);
    } catch (error) {
      console.error("Error saving event: ", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        setEvents(events.filter(event => event.id !== eventId));
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event: ", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const handleDeleteAthlete = async (athlete: Athlete) => {
    if (!confirm(`Are you sure you want to delete athlete ${athlete.fullName}? This will also delete all associated certificates.`)) {
      return;
    }

    try {
      // 1. Delete associated certificates first
      const count = await CertificateService.deleteCertificatesByAthlete({
        universityCode: athlete.universityCode,
        email: athlete.email,
        phone: athlete.phoneNumber
      });

      // 2. Delete athlete record
      await deleteDoc(doc(db, "athletes", athlete.id));

      // 3. Update local state
      setAthletes(athletes.filter(a => a.id !== athlete.id));

      toast.success(`Athlete and ${count} certificates deleted successfully`);
    } catch (error: any) {
      console.error("Error deleting athlete:", error);
      toast.error(error.message || "Failed to delete athlete");
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      category: event.category,
      eventId: event.eventId,
      maxParticipants: event.maxParticipants
    });
    setShowEventForm(true);
  };

  // Winners Management Handlers
  const handleWinnerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForWinners) return;

    try {
      const eventRef = doc(db, "events", selectedEventForWinners.id);
      const newWinner: Winner = {
        name: winnerForm.name,
        group: winnerForm.group,
        position: winnerForm.position,
        universityCode: winnerForm.universityCode
      };

      await updateDoc(eventRef, {
        winners: arrayUnion(newWinner)
      });

      // Update local state
      const updatedEvent = {
        ...selectedEventForWinners,
        winners: [...(selectedEventForWinners.winners || []), newWinner]
      };

      setEvents(events.map(e => e.id === selectedEventForWinners.id ? updatedEvent : e));
      setSelectedEventForWinners(updatedEvent);

      // Reset form (keep position increment logic optional, resetting to default 1 for now)
      setWinnerForm({
        name: '',
        group: 'AGNI',
        position: Math.min(winnerForm.position + 1, 3), // Auto increment position up to 3
        universityCode: ''
      });
      setAthleteSearchTerm('');
      setShowAthleteSuggestions(false);

      alert("Winner added successfully!");
    } catch (error) {
      console.error("Error adding winner:", error);
      alert("Failed to add winner.");
    }
  };

  const handleDeleteWinner = async (winnerToDelete: Winner) => {
    if (!selectedEventForWinners || !confirm('Remove this winner?')) return;

    try {
      const eventRef = doc(db, "events", selectedEventForWinners.id);
      await updateDoc(eventRef, {
        winners: arrayRemove(winnerToDelete)
      });

      // Update local state
      const updatedEvent = {
        ...selectedEventForWinners,
        winners: selectedEventForWinners.winners?.filter(w =>
          w.name !== winnerToDelete.name || w.position !== winnerToDelete.position
        )
      };

      setEvents(events.map(e => e.id === selectedEventForWinners.id ? updatedEvent : e));
      setSelectedEventForWinners(updatedEvent);
    } catch (error) {
      console.error("Error removing winner:", error);
      alert("Failed to remove winner.");
    }
  };


  const filteredAthletes = athletes.filter(athlete =>
    (athlete.universityCode && athlete.universityCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/athletes/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Athletes uploaded successfully!");
        // Refresh athletes list if on dashboard or athletes tab
        if (activeTab === 'dashboard') {
          // You might need a more comprehensive refresh here
          window.location.reload();
        }
      } else {
        toast.error(result.error || "Failed to upload athletes");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background-dark text-white font-display overflow-hidden">
      {/* Track lines background */}
      <div className="fixed inset-0 track-lines opacity-40 pointer-events-none"></div>

      {/* Lane number background */}
      <div className="absolute right-0 bottom-0 lane-bg-number opacity-5">08</div>

      <div className="flex h-full relative z-10 w-full">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 border-r border-white/10 bg-black/80 backdrop-blur-md flex flex-col items-center lg:items-start py-8 shrink-0 h-screen sticky top-0">
          <div className="px-6 mb-12">
            <div className="w-12 h-12 bg-primary flex items-center justify-center font-black text-2xl">A</div>
            <p className="hidden lg:block mt-4 font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">Athlos / Admin</p>
          </div>

          <nav className="w-full space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-4 px-6 py-4 w-full text-left ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'} transition-all`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-4 px-6 py-4 w-full text-left ${activeTab === 'events' ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'} transition-all`}
            >
              <Calendar className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Events</span>
            </button>
            <button
              onClick={() => setActiveTab('winners')}
              className={`flex items-center gap-4 px-6 py-4 w-full text-left ${activeTab === 'winners' ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'} transition-all`}
            >
              <Medal className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Winners</span>
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-4 px-6 py-4 w-full text-left ${activeTab === 'standings' ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'} transition-all`}
            >
              <Trophy className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Standings</span>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center gap-4 px-6 py-4 w-full text-left ${activeTab === 'certificates' ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'} transition-all`}
            >
              <FileText className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Certificates</span>
            </button>
            <Link href="/athletes" className="flex items-center gap-4 px-6 py-4 text-white/40 hover:bg-white/5 hover:text-white transition-all">
              <Users className="h-5 w-5" />
              <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">Athletes</span>
            </Link>
            <div className="px-6 py-4 w-full">
              <label className={`flex items-center gap-4 cursor-pointer text-white/40 hover:text-white transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="h-5 w-5" />
                <span className="hidden lg:block font-mono text-xs uppercase tracking-widest">
                  {uploading ? 'Uploading...' : 'Upload Excel'}
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleExcelUpload}
                  disabled={uploading}
                />
              </label>
            </div>
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
        <main className="flex-1 flex flex-col overflow-hidden h-screen overflow-y-auto">
          <header className="p-8 pb-4 shrink-0">
            <div>
              <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-primary mb-2">System Override / Alpha-01</p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none italic">
                {activeTab === 'dashboard' ? 'CONTROL' : activeTab === 'events' ? 'EVENT' : activeTab === 'winners' ? 'WINNER' : 'STANDINGS'} <span className="text-primary">{activeTab === 'dashboard' ? 'CENTER' : activeTab === 'winners' ? 'PODIUM' : 'MANAGEMENT'}</span>
              </h1>
            </div>
          </header>

          {activeTab === 'events' ? (
            // Events View
            <section className="flex-1 px-8 pb-32 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-xl uppercase tracking-widest text-white/80">Event Management</h2>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-mono text-xs uppercase hover:bg-red-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add New Event
                </button>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
                {eventsLoading ? (
                  <div className="col-span-full flex items-center justify-center h-64">
                    <p className="font-mono text-white/60">Loading events...</p>
                  </div>
                ) : eventsError ? (
                  <div className="col-span-full flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="font-mono text-red-400 mb-4">{eventsError}</p>
                      <button
                        onClick={fetchEvents}
                        className="px-4 py-2 bg-primary text-white font-mono text-xs uppercase hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : events.length === 0 ? (
                  <div className="col-span-full flex items-center justify-center h-64">
                    <p className="font-mono text-white/60">No events found</p>
                  </div>
                ) : (
                  events.map((event) => {
                    const statusInfo = getStatusInfo(event.status);
                    const StatusIcon = statusInfo.icon;
                    const nextStatus = getNextStatus(event.status);
                    const nextStatusInfo = getStatusInfo(nextStatus);
                    const NextStatusIcon = nextStatusInfo.icon;

                    return (
                      <div key={event.id} className="bg-charcoal border border-white/10 p-6 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg uppercase tracking-tight">{event.name}</h3>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase ${statusInfo.bg} ${statusInfo.border} border`}>
                            <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                            <span className={statusInfo.color}>{statusInfo.label}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-white/70 mb-4">
                          <p><span className="text-white/50">Category:</span> {event.category}</p>
                          <p><span className="text-white/50">Event ID:</span> {event.eventId}</p>
                          <p><span className="text-white/50">Capacity:</span> {event.maxParticipants} participants</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Status Change Button */}
                          <button
                            onClick={() => updateEventStatus(event.id, nextStatus)}
                            disabled={updatingEvent === event.id}
                            className={`text-[10px] font-mono uppercase px-2 py-1 flex items-center gap-1 transition-all ${updatingEvent === event.id
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-400/30 cursor-not-allowed'
                              : `${nextStatusInfo.bg} ${nextStatusInfo.border} border text-white hover:brightness-125`
                              }`}
                          >
                            {updatingEvent === event.id ? (
                              <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <NextStatusIcon className={`h-3 w-3 ${nextStatusInfo.color}`} />
                            )}
                            {updatingEvent === event.id ? 'UPDATING...' : `TO ${nextStatusInfo.label}`}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-[10px] font-mono uppercase text-primary border border-primary/20 px-2 py-1 hover:bg-primary/10 transition-colors flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-[10px] font-mono uppercase text-red-400 border border-red-400/20 px-2 py-1 hover:bg-red-400/10 hover:border-red-400 transition-colors ml-auto flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ) : activeTab === 'winners' ? (
            // Winners View
            <section className="flex-1 px-8 pb-32 overflow-hidden flex flex-row gap-8">
              {/* Event List (Completed Only) */}
              <div className="w-1/3 flex flex-col border-r border-white/10 pr-6">
                <h2 className="font-mono text-xl uppercase tracking-widest text-white/80 mb-6">Completed Events</h2>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {events.filter(e => e.status === 'completed').length === 0 ? (
                    <p className="text-white/40 font-mono text-xs">No completed events yet.</p>
                  ) : (
                    events.filter(e => e.status === 'completed').map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEventForWinners(event)}
                        className={`w-full text-left p-4 border border-white/5 transition-colors ${selectedEventForWinners?.id === event.id ? 'bg-primary border-primary text-white' : 'hover:bg-white/5 text-white/70'}`}
                      >
                        <h3 className="font-bold uppercase text-sm mb-1">{event.name}</h3>
                        <div className="flex justify-between items-center text-xs font-mono opacity-60">
                          <span>{event.category}</span>
                          <span>{event.winners ? event.winners.length : 0} Winners</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Winners Editor */}
              <div className="flex-1 flex flex-col">
                {selectedEventForWinners ? (
                  <>
                    <div className="mb-6 pb-6 border-b border-white/10">
                      <h2 className="font-black italic uppercase text-3xl mb-2">{selectedEventForWinners.name} <span className="text-primary">PODIUM</span></h2>
                      <p className="font-mono text-xs text-white/40 uppercase tracking-widest">Manage official results for this event</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto">
                      {/* Winner Form */}
                      <div>
                        <h3 className="font-mono text-sm uppercase tracking-widest text-primary mb-4 border-b border-primary/20 pb-2">Add New Winner</h3>
                        <form onSubmit={handleWinnerFormSubmit} className="space-y-4 bg-charcoal p-6 border border-white/10">
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Position</label>
                            <div className="flex gap-4">
                              {[1, 2, 3].map(pos => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => setWinnerForm({ ...winnerForm, position: pos })}
                                  className={`flex-1 py-3 font-bold border ${winnerForm.position === pos
                                    ? (pos === 1 ? 'bg-yellow-500 text-black border-yellow-500' : pos === 2 ? 'bg-gray-400 text-black border-gray-400' : 'bg-amber-700 text-white border-amber-700')
                                    : 'border-white/20 text-white/40 hover:text-white'
                                    } transition-colors`}
                                >
                                  {pos === 1 ? 'GOLD' : pos === 2 ? 'SILVER' : 'BRONZE'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Winner Name</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={winnerForm.name}
                                onChange={e => {
                                  const val = e.target.value;
                                  setWinnerForm({ ...winnerForm, name: val });
                                  setAthleteSearchTerm(val);
                                  setShowAthleteSuggestions(val.length > 0);
                                }}
                                onFocus={() => setShowAthleteSuggestions(winnerForm.name.length > 0)}
                                required
                                className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0"
                                placeholder="Search or enter student name"
                              />

                              {showAthleteSuggestions && (
                                <div className="absolute z-50 w-full mt-1 bg-charcoal border border-white/20 shadow-2xl max-h-60 overflow-y-auto">
                                  {athletes
                                    .filter(a =>
                                      a.fullName.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
                                      a.universityCode.toLowerCase().includes(athleteSearchTerm.toLowerCase())
                                    )
                                    .slice(0, 10)
                                    .map(athlete => (
                                      <button
                                        key={athlete.id}
                                        type="button"
                                        onClick={() => {
                                          setWinnerForm({
                                            ...winnerForm,
                                            name: athlete.fullName,
                                            universityCode: athlete.universityCode
                                          });
                                          setShowAthleteSuggestions(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-primary transition-colors border-b border-white/5 last:border-0"
                                      >
                                        <p className="font-bold uppercase text-sm">{athlete.fullName}</p>
                                        <p className="text-[10px] font-mono opacity-50">{athlete.universityCode}</p>
                                      </button>
                                    ))}
                                  {athletes.filter(a =>
                                    a.fullName.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
                                    a.universityCode.toLowerCase().includes(athleteSearchTerm.toLowerCase())
                                  ).length === 0 && (
                                      <div className="px-4 py-3 text-white/30 text-xs font-mono uppercase">
                                        No matching athletes found
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                            {/* Backdrop to close suggestions */}
                            {showAthleteSuggestions && (
                              <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setShowAthleteSuggestions(false)}
                              ></div>
                            )}
                          </div>

                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Group</label>
                            <select
                              value={winnerForm.group}
                              onChange={e => setWinnerForm({ ...winnerForm, group: e.target.value })}
                              className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0"
                            >
                              <option value="AGNI">AGNI</option>
                              <option value="ASTRA">ASTRA</option>
                              <option value="VAJRA">VAJRA</option>
                              <option value="RUDRA">RUDRA</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">University Code (Optional)</label>
                            <input
                              type="text"
                              value={winnerForm.universityCode}
                              onChange={e => setWinnerForm({ ...winnerForm, universityCode: e.target.value })}
                              className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0 uppercase"
                              placeholder="UNI-202X-XXX"
                            />
                          </div>

                          <button type="submit" className="w-full bg-primary py-4 font-black uppercase text-sm tracking-widest hover:bg-red-700 transition-colors">
                            Add to Podium
                          </button>
                        </form>
                      </div>

                      {/* Current Winners List */}
                      <div>
                        <h3 className="font-mono text-sm uppercase tracking-widest text-white/60 mb-4 border-b border-white/10 pb-2">Current Winners</h3>
                        {(!selectedEventForWinners.winners || selectedEventForWinners.winners.length === 0) ? (
                          <div className="text-center py-10 border border-dashed border-white/10 text-white/30">
                            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="font-mono text-xs">No winners declared yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedEventForWinners.winners.sort((a, b) => a.position - b.position).map((winner, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-4 bg-charcoal border border-white/5 group">
                                <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm ${winner.position === 1 ? 'bg-yellow-500 text-black' : winner.position === 2 ? 'bg-gray-400 text-black' : 'bg-amber-700 text-white'}`}>
                                  {winner.position}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold uppercase">{winner.name}</p>
                                  <div className="flex gap-2 text-[10px] font-mono opacity-60 uppercase">
                                    <span className={
                                      winner.group === 'AGNI' ? 'text-red-400' :
                                        winner.group === 'ASTRA' ? 'text-blue-400' :
                                          winner.group === 'VAJRA' ? 'text-yellow-400' : 'text-orange-400'
                                    }>{winner.group}</span>
                                    {winner.universityCode && <span>| {winner.universityCode}</span>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteWinner(winner)}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all p-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/20 flex-col gap-4">
                    <Trophy className="h-16 w-16 opacity-20" />
                    <p className="font-mono uppercase tracking-widest">Select a completed event to manage winners</p>
                  </div>
                )}
              </div>
            </section>
          ) : activeTab === 'standings' ? (
            // Standings View
            <section className="flex-1 px-8 pb-32 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-mono text-xl uppercase tracking-widest text-white/80">Team Standings Management</h2>
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">Updates reflect on the live scorecard instantly</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={initializeTeams}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white font-mono text-xs uppercase hover:bg-yellow-700 transition-colors"
                  >
                    <Activity className="h-4 w-4" />
                    Initialize Teams
                  </button>
                  <button
                    onClick={fetchTeams}
                    className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:border-primary transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-white/10 bg-black/40 backdrop-blur-sm pb-10">
                {teamsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="font-mono text-white/60">Loading standings...</p>
                  </div>
                ) : teamsError ? (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div>
                      <p className="font-mono text-red-400 mb-4">{teamsError}</p>
                      <button onClick={fetchTeams} className="px-4 py-2 bg-primary text-white font-mono text-xs uppercase">Retry</button>
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-charcoal z-20">
                      <tr>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">Team Identity</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 w-32">Points</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 w-24 text-center">Gold</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 w-24 text-center">Silver</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 w-24 text-center">Bronze</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <h3 className="font-black italic text-2xl uppercase tracking-tighter">{team.name}</h3>
                            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">SECTOR: {team.sector.toUpperCase()}</p>
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={team.points}
                              onChange={(e) => handlePointsChange(team.id, parseInt(e.target.value) || 0)}
                              className="bg-black/50 border border-white/10 font-bold text-xl px-2 py-1 focus:border-primary focus:ring-0 w-full"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={team.medals.gold}
                              onChange={(e) => handleMedalChange(team.id, 'gold', parseInt(e.target.value) || 0)}
                              className="bg-black/50 border border-yellow-500/30 text-yellow-500 font-bold text-xl px-2 py-1 focus:border-yellow-500 focus:ring-0 w-full text-center"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={team.medals.silver}
                              onChange={(e) => handleMedalChange(team.id, 'silver', parseInt(e.target.value) || 0)}
                              className="bg-black/50 border border-gray-400/30 text-gray-400 font-bold text-xl px-2 py-1 focus:border-gray-400 focus:ring-0 w-full text-center"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={team.medals.bronze}
                              onChange={(e) => handleMedalChange(team.id, 'bronze', parseInt(e.target.value) || 0)}
                              className="bg-black/50 border border-amber-700/30 text-amber-700 font-bold text-xl px-2 py-1 focus:border-amber-700 focus:ring-0 w-full text-center"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => updateTeamStats(team.id, { points: team.points, medals: team.medals })}
                              disabled={updatingTeam === team.id}
                              className="bg-primary text-white font-mono text-[10px] uppercase font-black px-6 py-2 hover:bg-red-700 transition-all flex items-center justify-center gap-2 mb-0 ml-auto"
                            >
                              {updatingTeam === team.id ? (
                                <>
                                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  PROCESSING
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3 w-3" />
                                  AUTHORIZE UPDATE
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          ) : activeTab === 'certificates' ? (
            // Certificates View
            <section className="flex-1 px-8 pb-32 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6 text-white">
                <div>
                  <h2 className="font-mono text-xl uppercase tracking-widest text-white/80">Certificate Management</h2>
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">Manage manual certificate entries and legacy data</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCertificateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-mono text-xs uppercase hover:bg-red-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Certificate
                  </button>
                  <button
                    onClick={fetchCertificates}
                    className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:border-primary transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-white/10 bg-black/40 backdrop-blur-sm pb-10">
                {certificatesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="font-mono text-white/60">Loading certificates...</p>
                  </div>
                ) : certificatesError ? (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div>
                      <p className="font-mono text-red-400 mb-4">{certificatesError}</p>
                      <button onClick={fetchCertificates} className="px-4 py-2 bg-primary text-white font-mono text-xs uppercase">Retry</button>
                    </div>
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-white/20">
                    <FileText className="h-16 w-16 mb-4 opacity-10" />
                    <p className="font-mono uppercase tracking-widest">No certificates found</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-white">
                    <thead className="sticky top-0 bg-charcoal z-20">
                      <tr>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">Full Name</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">Event / Category</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">Search Identifiers</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10">Database</th>
                        <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-white/10 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <p className="font-bold uppercase">{cert.name}</p>
                            <p className="text-[10px] font-mono text-white/40">{cert.id}</p>
                          </td>
                          <td className="p-4">
                            <p className="uppercase text-sm">{cert.eventName}</p>
                            <p className="text-[10px] font-mono text-primary uppercase">{cert.Category || cert.category || 'Participant'}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {cert.universityCode && <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono">{cert.universityCode}</span>}
                              {cert.email && <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono">{cert.email}</span>}
                              {cert.phone && <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono">{cert.phone}</span>}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 text-[8px] font-mono rounded ${cert.isFromDb1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                              {cert.isFromDb1 ? 'DB 1' : 'DB 2'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDeleteCertificate(cert)}
                                className="p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Add Certificate Modal */}
              {showCertificateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm shadow-2xl overflow-y-auto">
                  <div className="bg-charcoal border border-white/10 w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto pb-20">
                    <button
                      onClick={() => setShowCertificateForm(false)}
                      className="absolute top-6 right-6 text-white/40 hover:text-white"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    <h2 className="font-mono text-2xl uppercase tracking-[0.2em] mb-8 text-white">Manual Certificate Entry</h2>

                    <form onSubmit={handleCertificateFormSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Full Name</label>
                          <input
                            type="text"
                            required
                            value={certificateForm["Full Name"]}
                            onChange={e => setCertificateForm({ ...certificateForm, "Full Name": e.target.value })}
                            className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0 uppercase placeholder:text-white/10"
                            placeholder="e.g. MEGHA BIJU"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Event Name</label>
                          <input
                            type="text"
                            required
                            value={certificateForm.Event}
                            onChange={e => setCertificateForm({ ...certificateForm, Event: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0 uppercase"
                            placeholder="e.g. SHOTPUT"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">University Code (Search ID 1)</label>
                          <input
                            type="text"
                            required
                            value={certificateForm["University Code"]}
                            onChange={e => setCertificateForm({ ...certificateForm, "University Code": e.target.value, "SEARCH ID 1": e.target.value })}
                            className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0 uppercase"
                            placeholder="e.g. PRP25EC014"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Phone Number (Search ID 2)</label>
                          <input
                            type="text"
                            value={certificateForm["Phone Number"]}
                            onChange={e => setCertificateForm({ ...certificateForm, "Phone Number": e.target.value, "SEARCH ID 2": e.target.value })}
                            className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0 placeholder:text-white/10"
                            placeholder="e.g. 9074829374"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Category</label>
                          <select
                            value={certificateForm.Category}
                            onChange={e => setCertificateForm({ ...certificateForm, Category: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0"
                          >
                            <option value="Participant">Participant</option>
                            <option value="Winner">Winner</option>
                            <option value="Runner Up">Runner Up</option>
                            <option value="Organizer">Organizer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Date</label>
                          <input
                            type="text"
                            value={certificateForm.Date}
                            onChange={e => setCertificateForm({ ...certificateForm, Date: e.target.value })}
                            className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-sm focus:border-primary focus:ring-0"
                            placeholder="e.g. 2026-02-07"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Certificate Base64 (Source)</label>
                        <textarea
                          value={certificateForm.certificate_base64}
                          onChange={e => setCertificateForm({ ...certificateForm, certificate_base64: e.target.value })}
                          className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white font-mono text-[10px] focus:border-primary focus:ring-0 h-32"
                          placeholder="Paste base64 data here..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingCertificate}
                        className="w-full bg-primary py-4 font-black uppercase text-sm tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isAddingCertificate ? 'PROCESSING...' : 'INITIALIZE CERTIFICATE DATA'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </section>
          ) : (
            // Dashboard View
            <>
              {/* Stats Cards */}
              <section className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-1">
                <div className="bg-charcoal p-6 border-l-4 border-white flex flex-col justify-between h-32 relative overflow-hidden">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 relative z-10">Registered Athletes</p>
                  <p className="text-4xl sm:text-5xl font-black italic relative z-10">{loading ? '...' : athletes.length}</p>
                  <Users className="absolute -right-4 -bottom-4 text-7xl sm:text-9xl opacity-5" />
                </div>
                <div className="bg-primary p-6 border-l-4 border-white flex flex-col justify-between h-32 relative overflow-hidden">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/90 relative z-10">Certificates Generated</p>
                  <p className="text-4xl sm:text-5xl font-black italic relative z-10">{loading ? '...' : athletes.filter(a => a.event).length}</p>
                  <FileText className="absolute -right-4 -bottom-4 text-7xl sm:text-9xl opacity-20" />
                </div>
                <div className="bg-charcoal p-6 border-l-4 border-primary flex flex-col justify-between h-32 relative overflow-hidden">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 relative z-10">Active Events</p>
                  <div className="flex items-baseline gap-3 relative z-10">
                    <p className="text-4xl sm:text-5xl font-black italic">{events.filter(e => e.status === 'active').length}</p>
                    <span className="font-mono text-xs text-primary animate-pulse">● ACTIVE</span>
                  </div>
                  <Activity className="absolute -right-4 -bottom-4 text-7xl sm:text-9xl opacity-5" />
                </div>
              </section>

              {/* Athlete Table */}
              <section className="flex-1 px-8 pb-32 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-4">
                    <button className="px-4 py-1 bg-white text-black font-mono text-[10px] uppercase font-bold hover:bg-primary hover:text-white transition-colors">
                      Export CSV
                    </button>
                    <button className="px-4 py-1 border border-white/20 text-white font-mono text-[10px] uppercase hover:border-primary transition-colors">
                      Refresh Data
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-b border-white/20 border-t-0 border-x-0 font-mono text-[10px] tracking-widest uppercase focus:ring-0 focus:border-primary w-48 sm:w-64 pl-10 placeholder:text-white/20"
                      placeholder="SEARCH ATHLETES..."
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto border border-white/10 bg-black/40 backdrop-blur-sm pb-10">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="font-mono text-white/60">Loading athletes data...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="font-mono text-red-400">{error}</p>
                    </div>
                  ) : filteredAthletes.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="font-mono text-white/60">No athletes found</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-charcoal z-20">
                        <tr>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">ID</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Athlete Name</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Event</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">University</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30">Contact</th>
                          <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 border-b border-primary/30 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredAthletes.map((athlete) => (
                          <tr key={athlete.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-4 font-mono text-xs text-primary">{athlete.id.substring(0, 8)}</td>
                            <td className="p-4 font-bold uppercase tracking-tight">{athlete.fullName || 'N/A'}</td>
                            <td className="p-4 font-mono text-xs text-white/60">
                              {events.find(e => e.id === athlete.event)?.name || athlete.event || 'Not assigned'}
                            </td>
                            <td className="p-4 font-mono text-xs text-white/60">{athlete.universityCode || 'N/A'}</td>
                            <td className="p-4 font-mono text-xs text-white/60">{athlete.email || athlete.phoneNumber || 'N/A'}</td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[10px] font-mono uppercase text-primary border border-primary/20 px-2 py-1 flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> View
                                </button>
                                <button
                                  onClick={() => handleDeleteAthlete(athlete)}
                                  className="text-[10px] font-mono uppercase text-red-500 hover:text-red-400 flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}
        </main>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-charcoal border border-white/20 w-full max-w-2xl rounded-none">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-mono text-lg uppercase tracking-widest">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEventFormSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Event Name *</label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/30 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/50"
                      placeholder="Enter event name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Category *</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/30 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Track">Track</option>
                      <option value="Field">Field</option>
                      <option value="Jumping">Jumping</option>
                      <option value="Throwing">Throwing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Event ID *</label>
                    <input
                      type="text"
                      value={eventForm.eventId}
                      onChange={(e) => setEventForm({ ...eventForm, eventId: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/30 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/50"
                      placeholder="Enter event ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Max Participants</label>
                    <input
                      type="number"
                      value={eventForm.maxParticipants}
                      onChange={(e) => setEventForm({ ...eventForm, maxParticipants: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#1a1a1a] border border-white/30 text-white font-mono text-sm px-4 py-3 focus:border-primary focus:ring-0 transition-colors placeholder:text-white/50"
                      min="1"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-6 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:border-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white font-mono text-xs uppercase hover:bg-red-700 transition-colors"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 left-20 lg:left-64 bg-black border-t border-white/10 px-8 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary"></div>
            <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Core Engine v2.0.25</p>
          </div>
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.3em] hidden sm:block">Athletic Administration Terminal / Secure Node</p>
        </div>
        <div className="flex gap-4">
          <span className="font-mono text-[9px] text-white/40 uppercase">Memory: 42%</span>
          <span className="font-mono text-[9px] text-white/40 uppercase">Latency: 12ms</span>
        </div>
      </footer>
    </div>
  );
}