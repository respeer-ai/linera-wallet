import { dbWallet } from 'src/controller'
import { db } from 'src/model'
import { MicrochainOwner } from './microchain_owner'

export class Activity {
  static addressActivities = async (
    publicKey: string
  ): Promise<db.Activity[]> => {
    const acts = [] as db.Activity[]
    acts.push(
      ...(await dbWallet.activities
        .where('targetAddress')
        .equalsIgnoreCase(publicKey)
        .toArray())
    )
    acts.push(
      ...(await dbWallet.activities
        .where('sourceAddress')
        .equalsIgnoreCase(publicKey)
        .toArray())
    )
    return acts
  }

  static ownerActivities = async (
    offset: number,
    limit: number,
    owner: db.Owner
  ): Promise<db.Activity[]> => {
    const microchainOwners =
      (await MicrochainOwner.ownerMicrochainOwners(owner.owner)) ||
      ([] as db.MicrochainOwner[])
    if (!microchainOwners) return []
    const microchains =
      microchainOwners.reduce(
        (ids: string[], a: db.MicrochainOwner): string[] => {
          ids.push(a.microchain)
          return ids
        },
        []
      ) || ([] as string[])
    if (!microchains) return []
    return await dbWallet.activities
      .where('targetChain')
      .anyOf(microchains)
      .or('sourceChain')
      .anyOf(microchains)
      .offset(offset)
      .limit(limit)
      .toArray()
  }

  static count = async () => {
    return await dbWallet.activities.count()
  }

  static create = async (
    microchain: string,
    tokenId: number,
    sourceChain: string,
    sourceAddress: string | undefined,
    targetChain: string,
    targetAddress: string | undefined,
    amount: string,
    blockHeight: number,
    timestamp: number,
    certificateHash: string,
    grant: string
  ): Promise<db.Activity> => {
    const activities = (await dbWallet.activities.toArray()).filter(
      (activity) => {
        return (
          activity.sourceChain === sourceChain &&
          activity.sourceAddress === sourceAddress &&
          activity.targetChain === targetChain &&
          activity.targetAddress === targetAddress &&
          activity.timestamp === timestamp &&
          activity.blockHeight === blockHeight &&
          activity.certificateHash === certificateHash
        )
      }
    )
    if (activities.length) return activities[0]

    const activity = {
      microchain,
      tokenId,
      sourceChain,
      sourceAddress,
      targetChain,
      targetAddress,
      amount,
      blockHeight,
      timestamp,
      certificateHash,
      grant
    } as db.Activity
    await dbWallet.activities.add(activity)

    return activity
  }
}
