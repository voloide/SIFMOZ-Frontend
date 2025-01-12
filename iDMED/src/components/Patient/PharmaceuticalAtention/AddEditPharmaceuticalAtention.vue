<template>
  <q-card style="max-width: 100vw;">
        <form @submit.prevent="submitMobilizer" >
            <q-card-section class="q-pa-none bg-green-2">
              <div class="row items-center text-subtitle1 q-pa-md">
                <q-icon  :name="patient.gender == 'Feminino' ? 'female' : 'male'" size="md" color="primary"/>
                <div class="text-bold text-grey-10 q-ml-sm">{{patient.fullName}}</div>
                <div class="text-grey-10 q-ml-sm"><span class="text-bold text-h6">|</span> {{patient.gender}}</div>
                <div class="text-grey-10 q-ml-sm"><span class="text-bold text-h6">|</span> {{patient.age()}} Anos de Idade</div>
              </div>
              <q-separator/>
            </q-card-section>
            <div class="text-center text-h6 q-mt-sm">
              Atenção Farmacêutica
            </div>
            <q-scroll-area
              :thumb-style="thumbStyle"
              :content-style="contentStyle"
              :content-active-style="contentActiveStyle"
              style="height: 410px; width: 1200px"
              class="q-pr-md"
            >
            <div class="text-left text-h7 bold q-ml-sm q-pa-md q-my-lg">
              <q-input
                  dense
                  outlined
                  style="width: 350px"
                  v-model="visitDate"
                  ref="data"
                  :disable="this.editMode"
                  label="Data da Consulta">
                  <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                          <q-date v-model="visitDate" mask="DD-MM-YYYY"  @update:model-value="verifyHasSameDay()">
                          <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                          </q-date>
                      </q-popup-proxy>
                      </q-icon>
                  </template>
              </q-input>
            </div>
            <div class="q-mx-lg">
              <q-stepper
                v-model="screeningStep"
                ref="stepper"
                header-class="text-bold bg-grey-3"
                color="primary"
                active-color="orange-7"
                animated
                header-nav
              >
                <q-step
                  :name="1"
                  title="Dados Vitais"
                  icon="show_chart"
                  :done="screeningStep > 1"
                >
                  <div class="row q-mt-md">
                        <numberField v-model="vitalSigns.height" label="Altura *"  :disable="onlyView" suffix="[Metros]" ref="height" @update:model-value="getImcValue()"/>
                      <numberField v-model="vitalSigns.weight" class="q-ml-md" label="Peso *"  suffix="[Kg]" :disable="onlyView" ref="weight" @update:model-value="getImcValue()"/>
                    </div>
                    <div class="row q-mt-md">
                      <numberField v-model="vitalSigns.imc" label="IMC *" filled disable ref="imc"/>
                      <TextInput dense v-model="imcDescription" class="col q-ml-md" filled label="IMC-Descricao"  disable />
                    </div>
                    <div class="row">
                        <numberField v-model="vitalSigns.systole" label="Sistole *"  :disable="onlyView"  suffix="[mmHg]" ref="systole"/>
                      <numberField v-model="vitalSigns.distort" class="q-ml-md" label="Diastole *" suffix="[mmHg]" :disable="onlyView" ref="distort"/>
                    </div>
                </q-step>

                <q-step
                  :name="2"
                  title="Rastreio de Tuberculose"
                  icon="show_chart"
                  :done="screeningStep > 2"
                >
                 <tbTable  @tbScreening="TBScreening = $event" :selectedTbTracing="patientVisit.tbScreening[0]"/>
                </q-step>

                <q-step
                  :name="3"
                  title="Rastreio de Gravidez"
                  v-if="this.patient.gender === 'Feminino'"
                  icon="show_chart"
                  :done="screeningStep > 3"
                >
                   <pregnancyTable  @pregnancyScreening="pregnancyScreening = $event" :selectedPregnancyTracing="patientVisit.pregnancyScreening[0]"/>
                </q-step>

                <q-step
                  :name="4"
                  title="Monitoria e Reforço à Adesão"
                  icon="show_chart"
                  :done="screeningStep > 4"
                >
                  <adherenceTable  @adherenceScreening="adherenceScreening = $event" :selectedAdherenceTracing="patientVisit.adherenceScreening[0]"/>
                </q-step>

                <q-step
                  :name="5"
                  title="Reações Adversas"
                  icon="show_chart"
                >
                 <ramTable  @rAMScreening="rAMScreening = $event" :selectedRamTracing="patientVisit.ramScreening[0]" :isNewRender="true"/>
                </q-step>
              </q-stepper>
            </div>
            </q-scroll-area>
             <q-card-actions align="right" class="q-my-md">
                <q-stepper-navigation >
                <q-btn label="Cancelar" color="red" @click="$emit('close')" />
                 <q-btn v-if="screeningStep > 1" color="primary" @click="$refs.stepper.previous()" label="Voltar" class="q-ml-sm" />
          <q-btn @click="goToNextStep" color="primary" :label="screeningStep === 5 ? 'Submeter' : 'Proximo'" class="q-ml-sm"/>
        </q-stepper-navigation>
            </q-card-actions>
             <q-dialog v-model="alert.visible">
          <Dialog :type="alert.type" @closeDialog="closeDialog">
            <template v-slot:title> Informação</template>
            <template v-slot:msg> {{alert.msg}} </template>
          </Dialog>
        </q-dialog>
        </form>
    </q-card>
