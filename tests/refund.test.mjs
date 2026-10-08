import { test } from 'node:test';
import assert from 'node:assert/strict';
import { processRefund } from '../src/lib/payu-refund.js';

test('processRefund rejects missing bookings gracefully', async () => {
  const mockClient = {
    from(table) {
      if (table === 'bookings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        };
      }
    },
  };

  const res = await processRefund({ bookingId: 'NON_EXISTENT', client: mockClient });
  assert.equal(res.ok, false);
  assert.equal(res.error, 'Booking not found');
});

test('processRefund skips refund if no paid amount exists', async () => {
  const mockClient = {
    from(table) {
      if (table === 'bookings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: 'BMP-001', customer_id: 'cust-1', total_paid: 0, payment_status: 'unpaid', status: 'cancelled' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'payments') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
    },
  };

  const res = await processRefund({ bookingId: 'BMP-001', client: mockClient });
  assert.equal(res.ok, true);
  assert.equal(res.skipped, true);
});

test('processRefund enforces duplicate refund prevention', async () => {
  const mockClient = {
    from(table) {
      if (table === 'bookings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: 'BMP-002', customer_id: 'cust-1', total_paid: 50, payment_status: 'refunded', status: 'cancelled' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'payments') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'pay-1',
                      amount: 50,
                      status: 'refunded',
                      provider_ref: '31163547396',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
    },
  };

  const res = await processRefund({ bookingId: 'BMP-002', client: mockClient });
  assert.equal(res.ok, true);
  assert.equal(res.alreadyRefunded, true);
  assert.equal(res.message, 'Booking is already refunded.');
});

test('processRefund handles simulated failure and returns refund_failed without marking refunded', async () => {
  const auditLogs = [];
  const notifications = [];

  const mockClient = {
    from(table) {
      if (table === 'bookings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: 'BMP-003', customer_id: 'cust-1', total_paid: 50, payment_status: 'paid', status: 'cancelled' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'payments') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'pay-2',
                      amount: 50,
                      status: 'held',
                      provider_ref: '31163547396',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: async () => ({ data: [{ id: 'admin-1' }] }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: async (row) => {
            notifications.push(row);
            return { error: null };
          },
        };
      }
      if (table === 'audit_log') {
        return {
          insert: async (row) => {
            auditLogs.push(row);
            return { error: null };
          },
        };
      }
    },
  };

  const res = await processRefund({
    bookingId: 'BMP-003',
    simulateFailure: true,
    client: mockClient,
    adminUser: { id: 'admin-1', name: 'SuperAdmin' },
  });

  assert.equal(res.ok, false);
  assert.equal(res.refundStatus, 'refund_failed');
  assert.equal(auditLogs.length, 1);
  assert.equal(auditLogs[0].action, 'booking.refund_failed');
  assert.equal(auditLogs[0].meta.original_txn_id, '31163547396');
  assert.equal(notifications.length, 1);
});

test('processRefund stub preserves original provider_ref and logs audit entry', async () => {
  const auditLogs = [];
  const paymentUpdates = [];
  const bookingUpdates = [];

  const mockClient = {
    from(table) {
      if (table === 'bookings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: 'BMP-004', customer_id: 'cust-1', total_paid: 100, payment_status: 'paid', status: 'cancelled' },
                error: null,
              }),
            }),
          }),
          update: (fields) => ({
            eq: async (k, v) => {
              bookingUpdates.push({ fields, k, v });
              return { error: null };
            },
          }),
        };
      }
      if (table === 'payments') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: 'pay-stub',
                      amount: 100,
                      status: 'held',
                      provider_ref: 'STUB-TXN-12345',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
          update: (fields) => ({
            eq: async (k, v) => {
              paymentUpdates.push({ fields, k, v });
              return { error: null };
            },
          }),
        };
      }
      if (table === 'audit_log') {
        return {
          insert: async (row) => {
            auditLogs.push(row);
            return { error: null };
          },
        };
      }
    },
  };

  const res = await processRefund({
    bookingId: 'BMP-004',
    client: mockClient,
    adminUser: { id: 'admin-1', name: 'SuperAdmin' },
  });

  assert.equal(res.ok, true);
  assert.equal(res.status, 'refunded');
  // Check that provider_ref was NOT overwritten in payments update!
  assert.deepEqual(paymentUpdates[0].fields, { status: 'refunded' });
  assert.equal(bookingUpdates[0].fields.payment_status, 'refunded');
  assert.equal(auditLogs[0].meta.original_txn_id, 'STUB-TXN-12345');
});
