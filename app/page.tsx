"use client"

import { useEffect, useState, useRef } from "react"
import * as THREE from "three"
import {
  Sparkles,
  Zap,
  Globe,
  Users,
  Calendar,
  ArrowRight,
  Play,
  CheckCircle2,
  Menu,
  X,
  Rocket,
  Star,
} from "lucide-react"
import Link from "next/link"

// ============================================================================
// CONSTANTES PARA EL MAPA 3D
// ============================================================================

const MARKER_COLORS: Record<string, string> = {
  entrance: "#10b981",
  exit: "#ef4444",
  emergency_exit: "#f97316",
  stage: "#9333ea",
  backstage: "#7c3aed",
  booth: "#06b6d4",
  sponsor_booth: "#0ea5e9",
  info_booth: "#3b82f6",
  merchandise: "#8b5cf6",
  photo_booth: "#ec4899",
  food: "#f59e0b",
  bar: "#f97316",
  kitchen: "#ea580c",
  bathroom: "#8b5cf6",
  accessible_bathroom: "#a855f7",
  cloakroom: "#c026d3",
  atm: "#14b8a6",
  charging_station: "#eab308",
  security: "#dc2626",
  medical: "#ef4444",
  info: "#3b82f6",
  seating: "#6366f1",
  standing_area: "#8b5cf6",
  vip_seating: "#f59e0b",
  vip_area: "#eab308",
  press_area: "#06b6d4",
  parking: "#64748b",
  registration: "#10b981",
  stairs: "#71717a",
  elevator: "#78716c",
  escalator: "#737373",
  ramp: "#84cc16",
}

// ============================================================================
// FUNCIÓN PARA OBTENER GEOMETRÍAS DE MARCADORES
// ============================================================================

const getMarkerGeometry = (type: string, color: string): THREE.Group => {
  switch (type) {
    case "entrance":
      return createDoor(color, true)
    case "exit":
    case "emergency_exit":
      return createDoor(color, false)
    case "stage":
      return createStage(color)
    case "bar":
      return createBar(color)
    //case "food":
      //return createFoodStall(color)
    case "bathroom":
      return createBathroom(color, false)
    case "accessible_bathroom":
      return createBathroom(color, true)
    case "seating":
      return createSeatingArea(color, false)
    case "vip_seating":
      return createSeatingArea(color, true)
    //case "vip_area":
      //return createVIPArea(color)
    //case "info":
      //return createInfoBooth(color)
    case "booth":
    case "sponsor_booth":
    case "info_booth":
      return createBoothTable(color)
    case "parking":
      const parkingGroup = new THREE.Group()
      const car1 = createCar("#0066cc")
      car1.position.set(-1.5, 0, 0)
      parkingGroup.add(car1)
      const car2 = createCar("#ff0000")
      car2.position.set(1.5, 0, 0)
      parkingGroup.add(car2)
      return parkingGroup
    case "medical":
      return createMedicalStation(color)
    case "security":
      return createSecurityPost(color)
    case "charging_station":
      return createChargingStation(color)
    case "atm":
      return createATM(color)
    case "elevator":
      return createElevator(color)
    case "stairs":
      return createStairs(color)
    default:
      const defaultGroup = new THREE.Group()
      const defaultGeometry = new THREE.BoxGeometry(1, 1, 1)
      const defaultMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial)
      defaultMesh.position.y = 0.5
      defaultGroup.add(defaultMesh)
      return defaultGroup
  }
}
// ============================================================================
// FUNCIONES PARA CREAR OBJETOS 3D REALISTAS
// ============================================================================

function createCar(color: string): THREE.Group {
  const car = new THREE.Group()

  // Carrocería principal
  const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2 })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 0.4
  car.add(body)

  // Cabina
  const cabinGeometry = new THREE.BoxGeometry(1.6, 0.5, 2)
  const cabinMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2 })
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
  cabin.position.y = 0.95
  cabin.position.z = -0.3
  car.add(cabin)

  // Ventanas
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  })
  const windowGeometry = new THREE.BoxGeometry(1.5, 0.4, 1.8)
  const windows = new THREE.Mesh(windowGeometry, windowMaterial)
  windows.position.y = 0.95
  windows.position.z = -0.3
  car.add(windows)

  // Ruedas
  const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16)
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })

  const wheelPositions = [
    { x: -0.9, z: 1.2 },
    { x: 0.9, z: 1.2 },
    { x: -0.9, z: -1.2 },
    { x: 0.9, z: -1.2 },
  ]

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.rotation.z = Math.PI / 2
    wheel.position.set(pos.x, 0.3, pos.z)
    car.add(wheel)
  })

  return car
}

function createDoor(color: string, isOpen = false): THREE.Group {
  const doorGroup = new THREE.Group()

  // Marco de la puerta
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })

  // Postes verticales
  const postGeometry = new THREE.BoxGeometry(0.15, 2.2, 0.15)
  const leftPost = new THREE.Mesh(postGeometry, frameMaterial)
  leftPost.position.set(-0.6, 1.1, 0)
  doorGroup.add(leftPost)

  const rightPost = new THREE.Mesh(postGeometry, frameMaterial)
  rightPost.position.set(0.6, 1.1, 0)
  doorGroup.add(rightPost)

  // Dintel superior
  const lintelGeometry = new THREE.BoxGeometry(1.35, 0.15, 0.15)
  const lintel = new THREE.Mesh(lintelGeometry, frameMaterial)
  lintel.position.set(0, 2.2, 0)
  doorGroup.add(lintel)

  // Puerta
  const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.1)
  const doorMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.3 })
  const door = new THREE.Mesh(doorGeometry, doorMaterial)
  door.position.set(isOpen ? -0.6 : 0, 1, 0)
  if (isOpen) {
    door.rotation.y = Math.PI / 2
  }
  doorGroup.add(door)

  // Manija
  const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8)
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 })
  const handle = new THREE.Mesh(handleGeometry, handleMaterial)
  handle.rotation.z = Math.PI / 2
  handle.position.set(isOpen ? -0.5 : 0.5, 1, 0.1)
  doorGroup.add(handle)

  return doorGroup
}

