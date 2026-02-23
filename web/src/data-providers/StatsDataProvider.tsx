/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  We need any, because we don't know the type of the children
*/

import { createContext, useContext, useEffect, useState } from 'react'
import { useMessageBanner } from './MessageBannerProvider'


type Stats = {
  n_projects: number
  n_versions: number
  storage: string
}

interface StatsState {
  stats: Stats | null
  loadingFailed: boolean
  reload: () => void
}

const Context = createContext<StatsState>({
  stats: null,
  loadingFailed: false,
  reload: (): void => {
    console.warn('StatsProvider not initialized')
  }
})

/**
 * Provides the stats of the docat instance
 * If reloading is required, call the reload function.
 */
export function StatsDataProvider({ children }: any): JSX.Element {
  const { showMessage } = useMessageBanner()

  const loadData = (): void => {
    void (async (): Promise<void> => {
      try {
        const response = await fetch('/api/stats')

        if (!response.ok) {
          throw new Error(
            `Failed to load stats, status code: ${response.status}`
          )
        }

        const data: Stats = await response.json()
        setState({
          stats: data,
          loadingFailed: false,
          reload: loadData
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
          reload: loadData
        })
      }
    })()
  }

  const [state, setState] = useState<StatsState>({
    stats: null,
    loadingFailed: false,
    reload: loadData
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const useStats = (): StatsState => useContext(Context)
