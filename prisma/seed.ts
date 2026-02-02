import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sleepnumber.com' },
    update: {},
    create: {
      email: 'admin@sleepnumber.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'Information Security',
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create analyst user
  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@sleepnumber.com' },
    update: {},
    create: {
      email: 'analyst@sleepnumber.com',
      name: 'Risk Analyst',
      password: hashedPassword,
      role: 'ANALYST',
      department: 'Third Party Risk Management',
    },
  })

  console.log('Created analyst user:', analystUser.email)

  // Create sample vendors
  const vendors = [
    {
      name: 'Acme Cloud Services',
      industry: 'Cloud Computing',
      country: 'United States',
      stateProvince: 'California',
      primaryContactEmail: 'security@acme.example.com',
      status: 'ACTIVE' as const,
    },
    {
      name: 'DataTech Solutions',
      industry: 'Data Analytics',
      country: 'United States',
      stateProvince: 'Texas',
      primaryContactEmail: 'contact@datatech.example.com',
      status: 'ACTIVE' as const,
    },
    {
      name: 'SecurePayments Inc',
      industry: 'Financial Services',
      country: 'United States',
      stateProvince: 'New York',
      primaryContactEmail: 'security@securepay.example.com',
      status: 'PENDING' as const,
    },
  ]

  for (const vendor of vendors) {
    const created = await prisma.vendor.upsert({
      where: { id: vendor.name.toLowerCase().replace(/\s/g, '-') },
      update: {},
      create: vendor,
    })
    console.log('Created vendor:', created.name)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
