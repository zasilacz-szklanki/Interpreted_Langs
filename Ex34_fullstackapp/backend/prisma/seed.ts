import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const statuses = [
        'NOT_APPROVED', // NIEZATWIERDZONE
        'APPROVED',     // ZATWIERDZONE
        'CANCELLED',    // ANULOWANE
        'COMPLETED'     // ZREALIZOWANE
    ];

    for (const statusName of statuses) {
        const status = await prisma.orderStatus.upsert({
            where: { name: statusName },
            update: {},
            create: { name: statusName }
        });
    }

    const categories = [
        'Electronics',
        'Books',
        'Clothing',
        'Home & Garden'
    ];

    for (const catName of categories) {
        const category = await prisma.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName }
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });