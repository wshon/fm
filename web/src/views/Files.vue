<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app clipped>
      <FolderTree :path="filePath"/>
    </v-navigation-drawer>
    <v-app-bar app color="teal" dark clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>ZeroNas</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <span class="subheading">Hello Guys.</span>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :to="{name:'file',query:{path:'/'}}">
              <v-list-item-title>退出登录</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-toolbar dense flat color="grey lighten-5">
          <v-btn class="ma-2" text icon color="blue lighten-2" v-on:click="goUpLevel()" :disabled="this.filePath===''">
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
          <v-divider inset vertical></v-divider>
          <v-breadcrumbs :items="breadcrumbsItems"></v-breadcrumbs>
        </v-toolbar>
        <v-divider></v-divider>
        <FileTable :path="filePath"/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import FolderTree from "../components/FolderTree"
import FileTable from '../components/FileTable';
import router from "../router";

export default {
  name: "Files",

  components: {
    FolderTree,
    FileTable,
  },

  data: () => ({
    drawer: null,
  }),

  computed: {
    filePath() {
      let filePath = this.$route.params['path'];
      if (filePath === undefined) filePath = ''
      // if (filePath.substr(0, 1) !== '/') filePath = '/' + filePath
      return filePath;
    },
    breadcrumbsItems() {
      console.debug('reload breadcrumbs items')
      const filePath = this.filePath
      console.debug('  current path is', filePath)
      const pathParts = filePath.split('/')
      console.debug('  current path is split to', pathParts)
      const pathList = [];
      filePath.split('/').forEach((item, index) => {
        if (index === 0) item = 'ROOT'
        const newPath = pathParts.slice(0, index + 1).join('/') || '';
        console.debug('  breadcrumbs path', index, 'is', newPath)
        pathList.push({
          text: item,
          disabled: false,
          exact: true,
          to: {path: `/files${newPath}`},
        })
      });
      return pathList;
    },
  },

  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      console.debug('$route changed from', from.path, 'to', to.path);
    }
  },

  methods: {
    goUpLevel() {
      console.debug('handle go up')
      const filePath = this.filePath
      console.debug('  current path is', filePath)
      const pathParts = filePath.split('/');
      console.debug('  current path is split to', pathParts)
      if (pathParts.length > 1) {
        const newPath = pathParts.slice(0, -1).join('/') || '';
        console.debug('  target path is', newPath)
        router.push({path: `/files${newPath}`});
      }
    },
    goToPath(path) {
      console.log('goto', path);
      // const pathParts = this.$route.query.path.split('/');
      // if (pathParts[1] !== '') {
      //   const newPath = pathParts.slice(0, -1).join('/') || '/';
      //   router.push({name: 'file', query: {path: newPath}});
      // }
    },
  },
}
</script>

<style scoped>

</style>