import { Model } from '@vuex-orm/core'
import ClinicalService from '../ClinicalService/ClinicalService'
import Drug from '../drug/Drug'
import PrescriptionDetail from '../prescriptionDetails/PrescriptionDetail'

export default class TherapeuticRegimen extends Model {
  static entity = 'therapeuticRegimens'

  static fields () {
    return {
      id: this.attr(null),
      regimenScheme: this.attr(''),
      active: this.attr(''),
      code: this.attr(''),
     // pedhiatric: this.attr(''),
      description: this.attr(''),
      clinical_service_id: this.attr(''),

      // Relationships
      prescriptionDetails: this.hasMany(PrescriptionDetail, 'therapeutic_regimen_id'),
      drugs: this.hasMany(Drug, 'drug_id'),
      clinicalService: this.belongsTo(ClinicalService, 'clinical_service_id')
    }
  }

  static async apiGetAll () {
    return await this.api().get('/therapeuticRegimen')
  }

  static async apiFetchById (id) {
    return await this.api().get(`/therapeuticRegimen/${id}`)
  }
}
