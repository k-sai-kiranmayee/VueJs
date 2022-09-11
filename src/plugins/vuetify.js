import Vue from 'vue'
import Vuetify from 'vuetify'
import wysiwyg from "vue-wysiwyg";
import "vuetify/dist/vuetify.css";
import '@mdi/font/css/materialdesignicons.css'
// import "@vue-wysiwyg/dist/vueWysiwyg.css";
import "vue-wysiwyg/dist/vueWysiwyg.css";

Vue.use(Vuetify)
Vue.use(wysiwyg, {
    hideModules: {
        "image": true,
        "table": true,
        "removeFormat": true,
        "separator": true
    },
    maxHeight: "500px",
    maxWidth: "500px"
});

export default new Vuetify({})
