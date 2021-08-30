export default {
  debug: true,
  state: {
    items: {},
  },
  getItems(path = '/') {
    console.debug('prepare load items from path', path);
    if (this.state.items[path] instanceof Promise) {
      console.debug('  find promise is running', this.state.items[path]);
      return this.state.items[path];
    }
    const promise = new Promise((resolve, reject) => {
      if (this.state.items[path]) {
        console.debug('  find cache items', this.state.items[path]);
        resolve(this.state.items[path]);
      } else {
        console.debug('  cache not found, load from remote');
        fetch('https://pan.oapi.workers.dev/api/file?path=' + path)
          .then(res => res.json()).then(res => {
          this.state.items[path] = res.data;
          console.debug('  success load remote items', this.state.items[path]);
          resolve(this.state.items[path])
        }).catch(reject);
      }
    })
    if (this.state.items[path] === undefined) this.state.items[path] = promise;
    return promise
  }
};