<template>
  <v-treeview
      v-model="tree"
      :items="items"
      activatable
      item-key="path"
      open-on-click

      :load-children="fetchItems"
      :open.sync="open"
      :active.sync="active"
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
    open: ['public'],
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
    tree: [],
    items: [],
  }),
  mounted() {
    files.getItems().then(items => {
      console.log(items);
      this.items.push(...items.children);
      for (const key in this.items) {
        console.log(this.items[key]);
        console.log(this.items[key].children);
        if (this.items[key].mimeType === 'default/foldr' && !this.items[key].children === undefined) {
          this.items[key].children = []
        }
      }
    });
  },
  methods: {
    async fetchItems(item) {
      console.log('尝试获取子文件夹数据', item);
      files.getItems(item.path).then(itemData => {
        console.log('获取子文件夹数据成功', itemData);
        for (const key in itemData.children) {
          console.log('子文件夹数据', key, itemData.children[key]);
          if (itemData.children[key].mimeType !== 'default/foldr') continue;
          if (item.children[key] === undefined) {
            item.children[key] = itemData.children[key]
          }
        }
        if (!item.children || item.children.length === 0) {
          item.children = undefined;
        }
      });
    },
  },
}
</script>

<style scoped>

</style>