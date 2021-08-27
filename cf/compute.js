console.log("worker start loading");

const authConfig = {
    "siteName": "GoIndex", // 网站名称
    "root_pass": "muumwoshimima",  // 根目录密码，优先于.password
    "version": "1.0.6", // 程序版本
    "theme": "material", // material  classic
    "client_id": "202264815644.apps.googleusercontent.com",
    "client_secret": "X4Z3ca8xfWDb1Voo-F9a7ZxJ",
    "refresh_token": "1//0677EHEQL5bGnCgYIARAAGAYSNwF-L9IrciPIlX6Y9M81H26epbUU1ZyNIO10XbwJfo3NyBiqt5dCFAgy498RPdAkv5dcIn2pD-w", // 授权 token
    "root_path": "/" // 根目录ID
};

let oDataApi;

const html = `
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Test Web worker</title>
  <link href="http://localhost:8080/js/about.js" rel="prefetch">
  <link href="http://localhost:8080/js/app.js" rel="preload" as="script">
  <link href="http://localhost:8080/js/chunk-vendors.js" rel="preload" as="script">
</head>
<body>
<noscript>
  <strong>We're sorry but pypst_web doesn't work properly without JavaScript enabled. Please enable it to
    continue.</strong>
</noscript>
<div id="app"></div>
<!-- built files will be auto injected -->
<script type="text/javascript" src="http://localhost:8080/js/chunk-vendors.js"></script>
<script type="text/javascript" src="http://localhost:8080/js/app.js"></script>
</body>
</html>
`;

self.addEventListener('fetch', event => {
    console.log('newFetchEvent', event.request)
    // local debug
    if (event.request.url.indexOf('127.0.0.1') === -1) {
        console.log('get origin ' + event.request.url)
        return event.respondWith(fetch(event.request));
    }
    // local debug
    event.respondWith(handleRequest(event.request));
});

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
    if (oDataApi === undefined) {
        oDataApi = new oneDrive(authConfig);
    }
    if (request.method === 'POST') {
        return apiRequest(request);
    }
    let url = new URL(request.url);
    let path = url.pathname;
    console.log(path)
    let action = url.searchParams.get('a');
    if (action === 'download') {
        if (path.split('/').pop().toLowerCase() === ".password") {
            return new Response("", {status: 404});
        }
        let fileItem = await oDataApi.getFileItem(path);
        return Response.redirect(fileItem['@microsoft.graph.downloadUrl'], 302);
    } else {
        return new Response(html, {status: 200, headers: {'Content-Type': 'text/html; charset=utf-8'}});
    }
}


async function apiRequest(request) {
    let obj;
    let url = new URL(request.url);
    let path = url.pathname;

    let option = {status: 200, headers: {'Access-Control-Allow-Origin': '*'}}

    if (path.substr(-1) === '/') {
        // check password
        let password = await oDataApi.password(path);
        console.log("dir password", password);
        if (password !== undefined && password != null && password !== "") {
            try {
                obj = await request.json();
            } catch (e) {
                obj = {};
            }
            console.log(password, obj);
            if (password !== obj.password) {
                let html = `{"error": {"code": 401,"message": "password error."}}`;
                return new Response(html, option);
            }
        }
        let folderItem = await oDataApi.getFolderItem(path);
        return new Response(JSON.stringify(folderItem), option);
    } else {
        let fileItem = await oDataApi.getFileItem(path);
        return new Response(JSON.stringify(fileItem), option);
    }
}

class oneDrive {
    constructor(authConfig) {
        this.fileHost = "https://graph.microsoft.com/v1.0";
        this.authConfig = authConfig;
        this.files = [];
        this.passwords = [];
        if (authConfig.root_path[0] !== '/') {
            authConfig.root_path = '/' + authConfig.root_path
        }
        if (authConfig.root_path.substr(-1) === '/') {
            authConfig.root_path = authConfig.root_path.slice(0, -1)
        }
        if (authConfig.root_pass !== "") {
            this.passwords["/"] = authConfig.root_pass;
        }
        this.accessToken();
    }

    async getFileItem(path) {
        if (typeof this.files[path] == 'undefined') {
            this.files[path] = await this._getFileItem(path);
        }
        return this.files[path];
    }

