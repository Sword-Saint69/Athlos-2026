// Fuzzy search implementation
export function fuzzySearch(searchTerm: string, target: string): boolean {
  const search = searchTerm.toLowerCase()
  const text = target.toLowerCase()
  
  let searchIndex = 0
  for (let i = 0; i < text.length && searchIndex < search.length; i++) {
    if (search[searchIndex] === text[i]) {
      searchIndex++
    }
  }
  
  return searchIndex === search.length
}

// Search suggestions based on common patterns
export function generateSearchSuggestions(input: string): string[] {
  const suggestions: string[] = []
  
  // Common university code patterns
  if (input.length < 3) {
    suggestions.push('PRP24CS068')
    suggestions.push('PRP24CS069')
    suggestions.push('PRP24CS070')
  } else if (input.startsWith('PRP')) {
    suggestions.push('PRP24CS068')
    suggestions.push('PRP24CS069')
    suggestions.push('PRP24CS070')
  }
  
  return suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(input.toLowerCase())
  )
}

// Search analytics tracking
export function trackSearch(searchTerm: string, resultsCount: number) {
  // In a real app, you'd send this to your analytics service
  console.log(`Search: "${searchTerm}" returned ${resultsCount} results`)
  
  // Store in localStorage for search history
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]')
  const newSearch = {
    term: searchTerm,
    results: resultsCount,
    timestamp: new Date().toISOString()
  }
  
  // Add to history and keep only last 10 searches
  searchHistory.unshift(newSearch)
  searchHistory.splice(10)
  
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
}

// Get search history
export function getSearchHistory(): Array<{term: string, results: number, timestamp: string}> {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]')
} 