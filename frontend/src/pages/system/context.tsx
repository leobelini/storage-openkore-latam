import { createContext, useCallback, useContext, useState } from "react";

import { LoadFileConfig, ReplaceFile } from '../../../wailsjs/go/main/App';
import type { ConfigFile, ConfigFileBot } from "@/types/config-file";
import { toast } from "sonner";


interface SystemContextData {
  config: ConfigFile;
  // setConfig: (config: ConfigFile) => void;

  // configPath: string;
  // setConfigPath: (configPath: string) => void;

  // currentBot: ConfigFileBot;
  // setCurrentBot: (bot: ConfigFileBot) => void;

  loadFile: (password: string) => Promise<void>
  // updateConfig: () => Promise<void>
  createBot: (bot: ConfigFileBot) => Promise<void>
}

const SystemContext = createContext<SystemContextData>(null!);
export const useSystemContext = () => useContext(SystemContext);

type Props = {
  children: React.ReactNode
}

function SystemProvider(props: Props) {
  const [config, setConfig] = useState<ConfigFile>(null!);
  const [configPath, setConfigPath] = useState<string>(null!);
  const [password, setPassword] = useState<string>(null!);
  // const [currentBot, _setCurrentBot] = useState<ConfigFileBot>(null!);

  const loadFile = useCallback(async (password: string) => {
    const { Content, Path } = await LoadFileConfig(password);

    const config = JSON.parse(Content);

    if (!config.valid)
      throw new Error("Arquivo inválido");

    setConfig(config);
    setConfigPath(Path);
    setPassword(password);
  }, []);


  const updateConfig = useCallback(async (config: ConfigFile) => {
    try {

      await ReplaceFile(configPath, JSON.stringify(config), password);

    } catch (error) {
      toast("Não foi possível salvar o arquivo")
      return;
    }
  }, [configPath, password]);



  const createBot = useCallback(async (bot: ConfigFileBot) => {
    const bots = [...(config.bots || []), bot];
    const newConfig = { ...config, bots };
    setConfig(newConfig);
    await updateConfig(newConfig);
  }, [config, updateConfig]);

  const contextValue = {
    config,
    // configPath,
    // currentBot,
    loadFile,
    createBot
    // updateConfig
  };

  return (
    <SystemContext.Provider value={contextValue}>
      {props.children}
    </SystemContext.Provider>
  )
}

export default SystemProvider