function createStairs(color: string): THREE.Group {
  const stairsGroup = new THREE.Group()
  const steps = 8
  const stepHeight = 0.2
  const stepDepth = 0.4
  const stepWidth = 2

  const stepMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8 })

  for (let i = 0; i < steps; i++) {
    const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth)
    const step = new THREE.Mesh(stepGeometry, stepMaterial)
    step.position.set(0, i * stepHeight, -i * stepDepth)
    stairsGroup.add(step)
  }

  // Barandas
  const railMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.3 })
  const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, steps * stepHeight, 8)

  const leftRail = new THREE.Mesh(railGeometry, railMaterial)
  leftRail.position.set(-stepWidth / 2, (steps * stepHeight) / 2, (-steps * stepDepth) / 2)
  stairsGroup.add(leftRail)

  const rightRail = new THREE.Mesh(railGeometry, railMaterial)
  rightRail.position.set(stepWidth / 2, (steps * stepHeight) / 2, (-steps * stepDepth) / 2)
  stairsGroup.add(rightRail)

  return stairsGroup
}

function createBoothTable(color: string): THREE.Group {
  const boothGroup = new THREE.Group()

  // Mesa larga
  const tableTopGeometry = new THREE.BoxGeometry(3, 0.1, 1)
  const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 })
  const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial)
  tableTop.position.y = 0.75
  boothGroup.add(tableTop)

  // Patas de la mesa
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.75, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 })

  const legPositions = [
    { x: -1.3, z: -0.4 },
    { x: -1.3, z: 0.4 },
    { x: 1.3, z: -0.4 },
    { x: 1.3, z: 0.4 },
  ]

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(pos.x, 0.375, pos.z)
    boothGroup.add(leg)
  })

  // Sillas (2 detrás de la mesa)
  const chairPositions = [
    { x: -0.8, z: -0.8 },
    { x: 0.8, z: -0.8 },
  ]

  chairPositions.forEach((pos) => {
    const chair = createChair(color)
    chair.position.set(pos.x, 0, pos.z)
    boothGroup.add(chair)
  })

  // Mantel o banner con color del stand
  const bannerGeometry = new THREE.BoxGeometry(3, 0.6, 0.05)
  const bannerMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  const banner = new THREE.Mesh(bannerGeometry, bannerMaterial)
  banner.position.set(0, 0.4, 0.5)
  boothGroup.add(banner)

  return boothGroup
}

function createChair(color: string): THREE.Group {
  const chairGroup = new THREE.Group()

  // Asiento
  const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5)
  const chairMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  const seat = new THREE.Mesh(seatGeometry, chairMaterial)
  seat.position.y = 0.45
  chairGroup.add(seat)

  // Respaldo
  const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1)
  const back = new THREE.Mesh(backGeometry, chairMaterial)
  back.position.set(0, 0.7, -0.2)
  chairGroup.add(back)

  // Patas
  const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })

  const legPositions = [
    { x: -0.2, z: -0.2 },
    { x: -0.2, z: 0.2 },
    { x: 0.2, z: -0.2 },
    { x: 0.2, z: 0.2 },
  ]

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(pos.x, 0.225, pos.z)
    chairGroup.add(leg)
  })

  return chairGroup
}

function createBathroom(color: string, accessible = false): THREE.Group {
  const bathroomGroup = new THREE.Group()

  // Inodoro
  const toiletBase = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 16)
  const toiletMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
  const toilet = new THREE.Mesh(toiletBase, toiletMaterial)
  toilet.position.set(0, 0.2, 0)
  bathroomGroup.add(toilet)

  // Tapa del inodoro
  const lidGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16)
  const lid = new THREE.Mesh(lidGeometry, toiletMaterial)
  lid.position.set(0, 0.45, 0)
  bathroomGroup.add(lid)

  // Tanque
  const tankGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.2)
  const tank = new THREE.Mesh(tankGeometry, toiletMaterial)
  tank.position.set(0, 0.65, -0.25)
  bathroomGroup.add(tank)

  // Lavabo
  const sinkGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.15, 16)
  const sink = new THREE.Mesh(sinkGeometry, toiletMaterial)
  sink.position.set(0.8, 0.8, 0)
  bathroomGroup.add(sink)

  // Pedestal del lavabo
  const pedestalGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 16)
  const pedestal = new THREE.Mesh(pedestalGeometry, toiletMaterial)
  pedestal.position.set(0.8, 0.4, 0)
  bathroomGroup.add(pedestal)

  // Grifo
  const faucetMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.1 })
  const faucetGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8)
  const faucet = new THREE.Mesh(faucetGeometry, faucetMaterial)
  faucet.position.set(0.8, 0.95, 0)
  bathroomGroup.add(faucet)

  // Símbolo de accesibilidad si es necesario
  if (accessible) {
    const signGeometry = new THREE.CircleGeometry(0.3, 32)
    const signMaterial = new THREE.MeshStandardMaterial({ color: 0x0066cc })
    const sign = new THREE.Mesh(signGeometry, signMaterial)
    sign.position.set(0, 1.5, 0.5)
    sign.rotation.y = Math.PI
    bathroomGroup.add(sign)
  }

  return bathroomGroup
}

