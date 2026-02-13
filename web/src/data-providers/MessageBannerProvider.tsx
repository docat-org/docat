/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  We need any, because we don't know the type of the children
*/

import React, { useState, useCallback, useContext } from 'react'
import Banner from '../components/InfoBanner'

export interface Message {
  content: string | JSX.Element | undefined
  type: 'success' | 'info' | 'warning' | 'error'
  showMs: number | null // null = infinite
}

interface MessageBannerState {
  showMessage: (message: Message) => void
  clearMessages: () => void
}

export const Context = React.createContext<MessageBannerState>({
  showMessage: (): void => {
    console.warn('MessageBannerProvider not initialized')
  },
  clearMessages: (): void => {
    console.warn('MessageBannerProvider not initialized')
  }
})

export function MessageBannerProvider({ children }: any): JSX.Element {
  // We need to store the last timeout, so we can clear when a new message is shown
  const [lastTimeout, setLastTimeout] = useState<ReturnType<typeof setTimeout>>()
  const [message, setMessage] = useState<Message>({
    content: undefined,
    type: 'success',
    showMs: 6000
  })

  const showMessage = useCallback((message: Message) => {
    if (lastTimeout !== undefined) {
      clearTimeout(lastTimeout)
    }

    setMessage(message)

    if (message.showMs === null) {
      // don't hide message
      return
    }

    // Hide message after 6 seconds
    const newTimeout = setTimeout(() => {
      setMessage({
        content: undefined,
        type: 'success',
        showMs: 6000
      })
    }, message.showMs)

    setLastTimeout(newTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearMessages = useCallback(() => {
    if (lastTimeout !== undefined) {
      clearTimeout(lastTimeout)
    }

    setMessage({
      content: undefined,
      type: 'success',
      showMs: 6000
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Context.Provider value={{ showMessage, clearMessages }}>
      <Banner message={message} />
      {children}
    </Context.Provider>
  )
}

export const useMessageBanner = (): MessageBannerState => useContext(Context)
