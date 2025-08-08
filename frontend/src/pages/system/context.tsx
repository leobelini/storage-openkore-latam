import { createContext, useCallback, useContext, useState } from "react";

import { LoadFileConfig, ReplaceFile } from '../../../wailsjs/go/main/App';
import type { ConfigFile, ConfigFileBot } from "@/types/config-file";
import { toast } from "sonner";


interface SystemContextData {
  config: ConfigFile;
  // setConfig: (config: ConfigFile) => void;

  configPath: string;
  // setConfigPath: (configPath: string) => void;

  currentBot: ConfigFileBot;
  // setCurrentBot: (bot: ConfigFileBot) => void;

  loadFile: (password: string) => Promise<void>
  updateConfig: () => Promise<void>
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
  const [currentBot, _setCurrentBot] = useState<ConfigFileBot>(null!);

  const loadFile = useCallback(async (password: string) => {
    const { Content, Path } = await LoadFileConfig(password);

    const config = JSON.parse(Content);

    if (!config.valid)
      throw new Error("Arquivo inválido");

    setConfig(config);
    setConfigPath(Path);
    setPassword(password);
  }, []);

  const updateConfig = useCallback(async () => {
    try {

      await ReplaceFile(configPath, JSON.stringify(config), password);

    } catch (error) {
      toast("Não foi possível salvar o arquivo")
      return;
    }
  }, [config, password, configPath]);


  const contextValue = {
    config,
    configPath,
    currentBot,
    loadFile,
    updateConfig
  };

  return (
    <SystemContext.Provider value={contextValue}>
      {props.children}
    </SystemContext.Provider>
  )
}

export default SystemProvider