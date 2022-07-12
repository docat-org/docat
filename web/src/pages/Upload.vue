<template>
   <Layout>
    <form novalidate @submit.prevent="validateUpload" class="upload-form">
      <h1 class="upload-title">Upload documentation</h1>

      <p>
        If you want to automate the upload of your documentation consider using <code>curl</code>
        to post it to the server.
        There are some examples in the <a href="https://github.com/docat-org/docat/" target="_blank">docat repository</a>.
      </p>

      <md-field :class="getValidationClass('project')">
        <label>Projectname</label>
        <md-input ref="project" type="text" id="project" name="project" v-model="form.project" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.project.required">The projectname is required</span>
      </md-field>

      <md-field :class="getValidationClass('version')">
        <label>Version</label>
        <md-input type="text" id="version" name="version" v-model="form.version" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.version.required">The version is required</span>
      </md-field>

      <md-field :class="getValidationClass('documentation')">
        <label >Documentation (zip file)</label>
        <md-file id="documentation" @change="onFileUpload($event)" :disabled="sending" accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed" />
        <span class="md-error">The documentation is required</span>
      </md-field>

      <md-progress-bar md-mode="indeterminate" class="md-accent" v-if="sending" />
      <button class="md-button md-raised md-primary" :disabled="sending" type="submit">Upload</button>

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
  name: 'Upload',
  mixins: [validationMixin],
  components: {
    Layout,
  },
  async created() {
    document.title = "Upload | docat"
  },
  data() {
    return {
      form: {
        project: null,
        version: null
      },
      sending: false,
      error: '',
      showError: false
    }
  },
  mounted() {
    this.focusInput();
  },
  validations: {
    form: {
      project: { required },
      version: { required },
      file: ''
    }
  },
  methods: {
    async upload() {
      this.sending = true
      const formData = new FormData()
      formData.append("file", this.form.file)

      try {
        await ProjectRepository.upload(this.form.project, this.form.version, formData)
        this.clearForm()
      } catch(err) {
        // something went wrong while
        this.showError = true
        this.error = err
      }

      this.sending = false
    },
    onFileUpload(e) {
      const files = e.target.files || e.dataTransfer.files

      if (files.length) {
        this.form.file = files[0]
      }
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
    },
    validateUpload() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.upload()
      }
    },
    focusInput() {
      this.$refs.project.$el.focus();
    }
  }
}
</script>

<style scoped>
.upload-title {
  margin-bottom: 16px;
}

.upload-form {
  margin-top: 48px;
  padding-right: 16px;
  padding-left: 16px;
}
</style>
