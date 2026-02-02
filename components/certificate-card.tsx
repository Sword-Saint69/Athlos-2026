"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2, ExternalLink } from "lucide-react"
import { CertificateData, CertificateService } from "@/lib/certificateService"

interface CertificateCardProps {
  certificate: CertificateData
  index: number
}

export function CertificateCard({ 
  certificate, 
  index
}: CertificateCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
      // Swipe left - trigger download
      if (certificate.download_storage_url && isClient) {
        window.open(certificate.download_storage_url, '_blank', 'noopener,noreferrer')
      } else if (certificate.certificate_base64 && isClient) {
        // Use the certificate service to download from base64 data
        try {
          CertificateService.downloadCertificate(certificate);
        } catch (error) {
          console.error('Error downloading certificate:', error);
        }
      }
    } else if (isRightSwipe) {
      // Swipe right - could trigger share
      console.log('Share certificate')
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleDownload = async () => {
    if (certificate.download_storage_url && isClient) {
      // Open the Firebase Storage URL directly in a new tab
      window.open(certificate.download_storage_url, '_blank', 'noopener,noreferrer')
    } else if (certificate.certificate_base64 && isClient) {
      // Use the certificate service to download from base64 data
      try {
        await CertificateService.downloadCertificate(certificate);
      } catch (error) {
        console.error('Error downloading certificate:', error);
        // Fallback to opening in new tab if direct download fails
        const blob = await fetch(`data:image/png;base64,${certificate.certificate_base64}`).then(res => res.blob());
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        URL.revokeObjectURL(url);
      }
    }
  }

  // Check if certificate has a stored download URL or base64 data
  const hasStoredCertificate = certificate.download_storage_url || certificate.certificate_base64

  return (
    <Card 
      ref={cardRef}
      className={`
        relative p-6 shadow-xl border-border 
        transition-all duration-200 ease-out
        hover:shadow-2xl hover:scale-[1.02]
        dark:bg-[hsl(var(--certificate-card-bg))]
        dark:border-[hsl(var(--certificate-card-border))]
        dark:hover:bg-[hsl(var(--certificate-card-hover))]
        touch-manipulation
        ${isHovered ? 'ring-2 ring-primary/20' : ''}
        will-change-transform
      `}
      style={{ 
        animation: `slideInUp 0.3s ease-out ${index * 0.05}s both`,
        transformOrigin: 'center bottom'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-display font-bold text-center" style={{ animation: 'fadeIn 0.3s ease-out 0.1s both' }}>
          Certificate #{index + 1}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-base font-slab" style={{ animation: 'fadeIn 0.3s ease-out 0.15s both' }}>
          {certificate.eventName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-base font-slab">
          <div className="transition-all duration-150 ease-out hover:translate-x-1">
            <p className="font-semibold text-muted-foreground">Name:</p>
            <p className="text-foreground font-medium">{certificate.name}</p>
          </div>
          <div className="transition-all duration-150 ease-out hover:translate-x-1">
            <p className="font-semibold text-muted-foreground">Event:</p>
            <p className="text-foreground font-medium">{certificate.eventName}</p>
          </div>
          <div className="transition-all duration-150 ease-out hover:translate-x-1">
            <p className="font-semibold text-muted-foreground">Certificate ID:</p>
            <p className="text-foreground font-mono text-sm">{certificate.certificateId}</p>
          </div>
          <div className="transition-all duration-150 ease-out hover:translate-x-1">
            <p className="font-semibold text-muted-foreground">Department:</p>
            <p className="text-foreground font-medium">{certificate.department || "Not specified"}</p>
          </div>
          {certificate.organizerName && (
            <div className="transition-all duration-150 ease-out hover:translate-x-1">
              <p className="font-semibold text-muted-foreground">Organizer:</p>
              <p className="text-foreground font-medium">{certificate.organizerName}</p>
            </div>
          )}
          {certificate.download_file_size && isClient && (
            <div className="transition-all duration-150 ease-out hover:translate-x-1">
              <p className="font-semibold text-muted-foreground">File Size:</p>
              <p className="text-foreground font-medium">{(certificate.download_file_size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
        
        {/* Certificate status indicator */}
        {hasStoredCertificate && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400" style={{ animation: 'fadeIn 0.3s ease-out 0.2s both' }}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>High-quality certificate available</span>
          </div>
        )}
        
        <div className="flex justify-center pt-4" style={{ animation: 'fadeIn 0.3s ease-out 0.25s both' }}>
          {hasStoredCertificate ? (
            <Button 
              onClick={handleDownload}
              className="w-full gap-2 min-h-[44px] touch-manipulation transition-all duration-150 ease-out hover:scale-105 hover:shadow-lg" 
              size="lg"
            >
              <Download className="h-5 w-5" />
              Download Certificate
            </Button>
          ) : (
            <Button disabled className="w-full gap-2 min-h-[44px] touch-manipulation" size="lg">
              <Download className="h-5 w-5" />
              Download Unavailable
            </Button>
          )}
        </div>
        
        {/* Mobile swipe hint */}
        <div className="hidden md:block text-center text-xs text-muted-foreground mt-2" style={{ animation: 'fadeIn 0.3s ease-out 0.3s both' }}>
          💡 Tip: Swipe left on mobile to download quickly
        </div>
      </CardContent>
    </Card>
  )
}