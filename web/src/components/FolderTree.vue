<template>
  <v-jstree
      class="folder-tree"
      ref="folderTree"
      :data="items"
      allow-transition
      whole-row
      value-field-name="path"
      :async="loadData"
      @item-click="itemClick"
  >
    <template scope="_">
      <div style="display: inherit; width: 200px">
        <svg class="type-icon" aria-hidden="true">
          <use xlink:href="#type-dir"></use>
        </svg>
        {{ _.model.name }}
      </div>
    </template>
  </v-jstree>
</template>

<script>
import files from "../apis/files";
import VueJsTree from 'vue-jstree'
import router from "@/router";

export default {
  name: "FolderTree",
  components: {
    "v-jstree": VueJsTree
  },
  props: {
    path: String,
  },
  data: () => ({
    items: [],
  }),
  mounted() {
    // this.asyncData = [
    //   this.$refs.folderTree.initializeLoading()
    // ]
    // this.$refs.folderTree.handleAsyncLoad(this.asyncData, this.$refs.folderTree)
  },
  methods: {
    itemClick(oriNode) {
      const item = oriNode.data;
      console.log('call itemClick from item', item);
      if (item && item.path) {
        router.push({path: `/files${item.path}`});
      }
    },
    loadData(oriNode, resolve) {
      const item = oriNode.data;
      const path = item.path || '/';
      console.debug('load tree data for path', path, 'from item', item);
      files.getItems(path).then(items => {
        console.debug('  load tree data success', items);
        const newItems = [];
        for (const key in items.children) {
          if (items.children[key].mimeType === 'default/foldr') {
            const newItem = {
              name: items.children[key].name,
              path: items.children[key].path,
              selected: false,
            };
            console.debug('  load children', key, 'data', newItem);
            newItems.push(newItem);
          }
        }
        resolve(newItems)
      });
    },
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
.type-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.tree-default {
  padding-left: 12px;
}
</style>

<style>
.folder-tree .tree-children {
  padding-left: 0;
}
</style>