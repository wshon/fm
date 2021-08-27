<template>
  <div class="elevation-3 full-father" ondragstart="return false">
    <v-toolbar dense flat color="grey lighten-5">
      <v-btn class="ma-2" text icon color="blue lighten-2" v-on:click="goUpLevel()">
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
      <v-divider inset vertical></v-divider>
      <v-breadcrumbs :items="pathList"></v-breadcrumbs>
    </v-toolbar>
    <v-divider></v-divider>
    <v-skeleton-loader
        class="mx-auto"
        :loading="loading"
        transition="v-fade-transition"
        type="table"
    >
      <v-data-table
          id="fileTable"
          :headers="tableHeader"
          :items="tableData"
          item-key="name"
          hide-default-footer
      >
        <template v-slot:item.name="{ item }" v-on:click="itemAction(item)">
          <svg class="type-icon" aria-hidden="true">
            <use :xlink:href="'#type-'+getType(item.type)"></use>
          </svg>
          <a style="margin-left: 10px" v-on:click="itemAction(item)"> {{ item.name }}</a>
        </template>
      </v-data-table>
    </v-skeleton-loader>
    <v-overlay id="uploadFrame" :value="overlay">
      <v-btn icon @click="overlay = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-overlay>
  </div>
</template>

<script>
import router from "@/router";

export default {
  name: "File",
  data: () => ({
    // store,
    overlay: false,
    tableHeader: [
      {text: '文件名', value: 'name'},
      {text: '大小', value: 'size'},
      {text: '修改时间', value: 'time'},
    ],
    tableData: [],
    pathList: [],
    fileSelected: [],
    typeMap: {
      '': 'file',
      '.dir': 'dir',
      '.doc': 'doc',
      '.docx': 'doc',
      '.xls': 'xls',
      '.xlsx': 'xls',
      '.ppt': 'ppt',
      '.pptx': 'ppt',
      '.pdf': 'pdf',
      '.jpg': 'jpg',
      '.jpeg': 'jpeg',
      '.png': 'png',
      '.psd': 'psd',
      '.svg': 'svg',
      '.mp3': 'mp3',
      '.mp4': 'mp4',
      '.avi': 'avi',
      '.fla': 'fla',
      '.tar': 'tar',
      '.biz': 'tar',
      '.gz': 'tar',
      '.xz': 'tar',
      '.7z': 'tar',
      '.rar': 'tar',
      '.zip': 'zip',
      '.txt': 'txt',
      '.csv': 'csv',
      '.json': 'json',
      '.xml': 'xml',
      '.htm': 'html',
      '.html': 'html',
      '.js': 'js',
      '.css': 'css',
      '.ai': 'ai',
      '.bat': 'exe',
      '.cmd': 'exe',
      '.dll': 'exe',
      '.exe': 'exe',
      '.rtf': 'rtf',
      '.dwg': 'dwg',
      '.dbf': 'dbf',
      '.iso': 'iso',
      '.*': 'search',
    },
  }),
  created() {
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    this.fetchData();
  },
  mounted() {
    const fileTable = document.getElementById('fileTable');
    const uploadFrame = document.getElementById('uploadFrame');
    console.log(uploadFrame);
    fileTable.ondragenter = (e) => {
      e.stopPropagation();
      e.preventDefault();  //阻止拖入时的浏览器默认行为
      console.log('ondragenter');
      this.overlay = true;
    };
    uploadFrame.ondragover = (e) => {
      e.stopPropagation();
      e.preventDefault();    //阻止拖来拖去的浏览器默认行为
    };
    uploadFrame.ondragleave = (e) => {
      e.stopPropagation();
      e.preventDefault();  //阻止离开时的浏览器默认行为
      console.log('ondragleave');
      this.overlay = false;
    };
    uploadFrame.ondrop = (e) => {
      e.stopPropagation();
      e.preventDefault();    //阻止拖放后的浏览器默认行为
      console.log('ondrop');
      this.overlay = false;
      const data = e.dataTransfer.files;  // 获取文件对象
      if (data.length < 1) {
        return;  // 检测是否有文件拖拽到页面
      }
      console.log(e.dataTransfer.files);
      const formData = new FormData();
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        console.log(e.dataTransfer.files[i]);
        formData.append('uploadfile', e.dataTransfer.files[i], e.dataTransfer.files[i].name);
      }
      this.tableData = this.tableData.concat(e.dataTransfer.files[0]);
      console.log(formData, this.tableData, e.dataTransfer.files[0]);
    };
  },
  computed: {
    loading() {
      // return !this.store.state.is_login
      return false
    }
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    getType(name) {
      if (name in this.typeMap) {
        return this.typeMap[name]
      } else return 'file'
    },
    goUpLevel() {
      const pathParts = this.$route.query.path.split('/');
      if (pathParts[1] !== '') {
        const newPath = pathParts.slice(0, -1).join('/') || '/';
        router.push({name: 'file', query: {path: newPath}});
      }
    },
    toggleSelection(rows) {
      console.log(this.$refs.tableData);
      if (rows === 'all') {
        this.$refs.tableData.toggleAllSelection();
      } else if (rows) {
        rows.forEach(row => {
          this.$refs.tableData.toggleRowSelection(row);
        });
      } else {
        this.$refs.tableData.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.fileSelected = val;
    },
    itemAction(item) {
      switch (item.type) {
        case '.dir':
          router.push({name: 'file', query: {path: item.path}});
          break;
        default:
          window.open("/api/file?path=" + item.path, 'download');
          break;
      }
    },
    fetchData() {
      const path = this.$route.query.path || '/';
      console.log(path);
      fetch('/api/file?path=' + path,)
          .then(res => res.json())
          .then((response) => {
            switch (response.data.type) {
              case '.dir':
                this.tableData = response.data.items;
                this.pathList = [];
                path.split('/').forEach((item, index) => {
                  if (index === 0) item = 'Home';
                  this.pathList.push({
                    text: item,
                    disabled: false,
                    exact: true,
                    to: {
                      name: 'file',
                      query: {
                        path: path.split('/').slice(0, index + 1).join('/') || '/'
                      }
                    }
                  })
                });
                break;
              case 'file':
                break;
              default:
                break;
            }
          })
          .catch((error) => {
            console.log(error);
          })
    }
  }
}
</script>

<style scoped>

</style>