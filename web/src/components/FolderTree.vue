<template>
  <v-treeview
      activatable
      :active.sync="active"
      item-key="path"
      :items="items"
      :load-children="fetchItems"
      :open.sync="open"
      open-on-click
      transition
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="!item.file">
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.file] }}
      </v-icon>
    </template>
  </v-treeview>
</template>

<script>
import files from "../apis/files";

export default {
  name: "FolderTree",
  props: {
    path: String,
  },
  data: () => ({
    active: [],
    open: [],
    files: {
      html: 'mdi-language-html5',
      js: 'mdi-nodejs',
      json: 'mdi-json',
      md: 'mdi-markdown',
      pdf: 'mdi-file-pdf',
      png: 'mdi-file-image',
      txt: 'mdi-file-document-outline',
      xls: 'mdi-file-excel',
    },
    items: [],
    keepOpen: [],
  }),
  mounted() {
    files.getItems().then(items => {
      console.log(items);
      this.items.push(...items.children);
      for (const key in this.items) {
        if (this.items[key].mimeType === 'default/foldr' && !this.items[key].children === undefined) {
          this.items[key].children = []
        }
      }
    });
    const filePath = this.path;
    const pathParts = filePath.split('/')
    filePath.split('/').forEach((item, index) => {
      if (index === 0) item = 'ROOT'
      const newPath = pathParts.slice(0, index + 1).join('/') || '';
      console.log(newPath);
      this.keepOpen.push(newPath)
    });
  },
  // watch: {
  //   open: 'keepOpen'
  // },
  methods: {
    // keepOpen() {
    //   console.log('call keepOpen');
    //   for (const key in this.keepOpen) {
    //     if (!(this.keepOpen[key] in this.open)) {
    //       this.open.push(this.keepOpen[key]);
    //     }
    //   }
    // },
    async fetchItems(item) {
      console.log('load tree children for', item.path);
      return files.getItems(item.path).then(itemData => {
        console.log('success load children data', item.path);
        for (const key in itemData.children) {
          if (itemData.children[key].mimeType !== 'default/foldr') continue;
          console.log('children foldr', key, 'path is', itemData.children[key].path);
          item.children.push(itemData.children[key])
        }
        if (!item.children || item.children.length === 0) {
          item.children = undefined;
        }
      }).catch(err => console.warn(err));
    },
  },
}
</script>

<style scoped>

</style>