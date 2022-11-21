import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext<any>({});

export const ConfigDataProvider = ({ children }: any) => {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
      });
  }, []);

  return <Context.Provider value={config}>{children}</Context.Provider>;
};

export const useConfig = () => useContext(Context);
