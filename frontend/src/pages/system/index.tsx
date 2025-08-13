import { useCallback, useEffect, useState } from "react"

import NewBot from "./new-bot"
import FormBot from "./form-bot"
import EditBot from "./edit-bot"
import RemoveBot from "./remove-bot"
import { useSystemContext } from "./context"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { ConfigFileBot } from "@/types/config-file"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function System() {
  const { config, createBot,updateBot,removeBot } = useSystemContext()

  const [currentBot, setCurrentBot] = useState<ConfigFileBot>(null!);

  const handleSelectBot = useCallback((botId: string) => {
    const bot = config?.bots?.find(bot => bot.id === botId);
    if (!bot) return;
    setCurrentBot(bot);
  }, [config]);

  useEffect(() => {
    if (config?.bots?.length) {
      setCurrentBot(config.bots[0]);
    }
  }, [config]);

  return (
    <div className="flex h-screen flex-col w-screen px-5 py-2">
      <div className="flex w-full items-center justify-center gap-2 p-2">
        <Label id="bot">Bot:</Label>
        <Select onValueChange={handleSelectBot} value={currentBot?.id}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione um bot" />
          </SelectTrigger>
          <SelectContent>
            {(config?.bots || []).map(bot => (
              <SelectItem value={bot.id} key={bot.id}>{bot.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentBot &&(
          <>
          <EditBot bot={currentBot} handleEdit={updateBot} />
          <RemoveBot bot={currentBot} handleRemove={removeBot} />
          </>
        )}
        <NewBot handleCreate={createBot} />

      </div>

      <Separator className="my-2" />

      {currentBot && <FormBot bot={currentBot} isPreview copyButtons />}
    </div>
  )
}

export default System