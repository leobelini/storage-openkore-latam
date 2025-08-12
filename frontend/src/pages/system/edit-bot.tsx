import { toast } from "sonner";
import { PencilIcon } from "lucide-react";
import { useCallback, useState } from "react";

import type { ConfigFileBot } from "@/types/config-file";

import FormBot from "./form-bot";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";



type Props = {
  bot: ConfigFileBot
  handleEdit: (bot: ConfigFileBot) => Promise<void>
}

function EditBot(props: Props) {
  const [open, setOpen] = useState(false);

  const onCreate = useCallback(async (bot: ConfigFileBot) => {
    try {
      await props.handleEdit(bot);
      setOpen(false);
    } catch (error) {
      toast("Não foi possível editar o bot");
      return;
    }

  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost"><PencilIcon /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar bot</DialogTitle>
        </DialogHeader>

        <FormBot
          onCancel={() => setOpen(false)}
          onSubmit={onCreate}
          showButtons
          bot={props.bot}
        />
      </DialogContent>
    </Dialog>
  )
}

export default EditBot