"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Database, CheckCircle } from "lucide-react"

export default function TestDataPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [universityCode, setUniversityCode] = useState("TEST001")
  const [eventName, setEventName] = useState("DEXTRA 2025")
  const [organizerName, setOrganizerName] = useState("College of Engineering Punnapra")

  const addTestCertificate = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const testData = {
        search_id: universityCode,
        event_name: eventName,
        organizer_name: organizerName,
        certificate_id: "athlos_2025",
        department: "Computer Science",
        year: "2025",
        // Add some sample download data
        download_storage_url: "https://firebasestorage.googleapis.com/v0/b/athlos-25.appspot.com/o/certificates%2FTEST001%2Ftest_certificate.png?alt=media&token=sample",
        download_file_name: `certificate_${universityCode}.png`,
        download_file_size: 245760,
        download_file_format: "PNG",
        download_generated_at: new Date().toISOString(),
        download_count: 0,
        certificate_metadata: {
          event_name: eventName,
          organizer_name: organizerName,
          search_id: universityCode,
          template_id: "athlos_2025",
          generated_timestamp: Date.now(),
          bulk_upload: false
        }
      }
      
      const response = await fetch('/api/test-data/certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ Test certificate added successfully! ID: ${data.id}`)
        console.log('Test certificate added:', data)
      } else {
        setMessage(`❌ Failed to add test certificate: ${data.error}`)
      }
    } catch (error) {
      console.error('Error adding test certificate:', error)
      setMessage('❌ Failed to add test certificate')
    } finally {
      setIsLoading(false)
    }
  }

  const addMultipleTestCertificates = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const testCertificates = [
        {
          search_id: "PRP24CS068",
          event_name: "DEXTRA 2025 - Music Concert",
          organizer_name: "College of Engineering Punnapra",
          certificate_id: "athlos_football_2025",
          department: "Computer Science",
          year: "2025"
        },
        {
          search_id: "PRP24CS068",
          event_name: "DEXTRA 2025 - Dance Performance",
          organizer_name: "College of Engineering Punnapra",
          certificate_id: "athlos_cricket_2025",
          department: "Computer Science",
          year: "2025"
        },
        {
          search_id: "PRP24CS069",
          event_name: "DEXTRA 2025 - Art Exhibition",
          organizer_name: "College of Engineering Punnapra",
          certificate_id: "athlos_tennis_2025",
          department: "Mechanical Engineering",
          year: "2025"
        }
      ]
      
      const response = await fetch('/api/test-data/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificates: testCertificates })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ Added ${data.count} test certificates successfully!`)
        console.log('Test certificates added:', data)
      } else {
        setMessage(`❌ Failed to add test certificates: ${data.error}`)
      }
    } catch (error) {
      console.error('Error adding test certificates:', error)
      setMessage('❌ Failed to add test certificates')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Add Test Data</h1>
        <p className="text-muted-foreground">Add sample certificates to test the search functionality</p>
      </div>

      {/* Single Test Certificate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Single Test Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">University Code</label>
              <Input
                value={universityCode}
                onChange={(e) => setUniversityCode(e.target.value)}
                placeholder="e.g., TEST001"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Event Name</label>
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., DEXTRA 2025"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Organizer</label>
              <Input
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g., College of Engineering"
              />
            </div>
          </div>
          
          <Button 
            onClick={addTestCertificate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Adding Certificate...' : 'Add Test Certificate'}
          </Button>
        </CardContent>
      </Card>

      {/* Multiple Test Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add Multiple Test Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will add 3 test certificates with different university codes and events for testing the search functionality.
          </p>
          
          <Button 
            onClick={addMultipleTestCertificates}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Database className="h-5 w-5 mr-2" />
            )}
            {isLoading ? 'Adding Certificates...' : 'Add Multiple Test Certificates'}
          </Button>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message && (
        <Card className={message.includes('✅') ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'}>
          <CardContent className="pt-6">
            <div className={`flex items-center gap-2 ${message.includes('✅') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message.includes('✅') ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Database className="h-5 w-5" />
              )}
              <span>{message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>1. Add Test Data:</strong> Use the buttons above to add sample certificates</div>
          <div><strong>2. Test Search:</strong> Go to the main page and search for:</div>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code>TEST001</code> - Single certificate</li>
            <li><code>PRP24CS068</code> - Multiple certificates (Football & Cricket)</li>
            <li><code>PRP24CS069</code> - Single certificate (Table Tennis)</li>
          </ul>
          <div><strong>3. Debug:</strong> Visit <code>/debug</code> to see all certificates in the database</div>
        </CardContent>
      </Card>
    </div>
  )
} 