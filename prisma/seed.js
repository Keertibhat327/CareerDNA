import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CareerDNA database...');

  // Clean up existing database contents
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.recruiter.deleteMany();

  const studentPassword = await bcrypt.hash('student123', 10);
  const recruiterPassword = await bcrypt.hash('recruiter123', 10);

  // 1. Create a Student
  const student = await prisma.user.create({
    data: {
      name: 'Diya Shetty',
      email: 'student@careerdna.com',
      password: studentPassword,
      skills: ['python', 'sql', 'node.js', 'javascript']
    }
  });
  console.log(`Created student: ${student.email}`);

  // 2. Create a Recruiter
  const recruiter = await prisma.recruiter.create({
    data: {
      companyName: 'TechCorp Solutions',
      email: 'recruiter@techcorp.com',
      password: recruiterPassword
    }
  });
  console.log(`Created recruiter: ${recruiter.email}`);

  // 3. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Backend Developer',
      description: 'We are looking for a Node.js developer with experience in Express, SQL, and PostgreSQL/Prisma.',
      requiredSkills: ['node.js', 'express.js', 'sql', 'postgresql', 'javascript'],
      recruiterId: recruiter.id
    }
  });
  console.log(`Created job: ${job1.title}`);

  const job2 = await prisma.job.create({
    data: {
      title: 'Data Analyst',
      description: 'Looking for a Data Analyst who is proficient in SQL, Python, Excel, and Tableau.',
      requiredSkills: ['sql', 'python', 'excel', 'tableau', 'pandas'],
      recruiterId: recruiter.id
    }
  });
  console.log(`Created job: ${job2.title}`);

  // 4. Create an Application
  const application = await prisma.application.create({
    data: {
      userId: student.id,
      jobId: job1.id,
      status: 'PENDING'
    }
  });
  console.log(`Created application: ${student.name} -> ${job1.title}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