    async _getFileItem(path) {
        console.log("_getFileItem", path);
        if (path === undefined) {
            return null;
        }
        let url = this.fileHost + '/me/drive/root:' + this.authConfig.root_path + path;
        const params = {};
        params.select = "id,name,size,createdDateTime,lastModifiedDateTime,file,thumbnails,parentReference"
        url += '?' + this.enQuery(params);
        let requestOption = await this.requestOption();
        let response = await fetch(url, requestOption);
        return await response.json();
    }

    // 通过 request cache 来缓存
    async getFolderItem(path) {
        return await this._getFolderItem(path);
    }

    async _getFolderItem(path) {
        console.log("_getFolderItem", path);
        if (path === undefined) {
            return null;
        }
        let url = this.fileHost + '/me/drive/root:' + this.authConfig.root_path + path;
        const params = {};
        params.select = "id,name,size,lastModifiedDateTime,parentReference"
        params.expand = "children(select=id,name,size,lastModifiedDateTime,@microsoft.graph.downloadUrl)";
        url += '?' + this.enQuery(params);
        const requestOption = await this.requestOption();
        const response = await fetch(url, requestOption);
        return await response.json();
    }

    async password(path) {
        if (this.passwords[path] !== undefined) {
            return this.passwords[path];
        }
        console.log("load", path, ".password", this.passwords[path]);
        let fileItem = await oDataApi.getFileItem(path + '.password');
        if (fileItem === undefined) {
            this.passwords[path] = null;
        } else {
            const url = fileItem['@microsoft.graph.downloadUrl'];
            const requestOption = await this.requestOption();
            const response = await this.fetch200(url, requestOption);
            this.passwords[path] = await response.text();
        }
        return this.passwords[path];
    }

    async _findDirId(parent, name) {
        name = decodeURIComponent(name).replace(/'/g, "\\'");

        console.log("_findDirId", parent, name);

        if (parent === undefined) {
            return null;
        }

        let url = 'https://www.googleapis.com/drive/v3/files';
        let params = {'includeItemsFromAllDrives': true, 'supportsAllDrives': true};
        params.q = `'${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${name}'  and trashed = false`;
        params.fields = "nextPageToken, files(id, name, mimeType)";
        url += '?' + this.enQuery(params);
        let requestOption = await this.requestOption();
        let response = await fetch(url, requestOption);
        let obj = await response.json();
        if (obj.files[0] === undefined) {
            return null;
        }
        return obj.files[0].id;
    }

    async accessToken() {
        console.log("accessToken");
        if (this.authConfig.expires === undefined || this.authConfig.expires < Date.now()) {
            const obj = await this.fetchAccessToken();
            if (obj.access_token !== undefined) {
                this.authConfig.accessToken = obj.access_token;
                this.authConfig.expires = Date.now() + 3500 * 1000;
            }
        }
        return this.authConfig.accessToken;
    }

    async fetchAccessToken() {
        console.log("fetchAccessToken");
        const url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const post_data = {
            'client_id': this.authConfig.client_id,
            'client_secret': this.authConfig.client_secret,
            'refresh_token': this.authConfig.refresh_token,
            'grant_type': 'refresh_token',
            'requested_token_use': "on_behalf_of",
        }

        let requestOption = {
            'method': 'POST',
            'headers': headers,
            'body': this.enFormData(post_data)
        };

        const response = await fetch(url, requestOption);
        return await response.json();
    }

    async fetch200(url, requestOption) {
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            console.log(response.status);
            if (response.status !== 403) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
        return response;
    }

    async requestOption(headers = {}, method = 'GET') {
        const accessToken = await this.accessToken();
        headers['authorization'] = 'Bearer ' + accessToken;
        return {'method': method, 'headers': headers};
    }

    enQuery(data) {
        const ret = [];
        for (let d in data) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        }
        return ret.join('&');
    }

    enFormData(data) {
        const formData = new FormData();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                formData.append(key, data[key]);
            }
        }
        return formData;
    }

    async gatherResponse(response) {
        const {headers} = response;
        const contentType = headers.get("content-type");
        if (contentType.includes("application/json")) {
            return await response.json();
        } else if (contentType.includes("application/text")) {
            return await response.text();
        } else if (contentType.includes("text/html")) {
            return await response.text();
        } else {
            return await response.text();
        }
    }

    sleep(ms) {
        return new Promise(function (resolve, reject) {
            let i = 0;
            setTimeout(function () {
                console.log('sleep' + ms);
                i++;
                if (i >= 2) reject(new Error('i>=2'));
                else resolve(i);
            }, ms);
        })
    }
}

String.prototype.trim = function (char) {
    if (char) {
        return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};

console.log("worker load complete");
