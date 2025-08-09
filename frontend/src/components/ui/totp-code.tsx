import { useCallback, useEffect, useMemo, useState } from "react";
import { TOTP } from "totp-generator"
import { Progress } from "./progress";
import { Button } from "./button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

type TotpCodeProps = {
  totpSecret: string
}

function TotpCode({ totpSecret, }: TotpCodeProps) {

  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const handleCopyValue = useCallback(() => {
    navigator.clipboard.writeText(code);
    toast("Valor copiado para a área de transferência", {
      icon: <CopyIcon />,
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
  }, [code]);

  useEffect(() => {
    if (!totpSecret) return;
    const secret = totpSecret;

    const updateCode = () => {
      setCode(TOTP.generate(secret, { period: 30 }).otp);
      const seconds = Math.floor(Date.now() / 1000);
      setTimeLeft(30 - (seconds % 30));
    };

    updateCode();

    const interval = setInterval(updateCode, 1000);

    return () => clearInterval(interval);
  }, [totpSecret]);

  const progress = useMemo(() => {
    return (timeLeft / 30) * 100;
  }, [timeLeft]);


  return (
    <div className="flex flex-col gap-2 w-40">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-muted-foreground">
          {code}
        </span>
        <Button type="button" size="icon" onClick={() => handleCopyValue()}><CopyIcon /></Button>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
}

export { TotpCode }