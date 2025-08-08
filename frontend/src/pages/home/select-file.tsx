import { z } from "zod"
import { toast } from "sonner"
import { CogIcon } from "lucide-react"
import { useNavigate } from "react-router"
import { useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldPath } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSystemContext } from "../system/context"
import { GetPathFile } from '../../../wailsjs/go/main/App';
import { frontend, main } from "../../../wailsjs/go/models";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const formSchema = z.object({
  password: z.string().min(1, "Informe uma senha"),
  filePath: z.string().min(1, "Selecione um arquivo"),
})

type FormData = z.infer<typeof formSchema>

function SelectFile() {
  let navigate = useNavigate();

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Selecionar configuração</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Seleção de configuração</DialogTitle>
            </DialogHeader>
            <FormField
                  control={form.control}
                  name="filePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arquivo de configuração<span className="text-destructive">*</span></FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <Button type="button" size="icon" onClick={() => handleSetFieldFile("filePath")}><CogIcon /></Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha de acesso<span className="text-destructive">*</span></FormLabel>
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
  )
}

export default SelectFile