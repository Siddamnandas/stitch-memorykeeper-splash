import PostHog from 'posthog-js'
import { env } from './env'

// Initialize PostHog if keys are available and analytics is enabled
let posthog: ReturnType<typeof PostHog.init> | null = null

export const initializeAnalytics = () => {
  if (!env.POSTHOG_KEY || env.VITE_DISABLE_ANALYTICS_CONSENT) {
    return
  }

  posthog = PostHog.init(env.POSTHOG_KEY, {
    api_host: env.POSTHOG_API_HOST || 'https://app.posthog.com',
    capture_pageview: false, // We'll handle page views manually
    loaded: (ph) => {
      if (env.isProduction) ph.opt_in_capturing()
    }
  })
}

// Check if analytics is enabled
export const isAnalyticsEnabled = (): boolean => {
  return posthog !== null && posthog.has_opted_in_capturing()
}

// Consent management
export const enableAnalytics = () => {
  if (posthog) {
    posthog.opt_in_capturing()
  }
}

export const disableAnalytics = () => {
  if (posthog) {
    posthog.opt_out_capturing()
  }
}

// Generic tracking function with no-op when disabled
export const track = (event: string, properties?: Record<string, any>) => {
  if (!isAnalyticsEnabled()) {
    return
  }

  posthog!.capture(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    platform: 'web'
  })
}

// Page view tracking
export const trackPageView = (page: string) => {
  track('page_view', { page })
}

// User actions
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  track('user_action', { action, ...details })
}

// Memory-related events
export const trackMemoryEvent = (event: 'started' | 'saved' | 'viewed' | 'shared', memoryId?: string, properties?: Record<string, any>) => {
  track(`memory_${event}`, {
    memory_id: memoryId,
    ...properties
  })
}

// Game events
export const trackGameEvent = (event: 'started' | 'completed' | 'score_updated', gameType?: string, properties?: Record<string, any>) => {
  track(`game_${event}`, {
    game_type: gameType,
    ...properties
  })
}

// App lifecycle events
export const trackAppEvent = (event: 'installed' | 'updated' | 'first_visit' | 'return_visit') => {
  track(`app_${event}`)
}

// Error tracking (complement to Sentry)
export const trackError = (error: string, context?: Record<string, any>) => {
  track('error_occurred', {
    error_message: error,
    ...context
  })
}

// Consent tracking
export const trackConsentUpdate = (analytics: boolean, ai: boolean) => {
  track('consent_updated', {
    analytics_consent: analytics,
    ai_consent: ai
  })
}

// Performance metrics
export const trackPerformance = (metric: string, value: number, unit?: string) => {
  track('performance_metric', {
    metric,
    value,
    unit: unit || 'ms'
  })
}
