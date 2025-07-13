import { logConfigurationStatus } from './config-validator'

let validationComplete = false

export async function runStartupValidation(): Promise<void> {
  if (validationComplete) {
    return
  }

  try {
    console.log('🚀 Running application startup validation...')
    await logConfigurationStatus()
    validationComplete = true
    console.log('✅ Startup validation completed')
  } catch (error) {
    console.error('❌ Startup validation failed:', error)
    
    // In production, you might want to exit the process if critical validation fails
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 Critical configuration issues detected in production. Please fix and restart.')
      // Optionally: process.exit(1)
    }
  }
}

// Auto-run validation in production and development
if (typeof window === 'undefined') { // Server-side only
  runStartupValidation().catch(console.error)
}