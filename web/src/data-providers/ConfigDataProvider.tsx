/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
/*
  We need any, because we don't know the type of the children,
  and we need the return those children again which is an "unsafe return"
*/

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Config {
  headerHTML?: string
}

const Context = createContext<Config>({})

/**
 * Provides the config from the backend for the whole application,
 * so it can be used in every component without it being reloaded the whole time.
 */
export const ConfigDataProvider = ({ children }: any): JSX.Element => {
  const [config, setConfig] = useState<Config>({})

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/doc/config.json')
        const data = (await res.json()) as Config
        setConfig(data)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return <Context.Provider value={config}>{children}</Context.Provider>
}

export const useConfig = (): Config => useContext(Context)