function createStage(color: string): THREE.Group {
  const stageGroup = new THREE.Group()

  // Plataforma principal
  const platformGeometry = new THREE.BoxGeometry(6, 0.8, 4)
  const platformMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 })
  const platform = new THREE.Mesh(platformGeometry, platformMaterial)
  platform.position.y = 0.4
  stageGroup.add(platform)

  // Escalones de acceso
  const stepGeometry = new THREE.BoxGeometry(1, 0.2, 0.8)
  const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
  const step1 = new THREE.Mesh(stepGeometry, stepMaterial)
  step1.position.set(-2.5, 0.1, 2.5)
  stageGroup.add(step1)

  const step2 = new THREE.Mesh(stepGeometry, stepMaterial)
  step2.position.set(-2.5, 0.3, 2.5)
  stageGroup.add(step2)

  // Cortinas laterales
  const curtainGeometry = new THREE.BoxGeometry(0.2, 3, 1)
  const curtainMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.8 })

  const leftCurtain = new THREE.Mesh(curtainGeometry, curtainMaterial)
  leftCurtain.position.set(-3, 2.3, 0)
  stageGroup.add(leftCurtain)

  const rightCurtain = new THREE.Mesh(curtainGeometry, curtainMaterial)
  rightCurtain.position.set(3, 2.3, 0)
  stageGroup.add(rightCurtain)

  // Luces del escenario
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.5,
  })
  const lightGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8)

  for (let i = -2; i <= 2; i++) {
    const light = new THREE.Mesh(lightGeometry, lightMaterial)
    light.position.set(i * 1.2, 3.5, -1.5)
    light.rotation.x = Math.PI / 4
    stageGroup.add(light)
  }

  // Micrófono
  const micStandGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8)
  const micStandMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 })
  const micStand = new THREE.Mesh(micStandGeometry, micStandMaterial)
  micStand.position.set(0, 1.55, 0)
  stageGroup.add(micStand)

  const micGeometry = new THREE.SphereGeometry(0.08, 16, 16)
  const micMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9 })
  const mic = new THREE.Mesh(micGeometry, micMaterial)
  mic.position.set(0, 2.3, 0)
  stageGroup.add(mic)

  return stageGroup
}

function createBar(color: string): THREE.Group {
  const barGroup = new THREE.Group()

  // Mostrador
  const counterGeometry = new THREE.BoxGeometry(3, 0.1, 1.2)
  const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.3, metalness: 0.4 })
  const counter = new THREE.Mesh(counterGeometry, counterMaterial)
  counter.position.y = 1
  barGroup.add(counter)

  // Base del mostrador
  const baseGeometry = new THREE.BoxGeometry(3, 1, 1)
  const baseMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.set(0, 0.5, 0)
  barGroup.add(base)

  // Estante trasero
  const shelfGeometry = new THREE.BoxGeometry(3, 1.5, 0.3)
  const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.6 })
  const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
  shelf.position.set(0, 1.5, -0.6)
  barGroup.add(shelf)

  // Botellas en el estante
  const bottleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8)
  const bottleColors = [0x00ff00, 0xff6600, 0xffff00, 0x8b4513, 0xff0000]

  for (let i = 0; i < 5; i++) {
    const bottleMaterial = new THREE.MeshStandardMaterial({
      color: bottleColors[i],
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.1,
    })
    const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial)
    bottle.position.set(-1 + i * 0.5, 1.65, -0.55)
    barGroup.add(bottle)
  }

  // Vasos en el mostrador
  const glassGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.15, 8)
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1,
  })

  for (let i = 0; i < 3; i++) {
    const glass = new THREE.Mesh(glassGeometry, glassMaterial)
    glass.position.set(-0.6 + i * 0.6, 1.13, 0.3)
    barGroup.add(glass)
  }

  // Taburetes de bar
  for (let i = 0; i < 3; i++) {
    const stool = createBarStool(color)
    stool.position.set(-1 + i, 0, 0.8)
    barGroup.add(stool)
  }

  return barGroup
}

function createBarStool(color: string): THREE.Group {
  const stoolGroup = new THREE.Group()

  // Asiento
  const seatGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16)
  const seatMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  const seat = new THREE.Mesh(seatGeometry, seatMaterial)
  seat.position.y = 0.7
  stoolGroup.add(seat)

  // Pata central
  const legGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.7, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 })
  const leg = new THREE.Mesh(legGeometry, legMaterial)
  leg.position.y = 0.35
  stoolGroup.add(leg)

  // Base
  const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16)
  const base = new THREE.Mesh(baseGeometry, legMaterial)
  base.position.y = 0.025
  stoolGroup.add(base)

  return stoolGroup
}

function createElevator(color: string): THREE.Group {
  const elevatorGroup = new THREE.Group()

  // Cabina
  const cabinGeometry = new THREE.BoxGeometry(1.5, 2.2, 1.5)
  const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6, roughness: 0.3 })
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
  cabin.position.y = 1.1
  elevatorGroup.add(cabin)

  // Puertas
  const doorGeometry = new THREE.BoxGeometry(0.7, 2, 0.05)
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 })

  const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial)
  leftDoor.position.set(-0.35, 1, 0.76)
  elevatorGroup.add(leftDoor)

  const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial)
  rightDoor.position.set(0.35, 1, 0.76)
  elevatorGroup.add(rightDoor)

  // Panel de botones
  const panelGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.05)
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  const panel = new THREE.Mesh(panelGeometry, panelMaterial)
  panel.position.set(0.6, 1.2, 0.76)
  elevatorGroup.add(panel)

  // Botones
  const buttonGeometry = new THREE.CircleGeometry(0.03, 16)
  const buttonMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.3,
  })

  for (let i = 0; i < 3; i++) {
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
    button.position.set(0.6, 1.4 - i * 0.15, 0.78)
    elevatorGroup.add(button)
  }

  return elevatorGroup
}

