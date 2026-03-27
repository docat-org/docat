/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  We need any, because we don't know the type of the children
*/

import { createContext, useContext, useEffect, useRef, useState, JSX } from 'react'
import { useMessageBanner } from './MessageBannerProvider'
import { useConfig } from './ConfigDataProvider'


type Stats = {
  n_projects: number
  n_versions: number
  storage: string
}

interface StatsState {
  stats: Stats | null
  loadingFailed: boolean
}

interface StatsContext {
  state: StatsState
  reload: () => Promise<void>
}

const Context = createContext<StatsContext>({
  state: {
    stats: null,
    loadingFailed: false
  },
  reload: async (): Promise<void> => {
    console.warn('StatsProvider not initialized')
  }
})

enum LoadTrigger {
  INITIAL_LOAD,
  REQUESTED_RELOAD,
  INTERVAL
}

const isStatsEqual = (a: Stats | null, b: Stats | null): boolean => {
  if (a === null || b === null) {
    return a === b
  }
  return a.n_projects === b.n_projects
    && a.n_versions === b.n_versions
    && a.storage === b.storage
}
/**
 * Provides the stats of the docat instance
 * If reloading is required, call the reload function.
 */
export function StatsDataProvider({ children }: any): JSX.Element {
  const { showMessage } = useMessageBanner()
  const { reloadIntervalSeconds } = useConfig()
  const reloadRef = useRef<{reload: (loadTrigger: LoadTrigger) => Promise<void>}>({
    reload: async () => {
      console.warn('StatsDataProvider not initialized')
    }
  })
  const intervalRef = useRef<number | null>(null)

  const [state, setState] = useState<StatsState>({
    stats: null,
    loadingFailed: false
  })

  useEffect(() => {
    reloadRef.current.reload = async (loadTrigger: LoadTrigger): Promise<void> => {
      try {
        const response = await fetch('/api/stats')

        if (!response.ok) {
          if (loadTrigger === LoadTrigger.INTERVAL) {
            return
          }
          throw new Error(
            `Failed to load stats, status code: ${response.status}`
          )
        }

        const data: Stats = await response.json()
        if (isStatsEqual(state.stats, data)) {
          return
        }
        setState({
          stats: data,
          loadingFailed: false,
        })
      } catch (e) {
        console.error(e)

        showMessage({
          content: 'Failed to load stats',
          type: 'error',
          showMs: 6000
        })

        setState({
          stats: null,
          loadingFailed: true,
        })
      }
    }
  }, [showMessage, state.stats])

  useEffect(() => {
    reloadRef.current.reload(LoadTrigger.INITIAL_LOAD)
    if (reloadIntervalSeconds) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(() => reloadRef.current.reload(LoadTrigger.INTERVAL), reloadIntervalSeconds * 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Context.Provider value={{state: state, reload: async () => await reloadRef.current.reload(LoadTrigger.REQUESTED_RELOAD)}}>{children}</Context.Provider>
}

export const useStats = (): StatsContext => useContext(Context)
