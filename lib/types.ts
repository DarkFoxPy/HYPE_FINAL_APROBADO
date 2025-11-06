export interface User {
  id: string
  email: string
  name: string
  username: string
  roles: string[] // <-- CAMBIADO DE 'role' a 'roles'
  avatar?: string
  bio?: string
  phone?: string
  socialLinks?: {
    twitter?: string
    twitterUrl?: string
    linkedin?: string
    linkedinUrl?: string
    instagram?: string
    instagramUrl?: string
    facebook?: string
    facebookUrl?: string
  }
  // Coordinator-specific fields
  companyName?: string
  ruc?: string
  businessSector?: string
  eventsCreated: string[]
  eventsAttended: string[]
  createdAt: Date
}

// 3D Map Types
export interface Marker3D {
  id: string
  type: "entrance" | "exit" | "stage" | "booth" | "bathroom" | "food" | "info"
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  name: string
  description?: string
  capacity?: number
  color: string
  icon: string
}

export interface Map3DConfig {
  id: string
  floorPlan?: string
  markers: Marker3D[]
  lighting: {
    ambient: number
    directional: number
  }
  viewAngles: {
    name: string
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }[]
  spaceType: "room" | "auditorium" | "gallery" | "outdoor"
}

export interface Event {
  id: string
  slug: string // URL-friendly name for routing
  title: string
  description: string
  startDate: Date
  endDate: Date
  durationDays?: number // Calculated from start and end dates
  location: string
  eventType: "presencial" | "virtual" | "no_definido"
  eventLink?: string // Google Maps for presencial, Meet/Zoom for virtual
  category: string
  capacity: number
  unlimitedCapacity: boolean
  registrations: number
  isPublic: boolean
  requiresApproval: boolean
  organizerId: string
  map3DConfig: Map3DConfig
  mapJsonFile?: string // URL to uploaded map JSON file

  coverImage?: string
  galleryImages?: string[]
  videos?: string[]

  schedule?: ScheduleItem[]
  scheduleJsonFile?: string // URL to uploaded schedule JSON

  hasCustomForm: boolean
  customFormFields?: FormField[]

  aboutEvent?: string

  visitCount: number

  status: "draft" | "published" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleItem {
  id: string
  day: number // Day number (1, 2, 3, etc.)
  time: string
  title: string
  description?: string
  location?: string
  speaker?: string
}

export interface FormField {
  id: string
  type: "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "date"
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio, checkbox
}

export interface Registration {
  id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  phone?: string
  status: "pending" | "approved" | "rejected"
  timeSlot?: string
  customAnswers?: Record<string, string>
  registeredAt: Date
  qrCode?: string // Unique QR code for event check-in
}

export interface FormResponse {
  id: string
  eventId: string
  participantName: string
  participantEmail: string
  participantPhone?: string
  responseData: Record<string, any>
  submittedAt: Date
}

export interface EventVisit {
  id: string
  eventId: string
  visitorIp?: string
  visitorUserAgent?: string
  userId?: string
  visitedAt: Date
}
