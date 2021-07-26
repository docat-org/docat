<template>
   <Layout>
    <form novalidate @submit.prevent="validateDelete" class="delete-form">
      <h1 class="delete-title">Delete documentation</h1>

      <md-field :class="getValidationClass('project')">
        <label>Projectname</label>
        <md-input type="text" id="project" name="project" v-model="form.project" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.project.required">The projectname is required</span>
      </md-field>

      <md-field :class="getValidationClass('version')">
        <label>Version</label>
        <md-input type="text" id="version" name="version" v-model="form.version" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.version.required">The version is required</span>
      </md-field>

      <md-field :class="getValidationClass('token')">
        <label>Token</label>
        <md-input type="text" id="token" name="token" v-model="form.token" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.token.required">The token is required</span>
      </md-field>

      <md-progress-bar md-mode="indeterminate" class="md-accent" v-if="sending" />
      <button class="md-button md-raised md-primary" :disabled="sending" type="submit">Delete</button>

      <md-snackbar md-position="left" :md-duration="4000" :md-active.sync="showError" md-persistent>
        <span>{{ error }}</span>
        <md-button class="md-primary" @click="showError = false">Close</md-button>
      </md-snackbar>
    </form>
  </Layout>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

import Layout from '@/components/Layout.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'Delete',
  mixins: [validationMixin],
  components: {
    Layout,
  },
  data() {
    return {
      form: {
        project: null,
        version: null,
        token: null
      },
      sending: false,
      error: '',
      showError: false
    }
  },
  validations: {
    form: {
      project: { required },
      version: { required },
      token: { required }
    }
  },
  methods: {
    async delete() {
      this.sending = true

      try {
        await ProjectRepository.delete_doc(this.form.project, this.form.version, this.form.token)
        const msg = "Documentation for " + this.form.project + " (" + this.form.version + ") deleted"
        this.clearForm()
        this.showError = true
        this.error = msg
      } catch(err) {
        // something went wrong while
        this.showError = true
        this.error = err
      }

      this.sending = false
    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    clearForm () {
      this.$v.$reset()
      this.form.project = null
      this.form.version = null
      this.form.token = null
    },
    validateDelete() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.delete()
      }
    }
  }
}
</script>

<style scoped>
.delete-title {
  margin-bottom: 16px;
}

.delete-form {
  margin-top: 48px;
  padding-right: 16px;
  padding-left: 16px;
}
</style>
