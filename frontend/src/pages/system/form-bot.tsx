import { z } from "zod"
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import type { ConfigFileBot } from "@/types/config-file";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TotpCode } from "@/components/ui/totp-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(4, "Informe nome com no mínimo 4 caracteres").max(50, "O nome deve ter no máximo 50 caracteres"),
  description: z.string().optional(),

  gameLogin: z.string().optional(),
  gamePassword: z.string().optional(),
  // gameExecPath: z.string().optional(),
  gameAccessPassword: z.string().optional(),
  storageAccessPassword: z.string().optional(),

  totpSecret: z.string().optional(),

  // ghostIp: z.ipv4({
  //   error: "Informe um IP válido",
  // }),
  // ghostPort: z.string().min(1, "Informe um número válido")
  //   .refine((value) => !isNaN(parseInt(value)), "Informe um número válido"),
  // openKoreExecPath: z.string().min(1, "Informe um caminho válido"),
  // openKoreExecArgs: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

type Props = {
  isPreview?: boolean;
  bot?: ConfigFileBot;
  onSubmit?: (data: ConfigFileBot) => Promise<void>;
  onCancel?: () => void;
  showButtons?: boolean;
  copyButtons?: boolean;
}
function FormBot(props: Props) {

  const { bot, copyButtons, isPreview, onSubmit, showButtons, onCancel } = props

  const [showGameAccessPassword, setShowGameAccessPassword] = useState(false);
  const [showStorageAccessPassword, setShowStorageAccessPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      gameAccessPassword: "",
      storageAccessPassword: "",
      // gameExecPath: "",
      gameLogin: "",
      gamePassword: "",
      // ghostIp: "",
      // ghostPort: null!,
      name: "",
      // openKoreExecArgs: "",
      // openKoreExecPath: "",
      totpSecret: "",
    },
  })

  // const handleSetFieldFile = useCallback(
  //   async (name: FieldPath<FormData>) => {
  //     try {
  //       const configMap: Partial<Record<FieldPath<FormData>, main.ReplaceFileConfigParam>> = {
  //         // gameExecPath: new main.ReplaceFileConfigParam({
  //         //   Title: "Selecione o arquivo",
  //         //   Filter: [
  //         //     new frontend.FileFilter({
  //         //       DisplayName: "Jogo Ragnarok",
  //         //       Pattern: "Ragexe.exe",
  //         //     }),
  //         //   ],
  //         // }),
  //         // openKoreExecPath: new main.ReplaceFileConfigParam({
  //         //   Title: "Selecione o arquivo",
  //         //   Filter: [
  //         //     new frontend.FileFilter({
  //         //       DisplayName: "OpenKore",
  //         //       Pattern: "start.exe;tkstart.exe;vxstart.exe;winguistart.exe;wxstart.exe",
  //         //     }),
  //         //   ],
  //         // }),
  //       };

  //       const params = configMap[name];
  //       if (!params) throw new Error("Nenhuma opção selecionada");

  //       const value = await GetPathFile(params);
  //       form.setValue(name, value);
  //     } catch (error) {
  //       const message =
  //         error instanceof Error
  //           ? error.message
  //           : "Não foi possível selecionar o arquivo";
  //       toast(message);
  //     }
  //   },
  //   [form, toast]
  // );

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

  const handleSubmit = useCallback(async (data: FormData) => {
    if (!onSubmit) return;
    try {
      let id = bot?.id

      if (!id) {
        id = uuidv4();
      }

      const botValues: ConfigFileBot = {
        id,
        name: data.name,
        description: data.description,
        gameLogin: data.gameLogin,
        gamePassword: data.gamePassword,
        // gameExecPath: data.gameExecPath,
        gameAccessPassword: data.gameAccessPassword,
        storageAccessPassword: data.storageAccessPassword,
        totpSecret: data.totpSecret,
        // ghostIp: data.ghostIp,
        // ghostPort: Number(data.ghostPort),
        // openKoreExecPath: data.openKoreExecPath,
        // openKoreExecArgs: data.openKoreExecArgs,
      }

      await onSubmit(botValues)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar o bot";
      toast(message);
    }
  }, [onSubmit, bot])

  const fillForm = useCallback((bot?: ConfigFileBot) => {
    if (bot) {
      form.setValue("name", bot.name);
      form.setValue("description", bot.description);
      form.setValue("gameLogin", bot.gameLogin);
      form.setValue("gamePassword", bot.gamePassword);
      // form.setValue("gameExecPath", bot.gameExecPath);
      form.setValue("gameAccessPassword", bot.gameAccessPassword);
      form.setValue("storageAccessPassword", bot.storageAccessPassword);
      form.setValue("totpSecret", bot.totpSecret);
      // form.setValue("ghostIp", bot.ghostIp);
      // form.setValue("ghostPort", bot.ghostPort.toString());
      // form.setValue("openKoreExecPath", bot.openKoreExecPath);
      // form.setValue("openKoreExecArgs", bot.openKoreExecArgs);
    } else {
      form.reset();
    }
  }, [])

  useEffect(() => {
    if (bot) {
      fillForm(bot)
      setShowGameAccessPassword(false)
      setShowStorageAccessPassword(false)
    }
  }, [bot])

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">

        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="game">Jogo</TabsTrigger>
            <TabsTrigger value="access">Acesso</TabsTrigger>
            {/* <TabsTrigger value="ghost">Ghost</TabsTrigger> */}
            {/* <TabsTrigger value="openkore">OpenKore</TabsTrigger> */}
          </TabsList>
          <TabsContent value="general" className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do bot{!isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled={isPreview} />
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
                    <Textarea {...field} disabled={isPreview}
                      className="resize-none"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="game" className="flex flex-col gap-4 pt-4">
            {/* <FormField
              control={form.control}
              name="gameExecPath"
              render={({ field }) => (

                <FormItem>
                  <FormLabel>Caminho do jogo{!isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    {!isPreview &&
                      <Button type="button" size="icon" onClick={() => handleSetFieldFile("gameExecPath")}><Gamepad2Icon /></Button>
                    }
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="gameAccessPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN de acesso</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type={showGameAccessPassword ? "text" : "password"} {...field} disabled={isPreview} />
                    </FormControl>
                    <Button type="button" size="icon" onClick={() => setShowGameAccessPassword(!showGameAccessPassword)}>
                      {showGameAccessPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storageAccessPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN da kafra</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type={showStorageAccessPassword ? "text" : "password"} {...field} disabled={isPreview} />
                    </FormControl>
                    <Button type="button" size="icon" onClick={() => setShowStorageAccessPassword(!showStorageAccessPassword)}>
                      {showStorageAccessPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </Button>
                  </div>
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
                      <Input type="password" {...field} disabled={isPreview} />
                    </FormControl>
                    {copyButtons &&
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
                      <Input type="password" {...field} disabled={isPreview} />
                    </FormControl>
                    {copyButtons &&
                      <Button type="button" size="icon" onClick={() => handleCopyValue("gamePassword")}><CopyIcon /></Button>
                    }
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isPreview && (
              <FormField
                control={form.control}
                name="totpSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de autenticação (TOTP)</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPreview} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isPreview && bot?.totpSecret && (
              <div className="flex flex-col gap-4">
                <FormLabel>TOTP</FormLabel>
                <TotpCode totpSecret={bot.totpSecret} />
              </div>
            )}
          </TabsContent>

          {/* <TabsContent value="ghost" className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="ghostIp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP{!isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPreview} />
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
                  <FormLabel>Porta{!isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" disabled={isPreview} />
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
                  <FormLabel>Caminho do OpenKore{!isPreview && <span className="text-destructive">*</span>}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    {!isPreview &&
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
                    <Input {...field} disabled={isPreview} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent> */}
        </Tabs>

        {showButtons && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              form.reset();
              if (onCancel) onCancel();
            }}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        )}
      </form>
    </Form>

  )
}

export default FormBot