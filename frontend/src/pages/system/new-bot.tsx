import { toast } from 'sonner';
import { useCallback, useState } from 'react';
import { UserRoundPlusIcon } from 'lucide-react';

import type { ConfigFileBot } from '@/types/config-file';

import FormBot from './form-bot';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
  handleCreate: (bot: ConfigFileBot) => Promise<void>;
};

function NewBot(props: Props) {
  const [open, setOpen] = useState(false);

  const onCreate = useCallback(async (bot: ConfigFileBot) => {
    try {
      await props.handleCreate(bot);
      setOpen(false);
    } catch (error) {
      toast('Não foi possível criar o bot');
      return;
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='icon'>
          <UserRoundPlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo bot</DialogTitle>
        </DialogHeader>

        <FormBot
          onCancel={() => setOpen(false)}
          onSubmit={onCreate}
          showButtons
        />
      </DialogContent>
    </Dialog>
  );
}

export default NewBot;
