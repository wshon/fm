<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-subheader inset>{{ i18n.settingUserGroup || 'User Setting' }}</v-subheader>
        <v-list-item link :to="{name:'file',query:{path:'/'}}">
          <v-list-item-action>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i18n.settingFile || 'File Manager' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :to="{name:'share'}">
          <v-list-item-action>
            <v-icon>mdi-share-variant</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i18n.settingShare || 'Share Manager' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :to="{name:'setting'}">
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i18n.settingPersonal || 'Personal Setting' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-subheader inset>{{ i18n.settingSystemGroup || 'System Setting' }}</v-subheader>
        <v-list-item link :to="{name:'user'}">
          <v-list-item-action>
            <v-icon>mdi-account-supervisor</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i18n.settingUsers || 'Users Manager' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :to="{name:'system'}">
          <v-list-item-action>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i18n.settingSystem || 'System Setting' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ i18n.logoutList || 'Logout' }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="teal" dark clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>ZeroNas</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <span class="subheading">Hello Guys.</span>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn text :to="{name:'file',query:{path:'/'}}"> 文件管理</v-btn>
        <v-divider inset vertical></v-divider>
        <v-btn text :to="{name:'setting'}"> 个人设置</v-btn>
        <v-divider inset vertical></v-divider>
        <v-btn text :to="{name:'user'}"> 用户设置</v-btn>
        <v-divider inset vertical></v-divider>
        <v-btn text :to="{name:'system'}"> 系统设置</v-btn>
        <v-divider inset vertical></v-divider>
      </v-toolbar-items>
      <v-toolbar-items class="hidden-md-and-up ">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :to="{name:'file',query:{path:'/'}}">
              <v-list-item-title> 文件管理</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{name:'setting'}">
              <v-list-item-title> 个人设置</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{name:'user'}">
              <v-list-item-title> 用户设置</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{name:'system'}">
              <v-list-item-title> 系统设置</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view/>
      </v-container>
    </v-main>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2021 by WShon.com</span>
    </v-footer>
  </v-app>
</template>

<script>

import languages from "@/utils/languages";

export default {
  name: 'App',
  data: () => ({
    drawer: null,
    language: 'zh-cn',
  }),
  created() {
    // 在页面加载时读取 localStorage
    if (localStorage.getItem('store')) {
      // this.store.state = JSON.parse(localStorage.getItem('store'))
    }
    // 在页面刷新时将store保存到 localStorage 里
    window.addEventListener('beforeunload', () => {
      // localStorage.setItem('store', JSON.stringify(this.store.state))
    })
  },
  computed: {
    // 计算属性的 getter
    i18n() {
      // `this` 指向 vm 实例
      return languages[this.language]
    },
    loginShow() {
      return false
    },
  },
  methods: {
    onBtnLoginClick() {
      this.store.setUserInfoAction({name: 'username'})
      this.loginShow = false
    },
  },
};
</script>
