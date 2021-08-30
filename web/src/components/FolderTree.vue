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
      <div style="display: inherit; width: 200px" @dblclick="e=>itemDbClick(_,_.model,e)">
        <svg class="type-icon" aria-hidden="true">
          <use xlink:href="#type-dir"></use>
        </svg>
        {{ _.model.name }}
      </div>
    </template>
  </v-jstree>
</template>

<script>
import files from "@/apis/files";
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
    itemDbClick(node, item, event) {
      console.debug('call itemDbClick from item', node, item, event);
      if (item && !item.loading && item.children.length > 0) item.opened = !item.opened;
    },
    itemClick(node, item, event) {
      console.debug('call itemClick from item', node, item, event);
      if (item && item.path && item.path !== this.path) router.push({path: `/files${item.path}`});
    },
    loadData(oriNode, resolve) {
      console.debug('loadData', oriNode);
      const item = oriNode.data;
      const path = item.path || '/';
      console.debug('load tree data for path', path, 'from item', item);
      files.getItems(path).then(items => {
        console.debug('  load tree data success', path, items);
        const newItems = [];
        for (const key in items.children) {
          if (items.children[key].mimeType === 'default/foldr') {
            const newItem = {
              name: items.children[key].name,
              path: items.children[key].path,
            };
            console.debug(' load tree children', key, 'data', newItem);
            newItems.push(newItem);
          }
        }
        resolve(newItems)
      }).catch(console.warn);
    }
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