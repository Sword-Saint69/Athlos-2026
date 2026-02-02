"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Database, FileText } from "lucide-react"

export default function DebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [allCertificates, setAllCertificates] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Test Firebase connection and get all certificates
  const testFirebaseConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/debug/certificates')
      const data = await response.json()
      
      if (response.ok) {
        setAllCertificates(data.certificates || [])
        console.log('All certificates in database:', data.certificates)
      } else {
        setError(data.error || 'Failed to fetch certificates')
      }
    } catch (error) {
      console.error('Error testing Firebase connection:', error)
      setError('Failed to connect to Firebase')
    } finally {
      setIsLoading(false)
    }
  }

  // Search for specific certificates
  const searchCertificates = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/certificates?universityCode=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data.certificates || [])
        console.log('Search results:', data.certificates)
      } else {
        setError(data.error || 'No certificates found')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching certificates:', error)
      setError('Failed to search certificates')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Firebase Database Debug</h1>
        <p className="text-muted-foreground">Debug and troubleshoot certificate search functionality</p>
      </div>

      {/* Test Firebase Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Firebase Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testFirebaseConnection}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Database className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Testing Connection...' : 'Test Firebase Connection'}
          </Button>
          
          {allCertificates.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">All Certificates in Database ({allCertificates.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allCertificates.map((cert, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <div><strong>ID:</strong> {cert.id}</div>
                    <div><strong>Search ID:</strong> {cert.search_id || 'N/A'}</div>
                    <div><strong>Event:</strong> {cert.event_name || 'N/A'}</div>
                    <div><strong>Organizer:</strong> {cert.organizer_name || 'N/A'}</div>
                    <div><strong>Has Download URL:</strong> {cert.download_storage_url ? 'Yes' : 'No'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter university code (e.g., PRP24CS068)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCertificates()}
            />
            <Button 
              onClick={searchCertificates}
              disabled={isLoading || !searchTerm.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Search Results ({searchResults.length})</h3>
              <div className="space-y-2">
                {searchResults.map((cert, index) => (
                  <div key={index} className="p-3 bg-green-50 dark:bg-green-950 rounded border">
                    <div><strong>ID:</strong> {cert.id}</div>
                    <div><strong>Search ID:</strong> {cert.search_id || 'N/A'}</div>
                    <div><strong>Event:</strong> {cert.event_name || 'N/A'}</div>
                    <div><strong>Organizer:</strong> {cert.organizer_name || 'N/A'}</div>
                    <div><strong>Download URL:</strong> {cert.download_storage_url ? 'Available' : 'Not available'}</div>
                    <div><strong>File Name:</strong> {cert.download_file_name || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>1. Check Database:</strong> Use "Test Firebase Connection" to see all certificates</div>
          <div><strong>2. Verify Search ID:</strong> Make sure the university code matches the search_id field</div>
          <div><strong>3. Check Firebase Config:</strong> Ensure Firebase is properly configured</div>
          <div><strong>4. Common Issues:</strong></div>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>University code doesn't exist in database</li>
            <li>search_id field is empty or different</li>
            <li>Firebase connection issues</li>
            <li>Case sensitivity in search terms</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 