function createATM(color: string): THREE.Group {
  const atmGroup = new THREE.Group()

  // Cuerpo principal
  const bodyGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.4)
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 0.75
  atmGroup.add(body)

  // Pantalla
  const screenGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.05)
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x001a33,
    emissive: 0x0066cc,
    emissiveIntensity: 0.3,
  })
  const screen = new THREE.Mesh(screenGeometry, screenMaterial)
  screen.position.set(0, 1.1, 0.21)
  atmGroup.add(screen)

  // Teclado
  const keypadGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.05)
  const keypadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  const keypad = new THREE.Mesh(keypadGeometry, keypadMaterial)
  keypad.position.set(0, 0.6, 0.21)
  atmGroup.add(keypad)

  // Ranura para tarjeta
  const slotGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.05)
  const slotMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const slot = new THREE.Mesh(slotGeometry, slotMaterial)
  slot.position.set(0, 0.3, 0.21)
  atmGroup.add(slot)

  // Dispensador de efectivo
  const dispenserGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.05)
  const dispenser = new THREE.Mesh(dispenserGeometry, slotMaterial)
  dispenser.position.set(0, 0.15, 0.21)
  atmGroup.add(dispenser)

  return atmGroup
}

function createChargingStation(color: string): THREE.Group {
  const stationGroup = new THREE.Group()

  // Poste principal
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16)
  const poleMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 })
  const pole = new THREE.Mesh(poleGeometry, poleMaterial)
  pole.position.y = 0.75
  stationGroup.add(pole)

  // Panel superior
  const panelGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.1)
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  const panel = new THREE.Mesh(panelGeometry, panelMaterial)
  panel.position.set(0, 1.2, 0)
  stationGroup.add(panel)

  // Pantalla
  const displayGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05)
  const displayMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.4,
  })
  const display = new THREE.Mesh(displayGeometry, displayMaterial)
  display.position.set(0, 1.3, 0.06)
  stationGroup.add(display)

  // Cables (4 puertos)
  const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8)
  const cableMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })

  const cablePositions = [
    { x: -0.15, y: 0.9 },
    { x: -0.05, y: 0.9 },
    { x: 0.05, y: 0.9 },
    { x: 0.15, y: 0.9 },
  ]

  cablePositions.forEach((pos) => {
    const cable = new THREE.Mesh(cableGeometry, cableMaterial)
    cable.position.set(pos.x, pos.y, 0.05)
    stationGroup.add(cable)

    // Conector
    const connectorGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.04)
    const connectorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial)
    connector.position.set(pos.x, pos.y - 0.25, 0.05)
    stationGroup.add(connector)
  })

  // Base
  const baseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 16)
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = 0.05
  stationGroup.add(base)

  return stationGroup
}

function createSeatingArea(color: string, isVIP = false): THREE.Group {
  const seatingGroup = new THREE.Group()

  // Crear filas de sillas
  const rows = 3
  const seatsPerRow = 4

  for (let row = 0; row < rows; row++) {
    for (let seat = 0; seat < seatsPerRow; seat++) {
      const chair = createChair(isVIP ? "#ffd700" : color)
      chair.position.set((seat - seatsPerRow / 2) * 0.7, 0, row * 0.8)
      seatingGroup.add(chair)
    }
  }

  // Si es VIP, agregar alfombra roja
  if (isVIP) {
    const carpetGeometry = new THREE.BoxGeometry(seatsPerRow * 0.7 + 0.5, 0.02, rows * 0.8 + 0.5)
    const carpetMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9 })
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial)
    carpet.position.y = 0.01
    carpet.position.z = (rows - 1) * 0.4
    seatingGroup.add(carpet)

    // Postes con cuerda
    const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8)
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })

    const corners = [
      { x: -seatsPerRow * 0.35 - 0.3, z: -0.3 },
      { x: seatsPerRow * 0.35 + 0.3, z: -0.3 },
      { x: -seatsPerRow * 0.35 - 0.3, z: rows * 0.8 + 0.3 },
      { x: seatsPerRow * 0.35 + 0.3, z: rows * 0.8 + 0.3 },
    ]

    corners.forEach((corner) => {
      const post = new THREE.Mesh(postGeometry, postMaterial)
      post.position.set(corner.x, 0.5, corner.z)
      seatingGroup.add(post)
    })
  }

  return seatingGroup
}

function createMedicalStation(color: string): THREE.Group {
  const medicalGroup = new THREE.Group()

  // Mesa de examen
  const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1)
  const tableMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  const table = new THREE.Mesh(tableGeometry, tableMaterial)
  table.position.y = 0.8
  medicalGroup.add(table)

  // Patas de la mesa
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5 })

  const legPositions = [
    { x: -0.9, z: -0.4 },
    { x: -0.9, z: 0.4 },
    { x: 0.9, z: -0.4 },
    { x: 0.9, z: 0.4 },
  ]

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(pos.x, 0.4, pos.z)
    medicalGroup.add(leg)
  })

  // Cruz roja
  const crossMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })

  const crossVertical = new THREE.BoxGeometry(0.2, 0.6, 0.05)
  const crossV = new THREE.Mesh(crossVertical, crossMaterial)
  crossV.position.set(0, 1.5, -0.5)
  medicalGroup.add(crossV)

  const crossHorizontal = new THREE.BoxGeometry(0.6, 0.2, 0.05)
  const crossH = new THREE.Mesh(crossHorizontal, crossMaterial)
  crossH.position.set(0, 1.5, -0.5)
  medicalGroup.add(crossH)

  // Botiquín
  const kitGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.2)
  const kitMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const kit = new THREE.Mesh(kitGeometry, kitMaterial)
  kit.position.set(0.6, 0.95, 0)
  medicalGroup.add(kit)

  // Silla
  const chair = createChair(color)
  chair.position.set(-1, 0, 0.8)
  medicalGroup.add(chair)

  return medicalGroup
}

