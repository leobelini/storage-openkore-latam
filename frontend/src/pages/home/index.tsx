import { FileWarningIcon } from "lucide-react"

import NewFile from "./new-file"
import SelectFile from "./select-file"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function Home() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex w-full items-center justify-center gap-2 p-2">
        <p className="text-sm">Arquivo de configuração:</p>
        <SelectFile/>
        <NewFile />
      </div>
      <div className="flex w-full items-center justify-center gap-2 px-10 h-full">
        <Alert variant="warning">
          <FileWarningIcon />
          <AlertTitle>Carregue um arquivo de configuração</AlertTitle>
          <AlertDescription>
            <p>

              Para começar, você precisa <b>carregar</b> um arquivo de configuração. <br /> <b>Clique no botão</b> <i>"Escolher arquivo"</i> ou <i>"Nova configuração"</i> para começar.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

export default Home