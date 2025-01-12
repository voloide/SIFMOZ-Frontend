import moment from 'moment'
import { date, LocalStorage, SessionStorage, QSpinnerBall, useQuasar } from 'quasar'
import Clinic from 'src/store/models/clinic/Clinic'
import Patient from 'src/store/models/patient/Patient'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import TherapeuticRegimen from 'src/store/models/therapeuticRegimen/TherapeuticRegimen'
import TherapeuticLine from 'src/store/models/therapeuticLine/TherapeuticLine'
import Doctor from 'src/store/models/doctor/Doctor'
import Duration from 'src/store/models/Duration/Duration'
import DispenseType from 'src/store/models/dispenseType/DispenseType'
import Drug from 'src/store/models/drug/Drug'
import DispenseMode from 'src/store/models/dispenseMode/DispenseMode'
import ClinicalServiceAttributeType from 'src/store/models/ClinicalServiceAttributeType/ClinicalServiceAttributeType'
import ClinicalServiceAttribute from 'src/store/models/ClinicalServiceAttribute/ClinicalServiceAttribute'
import ClinicalService from 'src/store/models/ClinicalService/ClinicalService'
import EpisodeType from 'src/store/models/episodeType/EpisodeType'
import IdentifierType from 'src/store/models/identifierType/IdentifierType'
import StartStopReason from 'src/store/models/startStopReason/StartStopReason'
import ClinicSectorType from 'src/store/models/clinicSectorType/ClinicSectorType'
import ClinicSector from 'src/store/models/clinicSector/ClinicSector'
import Stock from 'src/store/models/stock/Stock'
import GroupType from 'src/store/models/groupType/GroupType'
import Form from 'src/store/models/form/Form'
import InteroperabilityAttribute from 'src/store/models/interoperabilityAttribute/InteroperabilityAttribute'
import InteroperabilityType from 'src/store/models/interoperabilityType/InteroperabilityType'
import StockCenter from 'src/store/models/stockcenter/StockCenter'
import { InventoryStockAdjustment } from 'src/store/models/stockadjustment/InventoryStockAdjustment'
import StockOperationType from 'src/store/models/stockoperation/StockOperationType'
import ReferedStockMoviment from 'src/store/models/stockrefered/ReferedStockMoviment'
import DestroyedStock from 'src/store/models/stockdestruction/DestroyedStock'
import FacilityType from 'src/store/models/facilityType/FacilityType'
import PatientTransReferenceType from 'src/store/models/tansreference/PatientTransReferenceType'
import SpetialPrescriptionMotive from 'src/store/models/prescription/SpetialPrescriptionMotive'
import ProvincialServer from 'src/store/models/provincialServer/ProvincialServer'
import HealthInformationSystem from 'src/store/models/healthInformationSystem/HealthInformationSystem'