function createSecurityPost(color: string): THREE.Group {
  const securityGroup = new THREE.Group()

  // Escritorio
  const deskGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8)
  const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 })
  const desk = new THREE.Mesh(deskGeometry, deskMaterial)
  desk.position.y = 0.75
  securityGroup.add(desk)

  // Base del escritorio
  const baseGeometry = new THREE.BoxGeometry(1.5, 0.75, 0.8)
  const base = new THREE.Mesh(baseGeometry, deskMaterial)
  base.position.y = 0.375
  securityGroup.add(base)

  // Monitor
  const monitorGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.05)
  const monitorMaterial = new THREE.MeshStandardMaterial({
    color: 0x001a33,
    emissive: 0x0066cc,
    emissiveIntensity: 0.2,
  })
  const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial)
  monitor.position.set(0, 1.1, 0.38)
  securityGroup.add(monitor)

  // Base del monitor
  const monitorBaseGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.2)
  const monitorBase = new THREE.Mesh(monitorBaseGeometry, deskMaterial)
  monitorBase.position.set(0, 0.9, 0.38)
  securityGroup.add(monitorBase)

  // Silla giratoria
  const chair = createOfficeChair(color)
  chair.position.set(0, 0, -0.8)
  securityGroup.add(chair)

  // Barrera de seguridad
  const barrierGeometry = new THREE.BoxGeometry(2, 0.05, 0.1)
  const barrierMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 })
  const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial)
  barrier.position.set(0, 0.025, 1.5)
  securityGroup.add(barrier)

  return securityGroup
}

function createOfficeChair(color: string): THREE.Group {
  const chairGroup = new THREE.Group()

  // Asiento
  const seatGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6)
  const seatMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  const seat = new THREE.Mesh(seatGeometry, seatMaterial)
  seat.position.y = 0.5
  chairGroup.add(seat)

  // Respaldo
  const backGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1)
  const back = new THREE.Mesh(backGeometry, seatMaterial)
  back.position.set(0, 0.9, -0.25)
  chairGroup.add(back)

  // Base giratoria
  const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16)
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = 0.05
  chairGroup.add(base)

  // Pata central
  const centerGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8)
  const center = new THREE.Mesh(centerGeometry, baseMaterial)
  center.position.y = 0.2
  chairGroup.add(center)

  // Ruedas
  const wheelGeometry = new THREE.SphereGeometry(0.08, 16, 16)
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a })

  const wheelPositions = [
    { x: 0.25, z: 0.25 },
    { x: -0.25, z: 0.25 },
    { x: 0.25, z: -0.25 },
    { x: -0.25, z: -0.25 },
  ]

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.position.set(pos.x, 0.08, pos.z)
    chairGroup.add(wheel)
  })

  return chairGroup
}

// ============================================================================
// COMPONENTE DEL MAPA 3D MEJORADO
// ============================================================================

interface MapPreview3DProps {
  className?: string
}

