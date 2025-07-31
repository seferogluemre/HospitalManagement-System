import { faker } from '@faker-js/faker';
import { Gender } from '@onlyjs/db/enums';
import { createSeeder } from '@onlyjs/db/seeder/utils';

const usersSeeder = createSeeder(
  {
    name: 'users',
    description: 'Sahte kullanıcı verilerini oluşturur',
    priority: 20,
    dependencies: ['system-admin'], // System admin'den sonra çalışsın
  },
  async (prisma) => {
    // Create users
    await Promise.all(
      Array(50)
        .fill(null)
        .map(() => {
          const firstName = faker.person.firstName().slice(0, 50);
          const lastName = faker.person.lastName().slice(0, 50);
          return prisma.user.create({
            data: {
              firstName,
              lastName,
              name: `${firstName} ${lastName}`.slice(0, 101),
              email: faker.internet.email().slice(0, 255),
              gender: faker.helpers.arrayElement(Object.values(Gender)),
              rolesSlugs: ['basic'],
              emailVerified: true,
              image: faker.image.avatar().slice(0, 255),
            },
          });
        }),
    );

    console.log('✅ Users seeding completed!');
  },
  async (prisma) => {
    // Rollback - sadece user rolüne sahip kullanıcıları sil
    await prisma.user.deleteMany({
      where: {
        rolesSlugs: {
          equals: ['basic'],
        },
      },
    });
    console.log('✅ Users rollback completed!');
  },
);

export default usersSeeder;
