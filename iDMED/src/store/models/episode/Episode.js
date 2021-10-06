import { Model } from '@vuex-orm/core'
import ClinicSector from '../clinicSector/ClinicSector'
import EpisodeType from '../episodeType/EpisodeType'
import PatientProgramIdentifier from '../patientServiceIdentifier/PatientServiceIdentifier'
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails'
import StartStopReason from '../startStopReason/StartStopReason'

export default class Episode extends Model {
  static entity = 'episodes'

  static fields () {
    return {
      id: this.attr(null),
      startDate: this.attr(''),
      stopDate: this.attr(''),
      notes: this.attr(''),
      episodeType_id: this.attr(''),
      clinicSector_id: this.attr(''),
      patientServiceIdentifier_id: this.attr(''),
      // Relationships
      startStopReasons: this.hasOne(StartStopReason, 'episode_id'),
      episodeType: this.belongsTo(EpisodeType, 'episodeType_id'),
      clinicSector: this.belongsTo(ClinicSector, 'clinicSector_id'),
      patientServiceIdentifier: this.belongsTo(PatientProgramIdentifier, 'patientServiceIdentifier_id'),
      patientVisitDetails: this.hasMany(PatientVisitDetails, 'episode_id')
    }
  }

  closed () {
    return this.stopDate !== ''
  }

  lastVisit () {
    let lastVisit = ''
    Object.keys(this.patientVisitDetails).forEach(function (k) {
      const id = this.patientVisitDetails[k]
      if (lastVisit === '') {
        lastVisit = id
      } else if (lastVisit.id !== '') {
        if (new Date(lastVisit.patientVisit.visitDate) < new Date(id.patientVisit.visitDate)) {
          lastVisit = id
        }
      }
    }.bind(this))
    return lastVisit
  }
}
