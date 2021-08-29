<template>
  <v-data-table
      id="fileTable"
      :headers="tableHeader"
      :items="tableData"
      item-key="name"
      hide-default-footer
  >
    <template v-slot:item.name="{ item }" v-on:click="itemAction(item)">
      <svg class="type-icon" aria-hidden="true">
        <use :xlink:href="'#type-'+getType(item.mimeType)"></use>
      </svg>
      <a style="margin-left: 10px" v-on:click="itemAction(item)"> {{ item.name }}</a>
    </template>
  </v-data-table>
</template>

<script>
import files from "../apis/files";
import router from "../router";
import typeMap from "../utils/typeMap";

export default {
  name: "FileTable",
  props: {
    path: String,
  },
  data: () => ({
    tableHeader: [
      {text: '文件名', value: 'name'},
      {text: '大小', value: 'size'},
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
    getType(name) {
      if (name in typeMap) {
        return typeMap[name]
      } else return 'file'
    },
    itemAction(item) {
      switch (item.mimeType) {
        case 'default/foldr':
          router.push({path: `/files${item.path}`});
          break;
        default:
          window.open(item.download, '_self');
          break;
      }
    },
    fetchData() {
      let path = this.path;
      if (path.substr(0, 1) !== '/') path = '/' + path
      console.log('get items for path', path);
      files.getItems(path).then((items) => {
        switch (items.mimeType) {
          case 'default/foldr':
            this.tableData = items.children;
            break;
          case 'file':
            break;
          default:
            break;
        }
      }).catch((error) => {
        console.log(error);
      })
    }
  }
}
</script>

<style scoped>
.type-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>