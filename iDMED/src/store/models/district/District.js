import { Model } from '@vuex-orm/core'
import Province from 'src/store/models/province/Province'
import Localidade from '../Localidade/Localidade'
import PostoAdministrativo from '../PostoAdministrativo/PostoAdministrativo'
import db from 'src/store/localbase'
import { v4 as uuidv4 } from 'uuid'

export default class District extends Model {
  static entity = 'districts'

  static fields () {
    return {
      id: this.uid(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      province_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      province: this.belongsTo(Province, 'province_id'),
      postosAdministrativos: this.hasMany(PostoAdministrativo, 'district_id'),
      localidades: this.hasMany(Localidade, 'district_id')
    }
  }

  static async apiGetAll (offset, max) {
    return await this.api().get('/district')
  }

  static localDbAdd (district) {
    return db.newDb().collection('districts').add(district)
  }

  static localDbGetById (id) {
    return db.newDb().collection('districts').doc({ id: id }).get()
  }

  static localDbGetAll () {
    return db.newDb().collection('districts').get()
  }

  static localDbUpdate (district) {
    return db.newDb().collection('districts').doc({ id: district.id }).set(district)
  }

  static localDbUpdateAll (districts) {
    return db.newDb().collection('districts').set(districts)
  }

  static localDbDelete (district) {
    return db.newDb().collection('districts').doc({ id: district.id }).delete()
  }

  static localDbDeleteAll () {
    return db.newDb().collection('districts').delete()
  }
}
