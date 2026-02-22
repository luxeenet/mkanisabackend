import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('plans').del();

    // Inserts seed entries
    await knex('plans').insert([
        {
            name: 'Kagash Free',
            price: 0.00,
            currency: 'TZS',
            duration_days: 30,
            features: JSON.stringify(['Basic Member Tracking', 'Cloud Storage']),
            is_active: true
        },
        {
            name: 'Portal Monthly',
            price: 49.00,
            currency: 'USD',
            duration_days: 30,
            features: JSON.stringify(['Unlimited Members', 'Detailed Analytics', 'SMS Integration']),
            is_active: true
        },
        {
            name: 'Global Annual',
            price: 500.00,
            currency: 'USD',
            duration_days: 365,
            features: JSON.stringify(['Multi-branch', 'Custom Domain', 'Dedicated Support']),
            is_active: true
        }
    ]);
}
