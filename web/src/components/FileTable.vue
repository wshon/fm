<template>
  <v-data-table
      id="fileTable"
      class="row-pointer"
      :headers="tableHeader"
      :items="tableData"
      item-key="name"
      hide-default-footer
      @click:row="itemAction"
  >
    <template v-slot:item.icon="{ item }" v-on:click="itemAction(item)">
      <svg class="type-icon" aria-hidden="true">
        <use :xlink:href="'#type-'+getType(item)"></use>
      </svg>
    </template>
  </v-data-table>
</template>

<script>
import files from "@/apis/files";
import router from "@/router";
import typeMap from "@/utils/typeMap";

export default {
  name: "FileTable",
  props: {
    path: String,
  },
  data: () => ({
    tableHeader: [
      {text: '', value: 'icon', width: '3em', sortable: false},
      {text: '文件名', value: 'name'},
      {text: '大小', value: 'size'},
      {text: '类型', value: 'mimeType'},
      {text: '修改时间', value: 'time'},
    ],
    tableData: [],
  }),
  mounted() {
    this.fetchData();
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    getType(item) {
      if (item.mimeType in typeMap) {
        return typeMap[item.mimeType]
      }
      const ext = item.name.substring(item.name.lastIndexOf("."));
      if (ext in typeMap) {
        return typeMap[ext]
      }
      if (typeMap['*']) {
        return typeMap['*'];
      }
      return 'file'
    },
    itemAction(item) {
      switch (item.mimeType) {
        case 'default/foldr':
          if (item.path && this.path !== item.path) files.getItems(item.path).then(() => router.push({path: `/files${item.path}`}));
          break;
        default:
          window.open(item.download, '_self');
          break;
      }
    },
    fetchData() {
      let path = this.path;
      if (path.substr(0, 1) !== '/') path = '/' + path
      console.debug('load table data for path', path);
      files.getItems(path).then(items => {
        switch (items.mimeType) {
          case 'default/foldr':
            this.tableData = items.children;
            break;
          case 'file':
            break;
          default:
            break;
        }
      }).catch(console.warn);
    }
  }
}
</script>

<style scoped>
.type-icon {
  width: 3em;
  height: 3em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.row-pointer >>> tbody tr :hover {
  cursor: pointer;
}
</style>