import { toast } from "sonner";
import { useCallback, useState } from "react";
import { TrashIcon } from "lucide-react";

import type { ConfigFileBot } from "@/types/config-file";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  bot: ConfigFileBot
  handleRemove: (bot: ConfigFileBot) => Promise<void>
}

function RemoveBot(props: Props) {

  const [open, setOpen] = useState(false);

  const onRemove = useCallback(async() => {
    try {
      await props.handleRemove(props.bot);
      setOpen(false);
    } catch (error) {
      toast("Não foi possível remover o bot");
      return;
    }

  }, [props.handleRemove, props.bot]);

  return (
     <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="destructive"><TrashIcon /></Button>
      </PopoverTrigger>
      <PopoverContent>
        <h3 className="text-lg font-semibold">Remover bot</h3>
        <Separator className="my-2" />
        <p>Tem certeza que deseja remover o bot {props.bot.name}?</p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => onRemove()}>Sim</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default RemoveBot