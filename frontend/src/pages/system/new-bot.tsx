import { z } from "zod"
import type { ConfigFileBot } from "@/types/config-file";
import { useCallback, useEffect, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BotIcon, Gamepad2Icon, UserRoundPlusIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetPathFile } from '../../../wailsjs/go/main/App';
import { toast } from "sonner";
import { frontend, main } from "../../../wailsjs/go/models";
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  name: z.string().min(4, "Informe nome com no mínimo 4 caracteres").max(50, "O nome deve ter no máximo 50 caracteres"),
  description: z.string().optional(),

  gameLogin: z.string().optional(),
  gamePassword: z.string().optional(),
  gameExecPath: z.string().optional(),
  gameAccessPassword: z.string().optional(),

  totpSecret: z.string().optional(),

  ghostIp: z.ipv4({
    error: "Informe um IP válido",
  }),
  ghostPort: z.string().min(1, "Informe um número válido")
    .refine((value) => !isNaN(parseInt(value)), "Informe um número válido")  ,
  openKoreExecPath: z.string().min(1, "Informe um caminho válido"),
  openKoreExecArgs: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

type Props = {
  handleCreate: (bot: ConfigFileBot) => Promise<void>
}

function NewBot(props: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      gameAccessPassword: "",
      gameExecPath: "",
      gameLogin: "",
      gamePassword: "",
      ghostIp: "",
      ghostPort: null!,
      name: "",
      openKoreExecArgs: "",
      openKoreExecPath: "",
      totpSecret: "",
    },
  })

  const handleSetFieldFile = useCallback(
    async (name: FieldPath<FormData>) => {
      try {
        const configMap: Partial<Record<FieldPath<FormData>, main.ReplaceFileConfigParam>> = {
          gameExecPath: new main.ReplaceFileConfigParam({
            Title: "Selecione o arquivo",
            Filter: [
              new frontend.FileFilter({
                DisplayName: "Jogo Ragnarok",
                Pattern: "Ragexe.exe",
              }),
            ],
          }),
          openKoreExecPath: new main.ReplaceFileConfigParam({
            Title: "Selecione o arquivo",
            Filter: [
              new frontend.FileFilter({
                DisplayName: "OpenKore",
                Pattern: "start.exe;tkstart.exe;vxstart.exe;winguistart.exe;wxstart.exe",
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

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const bot: ConfigFileBot = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        gameLogin: data.gameLogin,
        gamePassword: data.gamePassword,
        gameExecPath: data.gameExecPath,
        gameAccessPassword: data.gameAccessPassword,
        totpSecret: data.totpSecret,
        ghostIp: data.ghostIp,
        ghostPort: Number(data.ghostPort),
        openKoreExecPath: data.openKoreExecPath,
        openKoreExecArgs: data.openKoreExecArgs,
      }
      await props.handleCreate(bot)
      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar o bot";
      toast(message);
    }
  }, [props.handleCreate])

  useEffect(() => {
    if (open) {
      form.reset()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon"><UserRoundPlusIcon /></Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Novo bot</DialogTitle>
            </DialogHeader>

            <Tabs>
              <TabsList>
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="game">Jogo</TabsTrigger>
                <TabsTrigger value="access">Acesso</TabsTrigger>
                <TabsTrigger value="ghost">Ghost</TabsTrigger>
                <TabsTrigger value="openkore">OpenKore</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="flex flex-col gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do bot<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="game" className="flex flex-col gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="gameExecPath"
                  render={({ field }) => (

                    <FormItem>
                      <FormLabel>Caminho do jogo<span className="text-destructive">*</span></FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <Button type="button" size="icon" onClick={() => handleSetFieldFile("gameExecPath")}><Gamepad2Icon /></Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gameAccessPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de acesso</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="access" className="flex flex-col gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="gameLogin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gamePassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totpSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave de autenticação</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="ghost" className="flex flex-col gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="ghostIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ghostPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porta<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="openkore" className="flex flex-col gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="openKoreExecPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caminho do OpenKore<span className="text-destructive">*</span></FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <Button type="button" size="icon" onClick={() => handleSetFieldFile("openKoreExecPath")}><BotIcon /></Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="openKoreExecArgs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Argumentos</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>


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

export default NewBot