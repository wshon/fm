const authConfig = {
  "root_pass": "your root_pass",  // 根目录密码，优先于.password
  "version": "1.0.0", // 程序版本
  "client_id": "your client_id",
  "client_secret": "your client_secret",
  "refresh_token": "your refresh_token", // 授权 token
  "root_path": "/" // 根目录ID
};

const page = `
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

if (KV === undefined) KV = null;
let od = null;

addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, {status: 500})
    )
  );
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if (od == null) od = new oneDrive(authConfig)
  const {pathname} = new URL(request.url);
  if (pathname === '/api/file') {
    return await apiFileRequest(request)
  } else {
    return new Response(page, {
      status: 200,
      headers: {'Content-Type': 'text/html; charset=utf-8'}
    });
  }
}

codeMap = {
  'itemNotFound': -50001
}

async function apiFileRequest(request) {
  const accessToken = await od.getAccessToken()
  if (!accessToken) {
    return newJsonResponse({
      code: -10001,
      message: 'Get accessToken failed',
    })
  }
  const {searchParams} = new URL(request.url);
  const path = searchParams.get('path');
  const item = await od.getDriverItem(path);
  if (item['error']) {
    const error = item['error']
    return newJsonResponse({
      code: codeMap[error['code']] || -50000,
      message: error['message'] || 'Undefined remote error',
    })
  }
  const data = od.formatDriverItem(item);
  const debug = searchParams.get('debug');
  if (debug === '65535') data.item = item
  return newJsonResponse({
    code: 0,
    message: 'success',
    data
  })
}

function newJsonResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200, headers: {
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*'
    }
  })
}

class cache {
  constructor() {
    console.log("kv load failed!");
    this.cache = {}
  }

  get(name) {
    return this.cache[name] || null;
  }

  put(name, value) {
    this.cache[name] = value;
  }
}

class oneDrive {
  constructor(authConfig) {
    this.cache = KV || new cache();
    this.fileHost = "https://graph.microsoft.com/v1.0";
    this.driveRoot = "/me/drive/root";
    this.authConfig = authConfig;
    this.files = [];
    this.passwords = [];
    if (this.authConfig.root_path[0] !== '/') {
      this.authConfig.root_path = '/' + this.authConfig.root_path
    }
    if (this.authConfig.root_path.substr(-1) === '/') {
      this.authConfig.root_path = this.authConfig.root_path.slice(0, -1)
    }
    if (this.authConfig.root_pass !== "") {
      this.passwords["/"] = this.authConfig.root_pass;
    }
  }

  async getAccessToken() {
    console.log("call getAccessToken");
    let accessToken = await KV.get("accessToken");
    accessToken = JSON.parse(accessToken || '{}')
    if (accessToken.expires === undefined || accessToken.expires < Date.now()) {
      console.log("accessToken not exist or expires, to get new");
      const rsp = await this.fetchNewAccessToken();
      if (rsp['access_token'] !== undefined) {
        accessToken.accessToken = rsp['access_token'];
        accessToken.expires = Date.now() + 3500 * 1000;
        await KV.put("accessToken", JSON.stringify(accessToken))
      } else {
        console.log("get new accessToken failed", rsp);
        return null;
      }
    }
    return accessToken.accessToken;
  }

  async fetchNewAccessToken() {
    console.log("call fetchNewAccessToken");
    const reqUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
    const reqOption = {
      'method': 'POST',
      'body': this.packFormData({
        'client_id': this.authConfig.client_id,
        'client_secret': this.authConfig.client_secret,
        'refresh_token': this.authConfig.refresh_token,
        'grant_type': 'refresh_token',
        'requested_token_use': "on_behalf_of",
      })
    };
    const response = await fetch(reqUrl, reqOption);
    return await response.json();
  }

  async getAuthedOption(headers = {}, method = 'GET') {
    console.log("call getAuthedOption", headers, method);
    const accessToken = await this.getAccessToken();
    headers['authorization'] = 'Bearer ' + accessToken;
    return {'method': method, 'headers': headers};
  }

  async getDriverItem(path) {
    console.log("call getDriverItem", path);
    if (path === undefined) {
      return null;
    }
    if (path === "/") path = "";
    if (path || this.authConfig.root_path) path = ":" + this.authConfig.root_path + path;
    let url = this.fileHost + this.driveRoot + encodeURI(path);
    const params = {};
    params.select = "id,name,size,parentReference,createdDateTime,lastModifiedDateTime,file,@microsoft.graph.downloadUrl,thumbnails"
    params.expand = "children(select=id,name,size,createdDateTime,lastModifiedDateTime,file,@microsoft.graph.downloadUrl,thumbnails)";
    url += '?' + this.packQueryParams(params);
    const reqOption = await this.getAuthedOption();
    const response = await fetch(url, reqOption);
    return await response.json();
  }

  formatDriverItem(itemData, path) {
    let newData = {}
    newData.id = itemData['id'];
    newData.name = itemData['name'];
    newData.size = itemData['size'];
    newData.ctime = itemData['createdDateTime'];
    newData.mtime = itemData['lastModifiedDateTime'];
    newData.parent = path || ((itemData['parentReference'] || {})['path'] || '').split(':')[1] || '';
    if (newData.parent === '' && newData.name === 'root') newData.name = ''
    if (newData.parent.substr(-1) !== '/') newData.parent = newData.parent + '/'
    newData.path = newData.parent + newData.name;
    if (itemData['file']) {
      newData.mimeType = (itemData['file'] || {})['mimeType'] || 'application/unknown'
      newData.download = itemData['@microsoft.graph.downloadUrl'];
      return newData;
    } else {
      newData.mimeType = 'default/foldr'
      newData.children = []
    }
    if (itemData['children']) {
      for (const i in itemData['children']) {
        const childData = itemData['children'][i]
        newData.children.push(this.formatDriverItem(childData, newData.path));
      }
    }
    return newData;
  }

  packQueryParams(data) {
    const ret = [];
    for (const d in data) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
    return ret.join('&');
  }

  packFormData(data) {
    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }
    return formData;
  }
}
