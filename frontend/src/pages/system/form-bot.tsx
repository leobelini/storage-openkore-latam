import { z } from "zod"
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BotIcon, CopyIcon, Gamepad2Icon } from "lucide-react";
import { useForm, type FieldPath } from "react-hook-form";

import type { ConfigFileBot } from "@/types/config-file";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetPathFile } from '../../../wailsjs/go/main/App';
import { frontend, main } from "../../../wailsjs/go/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TotpCode } from "@/components/ui/totp-code";

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
    .refine((value) => !isNaN(parseInt(value)), "Informe um número válido"),
  openKoreExecPath: z.string().min(1, "Informe um caminho válido"),
  openKoreExecArgs: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

type Props = {
  isPreview?: boolean;
  bot?: ConfigFileBot;
  onSubmit?: (data: ConfigFileBot) => Promise<void>;
  onCancel?: () => void;
  showButtons?: boolean;
  isEditing?: boolean;
  copyButtons?: boolean;
}
function FormBot(props: Props) {



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

  const handleCopyValue = useCallback((name: FieldPath<FormData>) => {
    const value = form.getValues(name);
    navigator.clipboard.writeText(value || "");
    toast("Valor copiado para a área de transferência", {
      icon: <CopyIcon />,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
  }, [form]);

  const onSubmit = useCallback(async (data: FormData) => {
    if (!props.onSubmit) return;
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

      await props.onSubmit(bot)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar o bot";
      toast(message);
    }
  }, [props.onSubmit])

  const fillForm = useCallback((bot?: ConfigFileBot) => {
    if (bot) {
      form.setValue("name", bot.name);
      form.setValue("description", bot.description);
      form.setValue("gameLogin", bot.gameLogin);
      form.setValue("gamePassword", bot.gamePassword);
      form.setValue("gameExecPath", bot.gameExecPath);
      form.setValue("gameAccessPassword", bot.gameAccessPassword);
      form.setValue("totpSecret", bot.totpSecret);
      form.setValue("ghostIp", bot.ghostIp);
      form.setValue("ghostPort", bot.ghostPort.toString());
      form.setValue("openKoreExecPath", bot.openKoreExecPath);
      form.setValue("openKoreExecArgs", bot.openKoreExecArgs);
    } else {
      form.reset();
    }
  }, [])

  useEffect(() => {
    if (props.bot) {
      fillForm(props.bot)
    }
  }, [props.bot])

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <Tabs defaultValue="general">
          <TabsList className="w-full">
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
                  <FormLabel>Nome do bot{!props.isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled={props.isPreview} />
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
                    <Input {...field} disabled={props.isPreview} />
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
                  <FormLabel>Caminho do jogo{!props.isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    {!props.isPreview &&
                      <Button type="button" size="icon" onClick={() => handleSetFieldFile("gameExecPath")}><Gamepad2Icon /></Button>
                    }
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
                    <Input type="password" {...field} disabled={props.isPreview} />
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="password" {...field} disabled={props.isPreview} />
                    </FormControl>
                    {props.copyButtons &&
                      <Button type="button" size="icon" onClick={() => handleCopyValue("gameLogin")}><CopyIcon /></Button>
                    }
                  </div>
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="password" {...field} disabled={props.isPreview} />
                    </FormControl>
                    {props.copyButtons &&
                      <Button type="button" size="icon" onClick={() => handleCopyValue("gamePassword")}><CopyIcon /></Button>
                    }
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!props.isPreview && (
              <FormField
                control={form.control}
                name="totpSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de autenticação (TOTP)</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={props.isPreview} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {props.isPreview && props?.bot?.totpSecret && (
              <div className="flex flex-col gap-4">
                <FormLabel>TOTP</FormLabel>
                <TotpCode totpSecret={props.bot.totpSecret} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="ghost" className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="ghostIp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP{!props.isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={props.isPreview} />
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
                  <FormLabel>Porta{!props.isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" disabled={props.isPreview} />
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
                  <FormLabel>Caminho do OpenKore{!props.isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    {!props.isPreview &&
                      <Button type="button" size="icon" onClick={() => handleSetFieldFile("openKoreExecPath")}><BotIcon /></Button>
                    }
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
                    <Input {...field} disabled={props.isPreview} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

      </form>
    </Form>

  )
}

export default FormBot