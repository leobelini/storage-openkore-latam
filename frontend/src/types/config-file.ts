export interface ConfigFileBot {
  id: string;
  name: string;
  description?: string;

  gameLogin?: string;
  gamePassword?: string;
  // gameExecPath?: string
  gameAccessPassword?: string;
  storageAccessPassword?: string;

  totpSecret?: string;

  // ghostIp: string
  // ghostPort: number

  // openKoreExecPath: string
  // openKoreExecArgs?: string
}

export interface ConfigFile {
  valid: boolean;
  bots?: ConfigFileBot[];
}