function MapPreview3D({ className = "" }: MapPreview3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let animationFrameId: number
    let scene: THREE.Scene
    let camera: THREE.PerspectiveCamera
    let renderer: THREE.WebGLRenderer

    try {
      // Inicializar Three.js
      const canvas = canvasRef.current

      // Escena
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a2e)
      scene.fog = new THREE.Fog(0x1a1a2e, 30, 80)

      // Cámara
      camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.set(25, 20, 25)
      camera.lookAt(0, 0, 0)

      // Renderizador
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      })
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Luces
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(15, 25, 15)
      directionalLight.castShadow = true
      directionalLight.shadow.camera.left = -20
      directionalLight.shadow.camera.right = 20
      directionalLight.shadow.camera.top = 20
      directionalLight.shadow.camera.bottom = -20
      directionalLight.shadow.mapSize.width = 1024
      directionalLight.shadow.mapSize.height = 1024
      scene.add(directionalLight)

      // Luces puntuales adicionales
      const pointLight1 = new THREE.PointLight(0xffa500, 0.4, 50)
      pointLight1.position.set(10, 8, 10)
      scene.add(pointLight1)

      const pointLight2 = new THREE.PointLight(0x0066ff, 0.3, 50)
      pointLight2.position.set(-10, 8, -10)
      scene.add(pointLight2)

      // Piso del evento
      const floorGeometry = new THREE.PlaneGeometry(50, 40)
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.8,
        metalness: 0.2,
      })
      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      scene.add(floor)

      // Cuadrícula del piso
      const gridHelper = new THREE.GridHelper(50, 25, 0x444444, 0x222222)
      gridHelper.position.y = 0.01
      scene.add(gridHelper)

      // Marcadores detallados (igual que en landing-map-preview)
      const markers = [
        { 
          type: "stage", 
          position: { x: 0, y: 0, z: 0 }, 
          rotation: { x: 0, y: 0, z: 0 }, 
          color: MARKER_COLORS.stage
        },
        { 
          type: "bar", 
          position: { x: 10, y: 0, z: -8 }, 
          rotation: { x: 0, y: Math.PI/2, z: 0 }, 
          color: MARKER_COLORS.bar
        },
        { 
          type: "food", 
          position: { x: -10, y: 0, z: -8 }, 
          rotation: { x: 0, y: -Math.PI/2, z: 0 }, 
          color: MARKER_COLORS.food
        },
        { 
          type: "seating", 
          position: { x: 0, y: 0, z: 12 }, 
          rotation: { x: 0, y: Math.PI, z: 0 }, 
          color: MARKER_COLORS.seating
        },
        { 
          type: "vip_area", 
          position: { x: -12, y: 0, z: 8 }, 
          rotation: { x: 0, y: Math.PI/4, z: 0 }, 
          color: MARKER_COLORS.vip_area
        },
        { 
          type: "info", 
          position: { x: 12, y: 0, z: 8 }, 
          rotation: { x: 0, y: -Math.PI/4, z: 0 }, 
          color: MARKER_COLORS.info
        },
        { 
          type: "entrance", 
          position: { x: 0, y: 0, z: -15 }, 
          rotation: { x: 0, y: 0, z: 0 }, 
          color: MARKER_COLORS.entrance
        },
        { 
          type: "bathroom", 
          position: { x: -15, y: 0, z: -5 }, 
          rotation: { x: 0, y: Math.PI/2, z: 0 }, 
          color: MARKER_COLORS.bathroom
        },
        { 
          type: "booth", 
          position: { x: 15, y: 0, z: -5 }, 
          rotation: { x: 0, y: -Math.PI/2, z: 0 }, 
          color: MARKER_COLORS.booth
        },
      ]

      // Crear objetos 3D detallados
      markers.forEach(marker => {
        const object3D = getMarkerGeometry(marker.type, marker.color)
        object3D.position.set(marker.position.x, marker.position.y, marker.position.z)
        object3D.rotation.set(marker.rotation.x, marker.rotation.y, marker.rotation.z)
        
        // Habilitar sombras para todos los objetos
        object3D.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        scene.add(object3D)
      })

      // Animación - Rotación orbital suave
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)

        // Rotación de la cámara alrededor del centro
        const time = Date.now() * 0.0003
        const radius = 30
        camera.position.x = Math.cos(time) * radius
        camera.position.z = Math.sin(time) * radius
        camera.position.y = 15 + Math.sin(time * 0.5) * 3
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()
      setIsLoading(false)
    } catch (err) {
      console.error("Error initializing 3D map:", err)
      setError("Failed to load 3D map preview")
      setIsLoading(false)
    }

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 rounded-2xl">
          <div className="text-white text-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#f1c6ff] border-t-transparent rounded-full animate-spin" />
            Cargando mapa 3D...
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 z-10 rounded-2xl">
          <div className="text-white text-lg">{error}</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-2xl"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL DE LA PÁGINA
