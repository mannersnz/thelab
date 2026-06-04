import { getAvailability } from './data'
import TrainingRoomClient from './TrainingRoomClient'

export default async function TrainingRoomPage() {
  const from = new Date()
  const to = new Date()
  to.setDate(to.getDate() + 90)

  let availability = {}
  try {
    availability = await getAvailability(from, to)
  } catch (e) {
    console.error('Failed to load availability:', e)
  }

  return <TrainingRoomClient availability={availability} />
}
