export namespace main {
	
	export class LoadFileConfigResponse {
	    Content: string;
	    Path: string;
	
	    static createFrom(source: any = {}) {
	        return new LoadFileConfigResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Content = source["Content"];
	        this.Path = source["Path"];
	    }
	}

}

