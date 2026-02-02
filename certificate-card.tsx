"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2, ExternalLink } from "lucide-react"
import { CertificateData } from "@/lib/certificateService"
import { CertificateService } from "@/lib/certificateService"

interface CertificateCardProps {
  certificate: CertificateData
  index: number
  onDownloadStart: () => void
  onDownloadEnd: () => void
  isDownloading: boolean
}

export function CertificateCard({ 
  certificate, 
  index, 
  onDownloadStart, 
  onDownloadEnd, 
  isDownloading 
}: CertificateCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // Swipe left - could trigger download
      handleDownload()
    } else if (isRightSwipe) {
      // Swipe right - could trigger share
      console.log('Share certificate')
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleDownload = async () => {
    onDownloadStart()
    try {
      // Use the new download method that uses stored Firebase Storage URL
      await CertificateService.downloadCertificate(certificate)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      onDownloadEnd()
    }
  }

  // Check if certificate has a stored download URL
  const hasStoredCertificate = certificate.download_storage_url

  return (
    <Card 
      ref={cardRef}
      className={`
        relative p-6 shadow-xl border-border 
        animate-in fade-in slide-in-from-top-4 duration-500
        transition-all duration-300 ease-in-out
        hover:shadow-2xl hover:scale-[1.02]
        dark:bg-[hsl(var(--certificate-card-bg))]
        dark:border-[hsl(var(--certificate-card-border))]
        dark:hover:bg-[hsl(var(--certificate-card-hover))]
        touch-manipulation
        ${isHovered ? 'ring-2 ring-primary/20' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-display font-bold text-center">
          Certificate #{index + 1}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-base font-slab">
          {certificate.eventName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-base font-slab">
          <div>
            <p className="font-semibold text-muted-foreground">Name:</p>
            <p className="text-foreground font-medium">{certificate.name}</p>
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Event:</p>
            <p className="text-foreground font-medium">{certificate.eventName}</p>
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Certificate ID:</p>
            <p className="text-foreground font-mono text-sm">{certificate.certificateId}</p>
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Department:</p>
            <p className="text-foreground font-medium">{certificate.department || "Not specified"}</p>
          </div>
          {certificate.organizerName && (
            <div>
              <p className="font-semibold text-muted-foreground">Organizer:</p>
              <p className="text-foreground font-medium">{certificate.organizerName}</p>
            </div>
          )}
          {certificate.download_file_size && (
            <div>
              <p className="font-semibold text-muted-foreground">File Size:</p>
              <p className="text-foreground font-medium">{(certificate.download_file_size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
        
        {/* Certificate status indicator */}
        {hasStoredCertificate && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>High-quality certificate available</span>
          </div>
        )}
        
        <div className="flex justify-center pt-4">
          {certificate.download_storage_url ? (
            <a
              href={certificate.download_storage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full gap-2 min-h-[44px] touch-manipulation" size="lg">
                <Download className="h-5 w-5" />
                Download Certificate
              </Button>
            </a>
          ) : (
            <Button disabled className="w-full gap-2 min-h-[44px] touch-manipulation" size="lg">
              <Download className="h-5 w-5" />
              Download Unavailable
            </Button>
          )}
        </div>
        
        {/* Mobile swipe hint */}
        <div className="hidden md:block text-center text-xs text-muted-foreground mt-2">
          💡 Tip: Swipe left on mobile to download quickly
        </div>
      </CardContent>
    </Card>
  )
} 