import { toast } from "sonner";
import { createContext, useCallback, useContext, useState } from "react";

import type { ConfigFile, ConfigFileBot } from "@/types/config-file";
import { LoadFileConfig, ReplaceFile } from '../../../wailsjs/go/main/App';


interface SystemContextData {
  config: ConfigFile;
  loadFile: (password: string, filePath: string) => Promise<void>
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

  const loadFile = useCallback(async (password: string, filePath: string) => {
    const { Content } = await LoadFileConfig(password, filePath);

    const config = JSON.parse(Content);

    if (!config.valid)
      throw new Error("Arquivo inválido");

    setConfig(config);
    setConfigPath(filePath);
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
    loadFile,
    createBot
  };

  return (
    <SystemContext.Provider value={contextValue}>
      {props.children}
    </SystemContext.Provider>
  )
}

export default SystemProvider