import { PrismaClient } from '../src/generated/prisma/client.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  })

  const roomsData = [
    {
      code: '101',
      name: 'Лекционная аудитория',
      capacity: 120,
      equipment: ['projector', 'microphone', 'wifi'],
      status: 'available' as const,
    },
    {
      code: '102',
      name: 'Компьютерный класс',
      capacity: 30,
      equipment: ['computers', 'projector', 'whiteboard', 'wifi'],
      status: 'reserved' as const,
    },
    {
      code: '201',
      name: 'Конференц-зал',
      capacity: 50,
      equipment: ['projector', 'microphone', 'wifi', 'video'],
      status: 'available' as const,
    },
    {
      code: '202',
      name: 'Семинарская',
      capacity: 25,
      equipment: ['whiteboard', 'wifi'],
      status: 'maintenance' as const,
    },
  ]

  for (const room of roomsData) {
    const r = await prisma.room.upsert({
      where: { code: room.code },
      update: {},
      create: room,
    })
    console.log(`Created room with id: ${r.id}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
