import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Subscription Plans Table
    await knex.schema.createTable('plans', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name').notNullable();
        table.decimal('price', 12, 2).notNullable();
        table.string('currency').defaultTo('TZS');
        table.integer('duration_days').notNullable();
        table.jsonb('features').defaultTo('[]');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    // 2. Subscriptions Table
    await knex.schema.createTable('subscriptions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('church_id').references('id').inTable('churches').onDelete('CASCADE').notNullable();
        table.uuid('plan_id').references('id').inTable('plans').onDelete('RESTRICT').notNullable();
        table.timestamp('start_date').notNullable().defaultTo(knex.fn.now());
        table.timestamp('end_date').notNullable();
        table.timestamp('grace_period_end');
        table.string('status').defaultTo('ACTIVE'); // ACTIVE, EXPIRED, CANCELLED, GRACE_PERIOD
        table.boolean('auto_renew').defaultTo(true);
        table.timestamps(true, true);
    });

    // 3. Members Table (Congregants)
    await knex.schema.createTable('members', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('church_id').references('id').inTable('churches').onDelete('CASCADE').notNullable();
        table.string('registration_number').unique();
        table.string('full_name').notNullable();
        table.string('phone_number').notNullable();
        table.string('email');
        table.string('gender');
        table.date('date_of_birth');
        table.string('member_type').defaultTo('REGULAR'); // REGULAR, PARTNER, VISITOR
        table.boolean('is_active').defaultTo(true);
        table.jsonb('metadata').defaultTo('{}');
        table.timestamps(true, true);
        table.unique(['church_id', 'phone_number']);
    });

    // 4. Transactions Table
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE').notNullable();
        table.uuid('church_id').references('id').inTable('churches').onDelete('CASCADE');
        table.uuid('member_id').references('id').inTable('members').onDelete('SET NULL');
        table.decimal('amount', 12, 2).notNullable();
        table.string('currency').defaultTo('TZS');
        table.string('status').defaultTo('PENDING'); // PENDING, SUCCESS, FAILED, REVERSED
        table.string('type').notNullable(); // SADAKA, SUBSCRIPTION, DONATION, AFFILIATE_PAYMENT
        table.string('provider').notNullable(); // M-PESA, AIRTELMONEY, HALOPESA, BANK
        table.string('provider_reference').unique();
        table.string('internal_reference').unique().notNullable();
        table.jsonb('provider_response');
        table.timestamps(true, true);
    });

    // 5. SMS Logs Table
    await knex.schema.createTable('sms_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('church_id').references('id').inTable('churches').onDelete('CASCADE').notNullable();
        table.string('recipient_phone').notNullable();
        table.text('message').notNullable();
        table.string('status').defaultTo('QUEUED'); // QUEUED, SENT, DELIVERED, FAILED
        table.string('provider_message_id');
        table.integer('segments').defaultTo(1);
        table.decimal('cost', 10, 4).defaultTo(0);
        table.timestamp('sent_at');
        table.timestamps(true, true);
    });

    // 6. Certificates Table
    await knex.schema.createTable('certificates', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('church_id').references('id').inTable('churches').onDelete('CASCADE').notNullable();
        table.uuid('member_id').references('id').inTable('members').onDelete('CASCADE').notNullable();
        table.string('certificate_type').notNullable(); // PARTNER, BAPTISM, MARRIAGE
        table.string('file_url');
        table.string('verification_code').unique();
        table.jsonb('dynamic_data');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('certificates');
    await knex.schema.dropTableIfExists('sms_logs');
    await knex.schema.dropTableIfExists('transactions');
    await knex.schema.dropTableIfExists('members');
    await knex.schema.dropTableIfExists('subscriptions');
    await knex.schema.dropTableIfExists('plans');
}
