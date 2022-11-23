import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Config {
  headerHTML?: string
}

const Context = createContext<Config>({})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfigDataProvider = ({ children }: any): JSX.Element => {
  const [config, setConfig] = useState<Config>({})

  useEffect(() => {
    fetch('/config.json')
      .then(async (res) => await res.json() as Config)
      .then((data) => {
        setConfig(data)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return <Context.Provider value={config}>{children}</Context.Provider>
}

export const useConfig = (): Config => useContext(Context)
