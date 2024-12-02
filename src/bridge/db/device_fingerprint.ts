import { v4 as uuidv4 } from 'uuid'
import { dbBase } from 'src/controller'

export class DeviceFingerprint {
  static initialize = async () => {
    if ((await dbBase.deviceFingerPrint.toArray()).length > 0) return
    await dbBase.deviceFingerPrint.add({ fingerPrint: uuidv4() })
  }
}
