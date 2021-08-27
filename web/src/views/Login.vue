<template>
  <v-overlay :value="loginShow">
    <v-container class="full-screen fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>{{ i18n.loginTitle || 'Login' }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn @click="loginShow = false" icon large v-on="on">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
                <span>{{ i18n.loginClose || 'Close' }}</span>
              </v-tooltip>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                    :label="i18n.loginUsername||'Login'"
                    name="login"
                    prepend-icon="mdi-account"
                    type="text">
                </v-text-field>
                <v-text-field
                    id="password"
                    :label="i18n.loginPassword||'Password'"
                    name="password"
                    prepend-icon="mdi-lock"
                    type="password">
                </v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="onBtnLoginClick">{{ i18n.loginButton || 'Login' }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>

<script>
export default {
  name: "Login"
}
</script>

<style scoped>

</style>