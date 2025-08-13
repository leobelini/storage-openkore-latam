import { FileWarningIcon } from 'lucide-react';

import NewFile from './new-file';
import SelectFile from './select-file';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function Home() {
  return (
    <div className='flex h-screen flex-col'>
      <div className='flex w-full items-center justify-center gap-2 p-2'>
        <p className='text-sm'>Arquivo de configuração:</p>
        <SelectFile />
        <NewFile />
      </div>
      <div className='grid w-full items-center justify-center gap-2 px-10 h-full grid-cols-3'>
        <div className='col-span-2'>
          <Alert variant='warning'>
            <FileWarningIcon />
            <AlertTitle>Carregue um arquivo de configuração</AlertTitle>
            <AlertDescription>
              <p>
                Para começar, você precisa <b>carregar</b> um arquivo de
                configuração. <br /> <b>Clique no botão</b>{' '}
                <i>"Escolher arquivo"</i> ou <i>"Nova configuração"</i> para
                começar.
              </p>
            </AlertDescription>
          </Alert>
        </div>
        <div className='text-sm text-muted-foreground'>
          <p>
            Desenvolvido por: <br />{' '}
            <a
              href='https://github.com/leobelini'
              target='_blank'
              rel='noreferrer'
            >
              <b>Léo Belini</b>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
