<template>
   <Layout>
    <h1>Upload</h1>

    <div class="md-content">
      <div class="md-field">
        <label for="version">Projektname</label>
        <input type="text" id="projectname" v-model="projectname">
      </div>
      
      <div class="md-field">
        <label for="version">Version</label>
        <input type="text" id="version" v-model="version">
      </div>

      <div class="md-field">
        <label for="documentation">Zip file</label>
        <input id="documentation" type="file" @change="handleFileUpload" />
      </div>
      <button class="md-button md-raised md-primary" v-on:click="upload">Upload</button>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import ProjectRepository from '@/repositories/ProjectRepository'

export default {
  name: 'Upload',
  components: {
    Layout
  },
  data() {
    return {
      projectname: '',
      version: '',
      documentation: '',
    }
  },
  methods: {
    handleFileUpload(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.documentation = files[0];
    },
    upload() {
      alert("wat");
      var formData = new FormData();
      formData.append("file", this.documentation);

      ProjectRepository.upload(this.projectname, this.version, formData);
      alert("wat");
    }
  }
}
</script>