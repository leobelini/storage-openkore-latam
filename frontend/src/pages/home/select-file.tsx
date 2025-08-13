import { z } from "zod"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldPath } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSystemContext } from "../system/context"
import { GetPathFile } from '../../../wailsjs/go/main/App';
import { frontend, main } from "../../../wailsjs/go/models";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const formSchema = z.object({
  password: z.string().min(1, "Informe uma senha"),
  filePath: z.string().min(1, "Selecione um arquivo"),
})

type FormData = z.infer<typeof formSchema>

function SelectFile() {
  const navigate = useNavigate();

  const { loadFile } = useSystemContext();

  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  const onSubmit = useCallback(async (data: FormData) => {
    try {

      await loadFile(data.password, data.filePath);
      form.reset();
      setOpen(false);
      navigate("/system");

    } catch (error) {
      toast("Não foi possível carregar o arquivo")
      return;
    }
  }, [])

  const handleSetFieldFile = useCallback(
    async (name: FieldPath<FormData>) => {
      try {
        const configMap: Partial<Record<FieldPath<FormData>, main.ReplaceFileConfigParam>> = {
          filePath: new main.ReplaceFileConfigParam({
            Title: "Selecione o arquivo",
            Filter: [
              new frontend.FileFilter({
                DisplayName: "Arquivo de configuração",
                Pattern: "*.start-openkore-latam",
              }),
            ],
          }),

        };

        const params = configMap[name];
        if (!params) throw new Error("Nenhuma opção selecionada");

        const value = await GetPathFile(params);
        form.setValue(name, value);
        setOpen(true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível selecionar o arquivo";
        toast(message);
      }
    },
    [form, toast]
  );

  return (
    <>
      <Button variant="outline" onClick={() => handleSetFieldFile("filePath")}>Selecionar configuração</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Senha de acesso</DialogTitle>
              </DialogHeader>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha de acesso<span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-row gap-2 justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Abrir</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SelectFile