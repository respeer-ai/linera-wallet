import { dbBase } from 'src/controller'
import { dbModel } from 'src/model'

export class Network {
  static initialize = async () => {
    if (await Network.selected()) return
    await dbBase.networks.add(dbModel.defaultNetwork)
  }

  static resetSelected = async () => {
    const networks = await dbBase.networks
      .filter((network) => network.selected)
      .toArray()
    for (const network of networks) {
      await dbBase.networks.update(network.id, { selected: false })
    }
  }

  static create = async (network: dbModel.Network) => {
    if (await Network.exists(network.name))
      return Promise.reject('Already exists')
    if (network.selected) await Network.resetSelected()
    await dbBase.networks.add(network)
  }

  static update = async (network: dbModel.Network) => {
    if (
      (await Network.exists(network.name)) &&
      !(await Network.exists(network.name, network.id))
    )
      return Promise.reject('Already exists')
    if (network.selected) await Network.resetSelected()
    await dbBase.networks.update(network.id, network)
  }

  static delete = async (id: number) => {
    await dbBase.networks.delete(id)
  }

  static selected = async () => {
    return (await dbBase.networks.toArray()).find((el) => el.selected)
  }

  static exists = async (name: string, id?: number) => {
    return (
      (await dbBase.networks
        .where('name')
        .equals(name)
        .and((network) => id === undefined || network.id === id)
        .count()) > 0
    )
  }
}