// ============================================================================

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1732] overflow-hidden">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-[#f1c6ff] border-t-transparent animate-spin" />
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#f1c6ff] opacity-40 blur-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Globe,
      title: "Editor 3D Interactivo",
      desc: "Diseña espacios de eventos en 3D con marcadores interactivos, entradas, salidas, escenarios y más.",
      color: "from-[#f1c6ff] to-[#ffddff]",
    },
    {
      icon: Users,
      title: "Gestión de Invitados",
      desc: "Administra registros, aprueba solicitudes y visualiza estadísticas en tiempo real de tus asistentes.",
      color: "from-[#ffddff] to-[#f1c6ff]",
    },
    {
      icon: Calendar,
      title: "Descubrimiento Fácil",
      desc: "Los usuarios pueden descubrir y registrarse a eventos con búsqueda avanzada y filtros inteligentes.",
      color: "from-[#f1c6ff] to-[#ffddff]",
    },
    {
      icon: Zap,
      title: "Diseño Futurista",
      desc: "Interfaz inmersiva con efectos glassmorphism, gradientes animados y transiciones suaves.",
      color: "from-[#ffddff] to-[#f1c6ff]",
    },
    {
      icon: Sparkles,
      title: "Experiencia Inmersiva",
      desc: "Visualización 3D pública para que los asistentes exploren el espacio del evento antes de llegar.",
      color: "from-[#f1c6ff] to-[#ffddff]",
    },
    {
      icon: CheckCircle2,
      title: "Fácil de Usar",
      desc: "Interfaz intuitiva que no requiere conocimientos técnicos. Crea eventos profesionales en minutos.",
      color: "from-[#ffddff] to-[#f1c6ff]",
    },
  ]

  const steps = [
    {
      step: "01",
      title: "Crea tu Evento",
      desc: "Completa la información básica: nombre, fecha, ubicación y capacidad. Nuestro formulario intuitivo te guía en cada paso.",
      icon: Rocket,
    },
    {
      step: "02",
      title: "Diseña el Espacio 3D",
      desc: "Usa nuestro editor 3D para crear el layout del evento. Agrega marcadores para entradas, salidas, escenarios, baños y áreas de comida.",
      icon: Globe,
    },
    {
      step: "03",
      title: "Publica y Gestiona",
      desc: "Comparte tu evento, recibe registros y gestiona invitados desde un dashboard completo con estadísticas en tiempo real.",
      icon: Zap,
    },
  ]

  return (
    <div className="min-h-screen bg-[#1e1732] text-[#e2e2e2] overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#f1c6ff] rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#ffddff] rounded-full opacity-20 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#f1c6ff] rounded-full opacity-15 blur-3xl animate-float-slow" />

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#f1c6ff] rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Cursor Glow */}
      <div
        className="fixed w-96 h-96 bg-[#f1c6ff] rounded-full opacity-10 blur-3xl pointer-events-none transition-all duration-300 ease-out z-50"
        style={{
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
      />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50
            ? "bg-[#1e1732]/95 backdrop-blur-2xl border-b border-[#f1c6ff]/30 shadow-2xl shadow-[#f1c6ff]/10"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] rotate-45 group-hover:rotate-[405deg] transition-all duration-700 ease-out" />
              <div className="absolute inset-0 w-10 h-10 rounded-xl bg-[#f1c6ff] opacity-40 blur-lg group-hover:opacity-70 group-hover:blur-xl transition-all duration-500" />
              <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-[#1e1732] animate-pulse" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-[#f1c6ff] via-[#ffddff] to-[#f1c6ff] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              HYPE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Características", href: "#características" },
              { label: "Cómo Funciona", href: "#cómo-funciona" },
              { label: "Descubrir", href: "/discover" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="text-[#e2e2e2] hover:text-[#f1c6ff] transition-all duration-300 relative group"
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] group-hover:w-full transition-all duration-500" />
                <span className="absolute inset-0 bg-[#f1c6ff] opacity-0 group-hover:opacity-10 blur-xl transition-all duration-300 rounded-lg" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <button className="px-6 py-2.5 text-[#e2e2e2] hover:text-[#f1c6ff] transition-all duration-300 relative group">
                <span className="relative z-10">Iniciar Sesión</span>
                <span className="absolute inset-0 border border-[#f1c6ff]/0 group-hover:border-[#f1c6ff]/50 rounded-full transition-all duration-300" />
              </button>
            </Link>
            <Link href="/register">
              <button className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] text-[#1e1732] font-bold overflow-hidden group transform hover:scale-110 transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  Crear Cuenta
                  <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#ffddff] to-[#f1c6ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[#f1c6ff] opacity-50 blur-xl group-hover:opacity-80 transition-all duration-300" />
              </button>
            </Link>
          </div>

          <button
            className="md:hidden text-[#e2e2e2] hover:text-[#f1c6ff] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1e1732]/98 backdrop-blur-2xl border-t border-[#f1c6ff]/30">
            <div className="container mx-auto px-6 py-6 space-y-4">
              {[
                { label: "Características", href: "#características" },
                { label: "Cómo Funciona", href: "#cómo-funciona" },
                { label: "Descubrir", href: "/discover" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="block text-[#e2e2e2] hover:text-[#f1c6ff] transition-all duration-300 transform hover:translate-x-2"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Link href="/login" className="block">
                  <button className="w-full px-6 py-2.5 text-[#e2e2e2] border border-[#f1c6ff]/30 rounded-full hover:bg-[#f1c6ff]/10 hover:border-[#f1c6ff] transition-all duration-300">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register" className="block">
                  <button className="w-full px-6 py-2.5 rounded-full bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] text-[#1e1732] font-bold transform hover:scale-105 transition-all duration-300">
                    Crear Cuenta
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#f1c6ff]/40 bg-[#f1c6ff]/5 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#f1c6ff] animate-spin-slow" />
              <span className="text-sm text-[#f1c6ff] font-medium">Visualización 3D Inmersiva</span>
              <Star className="w-4 h-4 text-[#ffddff] animate-pulse" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="block text-[#e2e2e2]">Gestiona Eventos en</span>
              <span className="block bg-gradient-to-r from-[#f1c6ff] via-[#ffddff] to-[#f1c6ff] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Tres Dimensiones
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-[#78767b] max-w-3xl mx-auto leading-relaxed">
              La plataforma <span className="text-[#f1c6ff] font-semibold">futurista</span> que transforma la gestión de
              eventos con espacios 3D interactivos, diseño inmersivo y experiencias{" "}
              <span className="text-[#ffddff] font-semibold">inolvidables</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
              <Link href="/register">
                <button className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] text-[#1e1732] font-bold text-lg overflow-hidden transform hover:scale-110 hover:rotate-1 transition-all duration-500 shadow-2xl shadow-[#f1c6ff]/50 hover:shadow-[#f1c6ff]/70">
                  <span className="relative z-10 flex items-center gap-2">
                    Crear Cuenta Gratis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ffddff] to-[#f1c6ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] opacity-70 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all duration-500 animate-pulse" />
                </button>
              </Link>
              <Link href="/discover">
                <button className="group px-8 py-4 rounded-full border-2 border-[#f1c6ff]/40 bg-[#1e1732]/50 backdrop-blur-sm text-[#e2e2e2] font-semibold text-lg hover:bg-[#f1c6ff]/20 hover:border-[#f1c6ff] transition-all duration-500 flex items-center gap-2 transform hover:scale-105">
                  <Play className="w-5 h-5 text-[#f1c6ff] group-hover:animate-pulse" />
                  Descubrir Eventos
                </button>
              </Link>
            </div>
          </div>

{/* Contenedor del Mapa 3D - ACTUALIZADO */}
<div className="relative max-w-6xl mx-auto h-[500px] md:h-[600px]">
  <div className="absolute inset-0 bg-gradient-to-r from-[#f1c6ff]/30 to-[#ffddff]/30 blur-3xl animate-pulse-slow" />
  
  <div className="relative rounded-3xl border border-[#f1c6ff]/30 bg-gradient-to-br from-[#1e1732]/80 to-[#1e1732]/60 backdrop-blur-xl p-4 md:p-8 transform hover:scale-[1.02] transition-all duration-700 h-full">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f1c6ff] to-transparent animate-shimmer" />

    <div className="w-full h-full rounded-2xl overflow-hidden relative">
      <MapPreview3D />
    </div>
  </div>
</div>
        </div>
      </section>

      {/* Features */}
      <section id="características" className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-[#f1c6ff] animate-pulse" />
              <span className="text-sm text-[#f1c6ff] font-medium uppercase tracking-wider">Súper Poderes</span>
              <Zap className="w-6 h-6 text-[#ffddff] animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#f1c6ff] via-[#ffddff] to-[#f1c6ff] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Características Épicas
            </h2>
            <p className="text-[#78767b] text-xl">
              Todo lo que necesitas para crear eventos <span className="text-[#f1c6ff]">legendarios</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f1c6ff]/0 to-[#ffddff]/0 group-hover:from-[#f1c6ff]/20 group-hover:to-[#ffddff]/20 rounded-3xl transition-all duration-700 blur-xl" />
                <div className="relative h-full rounded-3xl border border-[#f1c6ff]/20 bg-gradient-to-br from-[#1e1732]/80 to-[#1e1732]/60 backdrop-blur-xl p-8 hover:border-[#f1c6ff]/60 transition-all duration-700 hover:transform hover:scale-[1.05] hover:-rotate-1 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#f1c6ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 relative`}
                  >
                    <feature.icon className="w-8 h-8 text-[#1e1732] relative z-10 group-hover:animate-bounce" />
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-50 blur-xl group-hover:opacity-100 transition-all duration-500`}
                    />
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-[#e2e2e2] group-hover:text-[#f1c6ff] transition-all duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-[#78767b] leading-relaxed group-hover:text-[#e2e2e2] transition-colors duration-500">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cómo-funciona" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f1c6ff]/5 via-transparent to-[#ffddff]/5" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] bg-clip-text text-transparent">
              Tres Pasos Mágicos
            </h2>
            <p className="text-[#78767b] text-xl">
              Crea eventos <span className="text-[#f1c6ff] font-bold">increíbles</span> en minutos
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((item, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f1c6ff]/20 to-[#ffddff]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="relative rounded-3xl border border-[#f1c6ff]/20 bg-gradient-to-br from-[#1e1732]/80 to-[#1e1732]/60 backdrop-blur-xl p-10 hover:border-[#f1c6ff]/60 transition-all duration-700 flex gap-8 items-start overflow-hidden transform hover:scale-[1.02] hover:rotate-1">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f1c6ff]/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative">
                    <div className="text-8xl font-black bg-gradient-to-br from-[#f1c6ff]/30 to-[#ffddff]/30 bg-clip-text text-transparent group-hover:from-[#f1c6ff] group-hover:to-[#ffddff] transition-all duration-700 group-hover:scale-110 transform">
                      {item.step}
                    </div>
                    <div className="absolute -top-4 -right-4">
                      <item.icon className="w-8 h-8 text-[#f1c6ff] opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500" />
                    </div>
                  </div>




                  <div className="flex-1 relative z-10">
                    <h3 className="text-3xl font-bold mb-4 text-[#e2e2e2] group-hover:text-[#f1c6ff] transition-all duration-500">
                      {item.title}
                    </h3>
                    <p className="text-[#78767b] text-lg leading-relaxed group-hover:text-[#e2e2e2] transition-colors duration-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#f1c6ff]/30 via-[#ffddff]/30 to-[#f1c6ff]/30 rounded-3xl blur-3xl animate-pulse" />
            <div className="relative rounded-3xl border-2 border-[#f1c6ff]/40 bg-gradient-to-br from-[#1e1732]/90 to-[#1e1732]/70 backdrop-blur-xl p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f1c6ff] to-transparent animate-shimmer" />

              <div className="relative z-10">
                <div className="flex justify-center gap-3 mb-6">
                  <Star className="w-8 h-8 text-[#f1c6ff] animate-pulse" />
                  <Star className="w-10 h-10 text-[#ffddff] animate-pulse" />
                  <Star className="w-8 h-8 text-[#f1c6ff] animate-pulse" />
                </div>

                <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#f1c6ff] via-[#ffddff] to-[#f1c6ff] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  ¡El Futuro es Ahora!
                </h2>
                <p className="text-[#78767b] text-xl mb-10 max-w-2xl mx-auto">
                  Únete a la <span className="text-[#f1c6ff] font-bold">revolución</span> de eventos 3D
                </p>
                <Link href="/register">
                  <button className="group relative px-10 py-5 rounded-full bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] text-[#1e1732] font-bold text-xl overflow-hidden transform hover:scale-110 transition-all duration-300">
                    <span className="relative z-10 flex items-center gap-2">
                      Crear Cuenta Gratis
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-[#f1c6ff] opacity-50 blur-xl group-hover:opacity-80 transition-all" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#f1c6ff]/20 py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] rotate-45" />
                <span className="font-bold text-xl text-[#e2e2e2]">HYPE</span>
              </div>
              <p className="text-[#78767b]">Gestión de eventos con visualización 3D inmersiva</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#e2e2e2]">Producto</h4>
              <ul className="space-y-3 text-[#78767b]">
                <li>
                  <a href="#características" className="hover:text-[#f1c6ff] transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <Link href="/discover" className="hover:text-[#f1c6ff] transition-colors">
                    Descubrir
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Precios
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#e2e2e2]">Empresa</h4>
              <ul className="space-y-3 text-[#78767b]">
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#e2e2e2]">Legal</h4>
              <ul className="space-y-3 text-[#78767b]">
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#f1c6ff] transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#f1c6ff]/20 text-center text-[#78767b]">
            <p>© 2025 HYPE. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-particle { animation: particle linear infinite; }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