</template>

<script>
import { SessionStorage } from 'quasar'
import PatientVisit from '../../../store/models/patientVisit/PatientVisit'
import Patient from '../../../store/models/patient/Patient'
import { ref } from 'vue'
import VitalSignsScreening from '../../../store/models/screening/VitalSignsScreening'
import TBScreening from '../../../store/models/screening/TBScreening'
import PregnancyScreening from '../../../store/models/screening/PregnancyScreening'
import AdherenceScreening from '../../../store/models/screening/AdherenceScreening'
import RAMScreening from '../../../store/models/screening/RAMScreening'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
export default {
    mixins: [mixinplatform, mixinutils],
    props: ['editPatientVisit', 'editMode'],
    data () {
        return {
          patientVisit: new PatientVisit(),
          vitalSigns: new VitalSignsScreening(),
          TBScreening: new TBScreening(),
          pregnancyScreening: new PregnancyScreening(),
          adherenceScreening: new AdherenceScreening(),
          rAMScreening: new RAMScreening(),
          screeningStep: ref(1),
          visitDate: '',
          // imcDescription: '',
          hasVisitSameDay: false,
          contentStyle: {
            backgroundColor: '#ffffff',
            color: '#555'
          },

          contentActiveStyle: {
            backgroundColor: '#eee',
            color: 'black'
          },

          thumbStyle: {
            right: '2px',
            borderRadius: '5px',
            backgroundColor: '#0ba58b',
            width: '5px',
            opacity: 0.75
          }
      }
    },
    created () {
      if (this.editPatientVisit) {
        this.patientVisit = Object.assign({}, this.editPatientVisit)
        this.visitDate = this.getDDMMYYYFromJSDate(this.editPatientVisit.visitDate)
        this.vitalSigns = Object.assign({}, this.editPatientVisit.vitalSigns[0])
        this.TBScreening = Object.assign({}, this.editPatientVisit.tbScreening[0])
        this.changeToEditStep()
      } else {
        this.changeToCreateStep()
      }
    },
    computed: {
      imcDescription: {
        get () {
          let imcDesc = ''
          const imc = this.vitalSigns.imc
            if (imc >= 16 && imc <= 16.9) {
              imcDesc = 'Muito abaixo do peso'
            } else if (imc >= 17 && imc <= 18.4) {
              imcDesc = 'Abaixo do peso'
            } else if (imc >= 18.5 && imc <= 24.9) {
              imcDesc = 'Peso normal'
            } else if (imc >= 25 && imc <= 29.9) {
              imcDesc = 'Acima do peso'
            }
          return imcDesc
        }
      },
      patient () {
      const selectedP = new Patient(SessionStorage.getItem('selectedPatient'))
      return Patient.query().with('identifiers.*')
                            .with('province')
                            .with('attributes')
                            .with('appointments')
                            .with('district')
                            .with('postoAdministrativo')
                            .with('bairro')
                            .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                            .where('id', selectedP.id).first()
      }
    },
    methods: {
       async goToNextStep () {
          if (this.screeningStep === 1) {
            this.$refs.height.$refs.ref.validate()
            this.$refs.weight.$refs.ref.validate()
            this.$refs.systole.$refs.ref.validate()
            this.$refs.distort.$refs.ref.validate()
           //  this.$refs.data.$refs.ref.validate()
           if (this.visitDate === '') {
              this.displayAlert('error', 'Por Favor Preencha data de consulta')
           } else if (this.getJSDateFromDDMMYYY(this.visitDate).setHours(0, 0, 0, 0) < new Date(this.patient.dateOfBirth).setHours(0, 0, 0, 0)) {
              this.displayAlert('error', 'A data de consulta indicada é maior que a data de nascimento do paciente/utente')
           } else if (this.patient.hasIdentifiers() && (new Date(this.patient.getOldestIdentifier().startDate).setHours(0, 0, 0, 0) > this.getJSDateFromDDMMYYY(this.visitDate).setHours(0, 0, 0, 0))) {
              this.displayAlert('error', 'A data da consulta indicada é maior que a data da admissão ao serviço se saúde [ ' + this.patient.getOldestIdentifier().service.code + ' ]')
           } else if (this.hasVisitSameDay && !this.editMode) {
             this.displayAlert('error', 'Ja Existe uma Atenção farmceutica nessa data .Por Favor use a funcionalidade editar')
           } else if (this.vitalSigns.height <= 0) {
              this.displayAlert('error', 'Por favor indique uma altura maior que zero ')
           } else if (this.vitalSigns.weight <= 0) {
              this.displayAlert('error', 'Por favor indique um peso maior que zero ')
            } else if (this.vitalSigns.systole <= 0 || this.vitalSigns.distort <= 0) {
              this.displayAlert('error', 'Por favor indique um sistole ou diastole maior que zero ')
            } else if (!this.$refs.height.$refs.ref.hasError && !this.$refs.weight.$refs.ref.hasError &&
             !this.$refs.systole.$refs.ref.hasError && !this.$refs.distort.$refs.ref.hasError) {
              this.$refs.stepper.next()
            }
          } else if (this.screeningStep === 2) {
            if (this.TBScreening.treatmentTB === 'true' && this.TBScreening.startTreatmentDate === '') {
                this.displayAlert('error', 'Deve Preencher a Data de inicio de Tratamento uma vez que esta em Tratamento TB.')
            } else if ((this.TBScreening.startTreatmentDate) && new Date(this.TBScreening.startTreatmentDate) > new Date()) {
                this.displayAlert('error', 'A Data de inicio de Tratamento indicada é maior que a data da corrente.')
            } else if (this.patient.gender === 'Masculino') {
              this.$refs.stepper.goTo(4)
            } else {
              this.$refs.stepper.next()
            }
          } else if (this.screeningStep === 3) {
             if (this.pregnancyScreening.pregnant === 'false' && this.pregnancyScreening.lastMenstruation === '') {
                this.displayAlert('error', 'Deve Preencher a Data da Ultima Menstruação.')
            } else if ((this.pregnancyScreening.lastMenstruation) && new Date(this.pregnancyScreening.lastMenstruation) > new Date()) {
                this.displayAlert('error', 'A Data da Ultima Menstruação indicada é maior que a data da corrente.')
            } else {
              this.$refs.stepper.next()
            }
          } else if (this.screeningStep === 4) {
            if ((this.adherenceScreening.hasPatientCameCorrectDate === 'false' && this.adherenceScreening.daysWithoutMedicine === '') ||
             (this.adherenceScreening.hasPatientCameCorrectDate === 'false' && this.adherenceScreening.daysWithoutMedicine <= 0)) {
               this.displayAlert('error', 'Por Favor Indique quantos dias de atraso completou o paciente')
          } else if ((this.adherenceScreening.patientForgotMedicine === 'true' && this.adherenceScreening.lateDays === '') ||
             (this.adherenceScreening.patientForgotMedicine === 'true' && this.adherenceScreening.lateDays <= 0)) {
               this.displayAlert('error', 'Por Favor Indique quantos dias passou da hora sem tomar os Medicamentos')
          } else {
             this.$refs.stepper.next()
          }
          } else if (this.screeningStep === 5) {
             if (this.rAMScreening.adverseReactionMedicine === 'true' && this.rAMScreening.adverseReaction === '') {
                this.displayAlert('error', 'Por Favor Indique as reações adversas')
             } else {
              if (this.mobile) {
                this.patientVisit.clinic = this.currClinic
                this.patientVisit.patient = this.patient
                this.patientVisit.visitDate = this.getJSDateFromDDMMYYY(this.visitDate)

                PatientVisitDetails.localDbGetAll().then(pvds => {
                  pvds.forEach((p) => {
                    if (p.patientVisit.patient_id === this.patient.id && new Date(this.patientVisit.visitDate) === new Date(p.patientVisit.visitDate)) {
                      this.patientVisit.id = p.patientVisit.id
                    }
                  })
                })

                this.vitalSigns.patient_visit_id = this.patientVisit.id
                this.TBScreening.patient_visit_id = this.patientVisit.id
                this.pregnancyScreening.patient_visit_id = this.patientVisit.id
                this.adherenceScreening.patient_visit_id = this.patientVisit.id
                this.rAMScreening.patient_visit_id = this.patientVisit.id

                this.vitalSigns.syncStatus = this.isCreateStep ? 'R' : 'U'
                this.TBScreening.syncStatus = this.isCreateStep ? 'R' : 'U'
                this.pregnancyScreening.syncStatus = this.isCreateStep ? 'R' : 'U'
                this.adherenceScreening.syncStatus = this.isCreateStep ? 'R' : 'U'
                this.rAMScreening.syncStatus = this.isCreateStep ? 'R' : 'U'

                this.patientVisit.syncStatus = this.isCreateStep ? 'R' : 'U'

                this.patientVisit.vitalSigns.push(this.vitalSigns)
                this.patientVisit.tbScreening.push(this.TBScreening)
                this.patientVisit.pregnancyScreening.push(this.pregnancyScreening)
                this.patientVisit.adherenceScreening.push(this.adherenceScreening)
                this.patientVisit.ramScreening.push(this.rAMScreening)

                this.patientVisit.clinic_id = this.currClinic.id
                this.patientVisit.patient_id = this.patient.id
                this.patientVisit.patient.identifiers = []

                const targetCopy = new PatientVisit(JSON.parse(JSON.stringify(this.patientVisit)))

                if (this.isCreateStep) {
                  await PatientVisit.localDbAdd(targetCopy).then(res => {
                    PatientVisit.insert({ data: targetCopy })
                    this.displayAlert('info', 'Atenção Farmaceutica efectuada com sucesso.')
                  })
                } else {
                  await PatientVisit.localDbUpdate(targetCopy).then(res => {
                    PatientVisit.update({ data: targetCopy })
                    this.displayAlert('info', 'Atenção Farmaceutica efectuada com sucesso.')
                  })
                }
              } else {
                this.patientVisit.clinic = this.currClinic
                this.patientVisit.patient = this.patient
                this.patientVisit.visitDate = this.getJSDateFromDDMMYYY(this.visitDate)
                this.patientVisit.vitalSigns.push(this.vitalSigns)
                this.patientVisit.tbScreening.push(this.TBScreening)
                this.patientVisit.pregnancyScreening.push(this.pregnancyScreening)
                this.patientVisit.adherenceScreening.push(this.adherenceScreening)
                this.patientVisit.ramScreening.push(this.rAMScreening)
                await PatientVisit.apiSave(this.patientVisit).then(resp => {
                  PatientVisit.apiFetchById(resp.response.data.id)
                this.displayAlert('info', 'Atenção Farmaceutica efectuada com sucesso.')
                }).catch(error => {
                  this.displayAlert('error', error)
                })
              }
             }
          }
          },
       getImcValue () {
        if (this.vitalSigns.height !== 0.0 && this.vitalSigns.weight !== 0) {
          this.vitalSigns.imc = this.vitalSigns.weight / ((this.vitalSigns.height) * (this.vitalSigns.height))
          // this.getImcDescription()
        }
        },
         verifyHasSameDay () {
         const visits = PatientVisit.query().with('patient.*')
                          .with('vitalSigns')
                          .with('tbScreening')
                          .with('pregnancyScreening')
                          .with('adherenceScreening')
                          .with('ramScreening')
                          .with('patientVisitDetails')
                          .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                          .where('patient_id', this.patient.id).has('clinic').has('vitalSigns').get()

                      for (const visit of visits) {
                   if (new Date(visit.visitDate).getTime() === this.getJSDateFromDDMMYYY(this.visitDate).getTime() && visit.vitalSigns.length > 0) {
                               this.hasVisitSameDay = true
                               break
                          } else if (new Date(visit.visitDate).getTime() === this.getJSDateFromDDMMYYY(this.visitDate).getTime() && visit.vitalSigns.length === 0) {
                                 this.patientVisit = visit
                               this.hasVisitSameDay = false
                          } else {
                           this.hasVisitSameDay = false
                          }
                       }
         }
    },
    components: {
       TextInput: require('components/Shared/Input/TextField.vue').default,
       numberField: require('components/Shared/Input/NumberField.vue').default,
       tbTable: require('components/Patient/PharmaceuticalAtention/TbQuestionsTable.vue').default,
       pregnancyTable: require('components/Patient/PharmaceuticalAtention/PregnancyQuestionsTable.vue').default,
        adherenceTable: require('components/Patient/PharmaceuticalAtention/MonitoringReinforcementAdherinTable.vue').default,
        ramTable: require('components/Patient/PharmaceuticalAtention/AdverseReactionQuestiosTable.vue').default,
           Dialog: require('components/Shared/Dialog/Dialog.vue').default
    }
}
</script>

<style>

</style>
