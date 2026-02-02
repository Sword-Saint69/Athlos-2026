interface AnalyticsEvent {
  event: string
  data: Record<string, any>
  timestamp: string
}

class Analytics {
  private events: AnalyticsEvent[] = []
  
  // Track certificate download
  trackDownload(certificateId: string, universityCode: string, eventName: string) {
    const event: AnalyticsEvent = {
      event: 'certificate_download',
      data: {
        certificateId,
        universityCode,
        eventName,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    this.events.push(event)
    this.sendToAnalytics(event)
    
    console.log(`📊 Download tracked: ${certificateId} for ${universityCode}`)
  }
  
  // Track search analytics
  trackSearch(searchTerm: string, resultsCount: number, hasResults: boolean) {
    const event: AnalyticsEvent = {
      event: 'certificate_search',
      data: {
        searchTerm,
        resultsCount,
        hasResults,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    this.events.push(event)
    this.sendToAnalytics(event)
    
    console.log(`🔍 Search tracked: "${searchTerm}" returned ${resultsCount} results`)
  }
  
  // Track page views
  trackPageView(page: string) {
    const event: AnalyticsEvent = {
      event: 'page_view',
      data: {
        page,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    this.events.push(event)
    this.sendToAnalytics(event)
    
    console.log(`📄 Page view tracked: ${page}`)
  }
  
  // Track error events
  trackError(error: string, context: string) {
    const event: AnalyticsEvent = {
      event: 'error',
      data: {
        error,
        context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    this.events.push(event)
    this.sendToAnalytics(event)
    
    console.log(`❌ Error tracked: ${error} in ${context}`)
  }
  
  // Get analytics summary
  getAnalyticsSummary() {
    const downloads = this.events.filter(e => e.event === 'certificate_download').length
    const searches = this.events.filter(e => e.event === 'certificate_search').length
    const errors = this.events.filter(e => e.event === 'error').length
    
    return {
      totalDownloads: downloads,
      totalSearches: searches,
      totalErrors: errors,
      totalEvents: this.events.length
    }
  }
  
  // Send to analytics service (in real app, this would go to your analytics provider)
  private sendToAnalytics(event: AnalyticsEvent) {
    // In production, you'd send this to Google Analytics, Mixpanel, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event)
    }
    
    // Store in localStorage for demo purposes
    const analytics = JSON.parse(localStorage.getItem('athlos_analytics') || '[]')
    analytics.push(event)
    localStorage.setItem('athlos_analytics', JSON.stringify(analytics))
  }
  
  // Export analytics data
  exportAnalytics() {
    return {
      events: this.events,
      summary: this.getAnalyticsSummary()
    }
  }
}

export const analytics = new Analytics() 