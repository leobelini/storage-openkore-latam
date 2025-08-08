import { z } from "zod"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectFolder,CreateFileConfig } from '../../../wailsjs/go/main/App';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const formSchema = z.object({
  password: z.string().min(1, "Informe uma senha"),
  filename: z.string().min(1, "Informe um nome").max(50, "O nome deve ter no máximo 50 caracteres").regex(/^[a-z0-9]+$/i, "O nome deve conter apenas letras e números"),
})

type FormData = z.infer<typeof formSchema>

function NewFile() {

  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      filename: "",
    },
  })

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      let folder = "";
      try {
        folder = await SelectFolder();

        if (!folder) {
          toast("Selecione uma pasta")
          return;
        }
      } catch (error) {
        toast("Selecione uma pasta")
        return;
      }
      const content = JSON.stringify({valid: true}, null, 2);

      const fileName = [data.filename, ".start-openkore-latam"].join("");

      await CreateFileConfig(folder, fileName, data.password, content);

      toast("Arquivo criado com sucesso!")
      form.reset();
      setOpen(false);
    } catch (error) {
      toast("Não foi possível criar o arquivo")
      return;
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nova configuração</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Nova configuração</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha de acesso</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Essa senha será usada criptografar as informações de acesso e solicitar sempre que abrir.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do arquivo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-row gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Criar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default NewFile