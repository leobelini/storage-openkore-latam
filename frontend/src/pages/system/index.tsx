
import NewBot from "./new-bot"
import { useSystemContext } from "./context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function System() {
  const { config, createBot } = useSystemContext()
  return (
    <div className="flex h-screen flex-col w-screen">
      <div className="flex w-full items-center justify-center gap-2 p-2">
        <Label id="bot">Bot:</Label>
        <Select>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione um bot" />
          </SelectTrigger>
          <SelectContent>
            {(config?.bots || []).map(bot => (
              <SelectItem value={bot.id} key={bot.id}>{bot.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NewBot  handleCreate={createBot} />

      </div>
    </div>
  )
}

export default System