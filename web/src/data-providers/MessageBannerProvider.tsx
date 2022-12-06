/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
/*
  We need any, because we don't know the type of the children,
  and we need the return those children again which is an "unsafe return"
*/

import React, { useState, useCallback, useContext } from 'react'
import Banner from '../components/InfoBanner'

export interface Message {
  text: string | undefined
  type: 'error' | 'success'
}

interface MessageBannerState {
  showMessage: (message: Message) => void
}

export const Context = React.createContext<MessageBannerState>({
  showMessage: (): void => {
    console.warn('MessageBannerProvider not initialized')
  }
})

export function MessageBannerProvider({ children }: any): JSX.Element {
  // We need to store the last timeout, so we can clear when a new message is shown
  const [lastTimeout, setLastTimeout] = useState<NodeJS.Timeout | undefined>(
    undefined
  )
  const [message, setMessage] = useState<Message>({
    text: undefined,
    type: 'success'
  })

  const showMessage = useCallback((message: Message) => {
    if (lastTimeout !== undefined) {
      clearTimeout(lastTimeout)
    }

    setMessage(message)

    // Hide message after 6 seconds
    const newTimeout = setTimeout(
      () =>
        setMessage({
          text: undefined,
          type: 'success'
        }),
      6000
    )

    setLastTimeout(newTimeout)
  }, [])

  return (
    <Context.Provider value={{ showMessage }}>
      <Banner
        successMsg={message.type === 'success' ? message.text : undefined}
        errorMsg={message.type === 'error' ? message.text : undefined}
      />
      {children}
    </Context.Provider>
  )
}

export const useMessageBanner = (): MessageBannerState => useContext(Context)
