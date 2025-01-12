<template>

    <div>
     <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
       Farmácias
        </div>
        <div class="">
          <q-table
            :rows="clinics"
            :columns="columns"
            :filter="filter"
          >
        <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
                </q-input>
        </template>
        <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem resultados para visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
        <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="clinicName" :props="props">
                {{ props.row.clinicName }}
            </q-td>
             <q-td key="code" :props="props">
                {{ props.row.code }}
            </q-td>
             <q-td key="province" :props="props">
                {{ props.row.province.description }}
            </q-td>
             <q-td key="district" :props="props">
              {{  props.row.district !== undefined && props.row.district !== null ? props.row.district.description : '' }}
            </q-td>
              <q-td key="active" :props="props">
                {{ props.row.active ? 'Sim':'Nao' }}
            </q-td>
                  <q-td key="options" :props="props">
                  <div class="col">
                    <q-btn flat round
                    color="amber-8"
                    icon="edit"
                   v-if="props.row.active === true"
                   @click="editClinic(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn flat round
                    class="q-ml-md"
                    color="green-8"
                    icon="search"
                    @click="visualizeClinic(props.row)">
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                  </q-btn>
                 <q-btn flat round
                      class="q-ml-md"
                      :color="getColorActive(props.row)"
                      :icon="getIconActive(props.row)"
                      @click.stop="promptToConfirm(props.row)"
                     >
                     <q-tooltip :class="getTooltipClass(props.row)">{{props.row.active ? 'Inactivar': 'Activar'}}</q-tooltip>
                     </q-btn>
                  </div>
                  </q-td>
            </q-tr>
        </template>
    </q-table>
        </div>
         <div class="absolute-bottomg">
              <q-page-sticky position="bottom-right" :offset="[18, 18]">
                <q-btn size="xl" fab icon="add" @click="addClinic" color="primary" />
             </q-page-sticky>
        </div>
          <q-dialog persistent v-model="showClinicRegistrationScreen">
          <addClinic
            :selectedClinic="clinic"
             :editMode=editMode
           :onlyView="viewMode"
            @close="showClinicRegistrationScreen = false" />
      </q-dialog>
       <q-dialog v-model="alert.visible">
             <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
             </q-dialog>
    </div>
</template>
<script>
import { useQuasar } from 'quasar'
import Clinic from '../../../store/models/clinic/Clinic'
import { ref } from 'vue'

const columns = [
  { name: 'clinicName', required: true, label: 'Nome', align: 'left', field: row => row.clinicName, format: val => `${val}`, sortable: true },
  { name: 'code', required: true, label: 'Código', align: 'left', field: row => row.code, format: val => `${val}`, sortable: true },
  { name: 'province', required: true, label: 'Província', align: 'left', field: row => row.province.description, format: val => `${val}`, sortable: true },
  { name: 'district', required: true, label: 'Distrito', align: 'left', field: row => row.district !== undefined && row.district !== null ? row.district.description : 'Não Definido', format: val => `${val}`, sortable: true },
  { name: 'active', required: true, label: 'Activo', align: 'left', field: row => row.active, format: val => `${val}`, sortable: true },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]
export default {
  data () {
    const $q = useQuasar()

    return {
        columns,
        $q,
         showClinicRegistrationScreen: false,
         editMode: false,
         viewMode: false,
           alert: ref({
              type: '',
              visible: false,
              msg: ''
            }),
           filter: ref('')
    }
  },
 computed: {
      clinics () {
          return Clinic.query()
                      .with('province')
                      .with('district.province')
                      .with('facilityType')
                      .has('code')
                      .get()
      }
  },
  methods: {
      getAllClinics (offset) {
        if (this.clinics.length <= 0) {
                Clinic.api().get('/clinic?offset=' + offset + '&max=100').then(resp => {
                    offset = offset + 100
                    if (resp.response.data.length > 0) { setTimeout(this.getAllClinics(offset), 2) }
                }).catch(error => {
                    console.log(error)
                })
        }
      },
        getIconActive (clinic) {
           if (clinic.active) {
              return 'stop_circle'
              } else if (!clinic.active) {
              return 'play_circle'
              }
       },
       getColorActive (clinic) {
           if (clinic.active) {
              return 'red'
              } else if (!clinic.active) {
              return 'green'
              }
       },
        getTooltipClass (clinic) {
           if (clinic.active) {
              return 'bg-red-5'
              } else if (!clinic.active) {
              return 'bg-green-5'
              }
       },
       editClinic (clinic) {
        this.clinic = Object.assign({}, clinic)
         this.showClinicRegistrationScreen = true
         this.editMode = true
          this.viewMode = false
      },
        addClinic () {
          this.clinic = new Clinic()
         this.showClinicRegistrationScreen = true
           this.editMode = false
           this.viewMode = false
      },
        visualizeClinic (clinic) {
           this.clinic = Object.assign({}, clinic)
         this.viewMode = true
            this.showClinicRegistrationScreen = true
             this.editMode = false
      },
        promptToConfirm (clinic) {
         let msg = ''
            this.$q.dialog({ title: 'Confirm', message: clinic.active ? 'Deseja Inactivar a Farmácia?' : 'Deseja Activar a Farmácia?', cancel: true, persistent: true }).onOk(() => {
               if (clinic.active) {
                clinic.active = false
                msg = 'Farmácia inactivada com sucesso.'
              } else if (!clinic.active) {
                  clinic.active = true
                msg = 'Farmácia activada com sucesso.'
              }
             Clinic.apiSave(clinic).then(resp => {
                  this.displayAlert('info', msg)
            }).catch(error => {
                   this.displayAlert('error', error)
            })
        })
      },
       displayAlert (type, msg) {
          this.alert.type = type
          this.alert.msg = msg
          this.alert.visible = true
        },
        closeDialog () {
          if (this.alert.type === 'info') {
            this.$emit('close')
          }
        }
  },
  mounted () {
       const offset = 0
    this.getAllClinics(offset)
  },
  components: {
     addClinic: require('components/Settings/Clinic/AddClinic.vue').default,
      Dialog: require('components/Shared/Dialog/Dialog.vue').default
    // clinicsTable: require('components/Settings/Clinic/ClinicsTable.vue').default
  }
}
</script>
