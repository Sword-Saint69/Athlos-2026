"use client" // This component needs to be a Client Component to use useState and onClick handlers

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, Search, Loader2, Download, Archive, Share, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CertificateData } from "@/lib/certificateService"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CertificateCard } from "@/components/certificate-card"
import { generateSearchSuggestions, trackSearch } from "@/lib/searchUtils"
import Link from "next/link"
import { analytics } from "@/lib/analytics"
import { BulkDownloadService } from "@/lib/bulkDownload"

export default function Component() {
  const [email, setEmail] = useState("")
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")

  const [isBulkDownloading, setIsBulkDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSearch = useCallback(async () => {
    if (!email) {
      setError("Please enter your Email.")
      setCertificates([])
      return
    }

    setIsLoading(true)
    setError(null)
    setCertificates([]) // Clear previous data

    try {
      console.log(`Searching for certificates with Email: ${email}`)

      // Call Firebase API
      const response = await fetch(`/api/certificates?universityCode=${encodeURIComponent(email)}`)
      const data = await response.json()

      console.log('API Response:', data)

      if (!response.ok) {
        if (response.status === 404) {
          setError("No certificates found for this Email.")
        } else {
          setError("Failed to fetch certificates. Please try again.")
        }
        return
      }

      setCertificates(data.certificates)

      // Log certificate details for debugging
      console.log(`Found ${data.certificates.length} certificates:`)
      data.certificates.forEach((cert: any, index: number) => {
        console.log(`${index + 1}. ${cert.name} - ${cert.universityCode}`)
        console.log(`   Has download URL: ${!!cert.download_storage_url}`)
        console.log(`   File name: ${cert.download_file_name || 'N/A'}`)
        console.log(`   File size: ${cert.download_file_size || 'N/A'} bytes`)
      })

      // Track search analytics
      analytics.trackSearch(email, data.certificates.length, data.certificates.length > 0)
      trackSearch(email, data.certificates.length)

    } catch (error) {
      console.error('Error fetching certificates:', error)
      setError("Failed to fetch certificates. Please try again.")
      analytics.trackError('Search failed', 'certificate_search')
    } finally {
      setIsLoading(false)
    }
  }, [email])

  // Handle search suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    if (value.length > 0) {
      const suggestions = generateSearchSuggestions(value)
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (certificates.length === 0) return

    setIsBulkDownloading(true)
    try {
      await BulkDownloadService.downloadAllCertificates(
        certificates,
        certificates[0].name
      )

      // Track bulk download analytics
      certificates.forEach((cert: CertificateData) => {
        analytics.trackDownload(cert.certificateId, cert.universityCode, cert.eventName)
      })

    } catch (error) {
      console.error('Bulk download failed:', error)
      setError('Failed to download all certificates. Please try again.')
    } finally {
      setIsBulkDownloading(false)
    }
  }

  // Track page view on mount
  useEffect(() => {
    if (isClient) {
      analytics.trackPageView('certificate_portal')
    }
  }, [isClient])

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const time = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(time);
    };

    updateTime(); // Set initial time
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);



  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-white font-display">
      {/* Track lines background */}
      <div className="fixed inset-0 track-lines opacity-40 pointer-events-none"></div>

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
        <header className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 px-4 sm:px-10 py-4 bg-background-dark/80 backdrop-blur-none gap-4 sm:gap-0">
          <div className="flex items-center gap-4">

            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter">Athlos 2026</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center flex-1 sm:flex-none sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
            <nav className="hidden sm:flex items-center gap-6 lg:gap-10">
              <a className="text-xs sm:text-sm font-mono uppercase tracking-widest hover:text-primary transition-colors" href="/registration">Registration</a>
              <Link className="text-xs sm:text-sm font-mono uppercase tracking-widest hover:text-primary transition-colors" href="/scorecard">RESULTS</Link>
              <Link className="text-xs sm:text-sm font-mono uppercase tracking-widest hover:text-primary transition-colors" href="/winners">WINNER</Link>
              <a className="text-xs sm:text-sm font-mono uppercase tracking-widest hover:text-primary transition-colors" href="/developers">Dev</a>
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

        <main className="flex-1 flex flex-col justify-center items-center px-4 relative">
          <div className="w-full max-w-[1200px] space-y-12">
            <div className="text-center">
              <p className="font-mono text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/40 mb-2">Athletic Certificate Portal</p>
              <h1 className="text-[40px] sm:text-[60px] lg:text-[120px] leading-[1.1] sm:leading-[0.9] font-black uppercase tracking-tighter italic">
                ATHLOS <span className="text-primary">2026</span>
              </h1>
            </div>

            <div className="max-w-3xl mx-auto w-full px-2">
              <div className="relative">
                <div className="bg-asphalt border border-white/10 p-2 flex items-center flex-col sm:flex-row gap-2 sm:gap-0">
                  <div className="px-4 sm:px-6 py-2 text-white/30">
                    <Search className="h-6 w-6" />
                  </div>
                  <Input
                    type="text"
                    placeholder="SEARCH ATHLETE OR CERTIFICATE ID"
                    className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-xs sm:text-sm placeholder:text-white/20 uppercase tracking-widest py-2 sm:py-4"
                    value={email}
                    onChange={handleInputChange}
                    aria-label="Search" />
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-primary text-white font-black uppercase tracking-widest px-4 sm:px-10 py-2 sm:py-4 ml-0 sm:ml-2 mt-2 sm:mt-0 hover:bg-red-700 transition-all w-full sm:w-auto"
                    aria-label="Execute search"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'EXECUTE'}
                  </Button>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center px-1 gap-2 sm:gap-0">
                  <p className="font-mono text-[7px] sm:text-[9px] text-white/40 uppercase tracking-widest text-center sm:text-left">LANE 04 / CENTRAL ACCESS POINT</p>
                  <p className="font-mono text-[7px] sm:text-[9px] text-white/40 uppercase tracking-widest text-center sm:text-right">SYSTEM STATUS: NOMINAL</p>
                </div>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && isClient && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail('TEST001')
                    handleSearch()
                  }}
                  className="text-xs border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  Test Search (Development)
                </Button>
              </div>
            )}

            {error && (
              <div className="text-center w-full max-w-md mx-auto mt-8 space-y-4">
                <p className="text-red-400 animate-shake font-mono text-sm uppercase tracking-widest">{error}</p>
                <div className="flex flex-col items-center space-y-3">
                  <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Missing Certificates?</p>
                  <a
                    href="https://wa.me/919074409995?text=Hello! I cannot find my certificate in the DEXTRA portal. My Email is: [Please enter your Email here]"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-mono text-xs uppercase tracking-widest transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    Contact Support
                  </a>
                </div>
              </div>
            )}

            {certificates.length > 0 && (
              <div className="w-full max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-xl sm:text-3xl font-display font-black uppercase tracking-tighter mb-2">
                    Certificates Found <span className="text-primary">({certificates.length})</span>
                  </h2>
                  <p className="font-mono text-xs sm:text-sm text-white/60 uppercase tracking-widest">
                    {certificates[0].name} - {certificates[0].universityCode}
                  </p>

                  {/* Certificate status summary */}
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs font-mono uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400">
                        {certificates.filter(cert => cert.download_storage_url).length} High-quality
                      </span>
                    </div>
                    {certificates.filter(cert => !cert.download_storage_url).length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-yellow-400">
                          {certificates.filter(cert => !cert.download_storage_url).length} On-demand
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bulk download button */}
                {certificates.length > 1 && (
                  <div className="mt-6">
                    <Button
                      onClick={handleBulkDownload}
                      disabled={isBulkDownloading}
                      className="gap-2 bg-primary hover:bg-red-700 text-white font-black uppercase tracking-widest px-6 py-3 transition-all hover:scale-105"
                    >
                      {isBulkDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                      {isBulkDownloading ? 'Creating Archive...' : `Download All (${certificates.length})`}
                    </Button>
                  </div>
                )}

                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                  {certificates.map((certificate, index) => (
                    <CertificateCard
                      key={certificate.id}
                      certificate={certificate}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="p-4 sm:p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center sm:items-end bg-background-dark/80 backdrop-blur-none gap-4 sm:gap-0">
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start gap-4">
              <div className="size-6 sm:size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Share className="h-3 sm:h-4 w-3 sm:w-4" />
              </div>
              <div className="size-6 sm:size-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <Info className="h-3 sm:h-4 w-3 sm:w-4" />
              </div>
            </div>
            <p className="font-mono text-[6px] sm:text-[8px] text-white/20 uppercase tracking-[0.15em] sm:tracking-[0.3em]">© 2026 ATHLOS . ALL RIGHTS RESERVED.</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono text-[7px] sm:text-[9px] text-white/40 uppercase mb-1">Current Time (GMT +5:30)</p>
            <p className="text-lg sm:text-2xl font-black italic tracking-tighter">{currentTime}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}