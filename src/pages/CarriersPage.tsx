import CarriersManager from '../components/CarriersManager'
import { seedCarrierList } from '../data/shipping'

export default function CarriersPage() {
  return <CarriersManager initialRows={seedCarrierList} />
}
