import { Boxes, FlaskConical, School } from 'lucide-react'

export const RESOURCE_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'LECTURE_HALL', label: 'Lecture Halls' },
  { value: 'LAB', label: 'Labs' },
  { value: 'EQUIPMENT', label: 'Equipment' },
]

export const RESOURCE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
]

export const RESOURCE_TYPE_META = {
  LECTURE_HALL: {
    label: 'Lecture Hall',
    description: 'Teaching and presentation space',
    Icon: School,
    accent: 'from-sky-400 to-cyan-300',
  },
  LAB: {
    label: 'Lab',
    description: 'Practical and technical workspace',
    Icon: FlaskConical,
    accent: 'from-violet-400 to-fuchsia-300',
  },
  EQUIPMENT: {
    label: 'Equipment',
    description: 'Shared campus asset',
    Icon: Boxes,
    accent: 'from-amber-400 to-orange-300',
  },
}

export const DEFAULT_RESOURCE_FORM = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  status: 'ACTIVE',
  description: '',
}

export function getTypeMeta(type) {
  return RESOURCE_TYPE_META[type] ?? {
    label: type || 'Resource',
    description: 'Campus asset',
    Icon: School,
    accent: 'from-slate-400 to-slate-300',
  }
}

// Export as object for easier destructuring
export const facilityOptions = {
  RESOURCE_TYPE_OPTIONS,
  RESOURCE_STATUS_OPTIONS,
  RESOURCE_TYPE_META,
  DEFAULT_RESOURCE_FORM,
  getTypeMeta,
}