export default {
  data () {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      step: '',
      initialized: false,
      $q: useQuasar()
    }
  },
 methods: {
  showloading () {
     this.$q.loading.show({
        spinner: QSpinnerBall,
        spinnerColor: 'gray',
        spinnerSize: 140,
        message: 'Carregando, aguarde por favor...',
        messageColor: 'white'
      })
  },
  hideLoading () {
    this.$q.loading.hide()
  },
  getJSDateFromDDMMYYY (dateString) {
    const dateParts = dateString.split('-')
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
  },
  getDDMMYYYFromJSDate (jsDate) {
    return moment(jsDate).format('DD-MM-YYYY')
  },
  displayAlert (type, msg) {
    this.alert.type = type
    this.alert.msg = msg
    this.alert.visible = true
  },
  closeDialog () {
    this.alert.visible = false
    if (this.alert.type === 'info') {
      this.$emit('close')
    }
  },
  stringContains (stringToCheck, stringText) {
      if (stringText === '') return false
      return stringToCheck.toLowerCase().includes(stringText.toLowerCase())
  },
  formatDate (dateString) {
    return date.formatDate(dateString, 'DD-MM-YYYY')
  },
  async loadParamsToVueX () {
    TherapeuticRegimen.localDbGetAll().then(regimens => {
      regimens.forEach((regimen) => {
        TherapeuticRegimen.insert({ data: regimen })
      })
    })
    Stock.localDbGetAll().then(stocks => {
      Stock.insert({ data: stocks })
    })
    TherapeuticLine.localDbGetAll().then(regimens => {
      TherapeuticLine.insert({ data: regimens })
    })
    Doctor.localDbGetAll().then(regimens => {
      Doctor.insert({ data: regimens })
    })
    Duration.localDbGetAll().then(regimens => {
      Duration.insert({ data: regimens })
    })
    DispenseType.localDbGetAll().then(regimens => {
      DispenseType.insert({ data: regimens })
    })
    DispenseMode.localDbGetAll().then(regimens => {
      DispenseMode.insert({ data: regimens })
    })
    ClinicalServiceAttributeType.localDbGetAll().then(regimens => {
      ClinicalServiceAttributeType.insert({ data: regimens })
    })
    ClinicalServiceAttribute.localDbGetAll().then(regimens => {
      ClinicalServiceAttribute.insert({ data: regimens })
    })
    ClinicSectorType.localDbGetAll().then(clinicSectorTypes => {
      ClinicSectorType.insert({ data: clinicSectorTypes })
  })
    ClinicalService.localDbGetAll().then(services => {
      ClinicalService.insert({ data: services })
    })
    await EpisodeType.localDbGetAll().then(episodeTypes => {
      EpisodeType.insert({ data: episodeTypes })
    })
    await StartStopReason.localDbGetAll().then(startStopReasons => {
      StartStopReason.insert({ data: startStopReasons })
    })
    /*
    await ClinicSector.localDbGetAll().then(sectors => {
      sectors.forEach((sector) => {
        sector.clinic.district.id = ''
        sector.clinic.province.id = ''
        ClinicSector.insert({ data: sector })
      })
    })
    */
    await ClinicSectorType.localDbGetAll().then(setorTypes => {
      ClinicSectorType.insert({ data: setorTypes })
    })
    Drug.localDbGetAll().then(drugs => {
      drugs.forEach((drug) => {
        Drug.insert({ data: drug })
      })
    })
    await IdentifierType.localDbGetAll().then(idTypes => {
      IdentifierType.insert({ data: idTypes })
    })

    this.hideLoading()
  },
  idadeCalculator (birthDate) {
    if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
       const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD')
       const todayDate = moment(new Date())
       const idade = todayDate.diff(utentBirthDate, 'years')
       console.log(idade)
      return idade
    }
  },
  setStep (value) {
    this.step = value
  },
  changeToEditStep () {
    this.step = 'edit'
  },
  changeToCreateStep () {
    this.step = 'create'
  },
  changeToCloseStep () {
    this.step = 'close'
  },
  changeToRemotionStep () {
    this.step = 'delete'
  },
  changeToDisplayStep () {
    this.step = 'display'
  },
  changeToReOpenStep () {
    this.step = 'reOpen'
  },
  setAsInitialized () {
    this.initialized = true
  },
  setAsInitializing () {
    this.initialized = false
  },
  async loadWebParamsToVueX () {
    const offset = 0
    const max = 100
 //   this.doClinicGet(0, 100)

    await Duration.apiGetAll(offset, max)
    await ClinicalServiceAttributeType.apiGetAll(offset, max)
    await ClinicalService.apiGetAll(offset, max).then(resp => {
      console.log(resp.response.data)
  })
    await ClinicSector.apiGetAll(offset, max).then(resp => {
      console.log(resp.response.data)
  })
    await IdentifierType.apiGetAll(offset, max)
    await EpisodeType.apiGetAll(offset, max)
    await FacilityType.apiGetAll(offset, max)
    await StartStopReason.apiGetAll(offset, max)
    await ClinicalServiceAttribute.apiGetAll(offset, max)
    await Drug.apiGetAll(offset, max)
    await TherapeuticRegimen.apiGetAll(offset, max)
    await TherapeuticLine.apiGetAll(offset, max)
    await Form.apiGetAll(offset, max)
    await DispenseType.apiGetAll(offset, max)
    await InteroperabilityType.apiGetAll(offset, max)
    await InteroperabilityAttribute.apiGetAll(offset, max)
    await HealthInformationSystem.apiGetAll(offset, max)
    await StockCenter.apiGetAll(offset, max)
    await Stock.apiGetAll(offset, max)
    await InventoryStockAdjustment.apiGetAll(offset, max)
    await StockOperationType.apiGetAll(offset, max)
    await ReferedStockMoviment.apiGetAll(offset, max)
    await DestroyedStock.apiGetAll(offset, max)
    await FacilityType.apiGetAll(offset, max)
    await ClinicSectorType.apiGetAll(offset, max)
    await PatientTransReferenceType.apiGetAll(offset, max)
    await SpetialPrescriptionMotive.apiGetAll(offset, max)
    await ProvincialServer.apiGetAll()
    await Doctor.apiGetAll()
    await DispenseMode.apiGetAll()
    await GroupType.apiGetAll()
    this.hideLoading()
  }
 },
  computed: {
    isInitialized () {
      return this.initialized
    },
    isAppSyncDone () {
      return LocalStorage.getItem('system-sync-status') === 'done'
    },
    selectedPatient () {
      return new Patient(SessionStorage.getItem('selectedPatient'))
    },
    currClinic () {
      console.log('Clinica:' + SessionStorage.getItem('currClinic'))
      const clinic = Clinic.query()
                                .with('province')
                                .with('facilityType')
                                .with('district.province')
                                .where('mainClinic', true)
                                .first()
       console.log('Clinica22:' + clinic)
          if (clinic !== null) return clinic
          return new Clinic(SessionStorage.getItem('currClinic'))
    },
    getUUID () {
      return uuidv4()
    },
    isEditStep () {
      return this.step === 'edit'
    },
    isCreateStep () {
      return this.step === 'create'
    },
    isCloseStep () {
      return this.step === 'close'
    },
    isRemotionStep () {
      return this.step === 'delete'
    },
    isDisplayStep () {
      return this.step === 'display'
    },
    isReOpenStep () {
      return this.step === 'reOpen'
    },
    inEdition () {
      return this.isEditStep || this.isCreateStep
    }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default
  }
}
