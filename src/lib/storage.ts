import { storage } from 'wxt/storage'

// Define types for our storage
export interface ApiKeys {
  [provider: string]: string
}

// Storage key for API keys - using 'local:' prefix for local storage
const API_KEYS_KEY = 'local:api_keys'

// Save API key for a provider
export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  try {
    // Get existing API keys
    const existingKeys = await getApiKeys()
    
    // Update with new key
    const updatedKeys = {
      ...existingKeys,
      [provider]: apiKey,
    }
    
    // Save to storage
    await storage.setItem(API_KEYS_KEY, updatedKeys)
  } catch (error) {
    console.error('Error saving API key:', error)
  }
}

// Get all API keys
export async function getApiKeys(): Promise<ApiKeys> {
  try {
    const keys = await storage.getItem<ApiKeys>(API_KEYS_KEY)
    return keys || {}
  } catch (error) {
    console.error('Error getting API keys:', error)
    return {}
  }
}

// Get API key for a specific provider
export async function getApiKey(provider: string): Promise<string | null> {
  try {
    const apiKeys = await getApiKeys()
    return apiKeys[provider] || null
  } catch (error) {
    console.error('Error getting API key for provider:', error)
    return null
  }
}

// Remove API key for a provider
export async function removeApiKey(provider: string): Promise<void> {
  try {
    const existingKeys = await getApiKeys()
    
    // Remove the key for the specified provider
    if (existingKeys[provider]) {
      delete existingKeys[provider]
      await storage.setItem(API_KEYS_KEY, existingKeys)
    }
  } catch (error) {
    console.error('Error removing API key:', error)
  }
}
