import { useSystemContext } from "./context"

function System() {
    const {config,configPath,currentBot}=useSystemContext()
    return (
        <div>
            {JSON.stringify({config,configPath,currentBot})}
        </div>
    )
}

export default System