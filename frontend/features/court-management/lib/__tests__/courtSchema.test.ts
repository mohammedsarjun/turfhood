import { createAvailabilityOverrideSchema, createCourtSchema, getOverlappingPricingBandIndexes } from '@turfhood/shared';

const validCourt = {
  name: 'Court A',
  sportTypeIds: ['sport_1'],
  capacity: 10,
  status: 'active' as const,
  allowOpenSessions: true,
  minPlayersForOpenSession: 2,
  slotDurationMinutes: 60,
  imageCoverFlags: [true],
  pricingRules: [
    { dayType: 'weekday' as const, startTime: '06:00', endTime: '10:00', pricePerSlot: 500 },
  ],
};

describe('createCourtSchema', () => {
  it('reports empty required fields including court images', () => {
    const result = createCourtSchema.safeParse({
      ...validCourt,
      name: '',
      sportTypeIds: [],
      capacity: 0,
      imageCoverFlags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
      expect(errors.sportTypeIds).toBeDefined();
      expect(errors.capacity).toBeDefined();
      expect(errors.imageCoverFlags).toContain('Upload at least one court image.');
    }
  });

  it('identifies every overlapping pricing band', () => {
    const rules = [
      { dayType: 'weekday' as const, startTime: '06:00', endTime: '10:00', pricePerSlot: 500 },
      { dayType: 'weekday' as const, startTime: '09:00', endTime: '12:00', pricePerSlot: 700 },
      { dayType: 'weekend' as const, startTime: '09:00', endTime: '12:00', pricePerSlot: 800 },
    ];

    expect(getOverlappingPricingBandIndexes(rules)).toEqual([0, 1]);
    expect(createCourtSchema.safeParse({ ...validCourt, pricingRules: rules }).success).toBe(false);
  });

  it('only accepts configured slot durations', () => {
    expect(createCourtSchema.safeParse({ ...validCourt, slotDurationMinutes: 45 }).success).toBe(true);
    expect(createCourtSchema.safeParse({ ...validCourt, slotDurationMinutes: 35 }).success).toBe(false);
  });

  it('rejects a slot price above ₹20,000', () => {
    const result = createCourtSchema.safeParse({
      ...validCourt,
      pricingRules: [{ ...validCourt.pricingRules[0], pricePerSlot: 20_001 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.pricingRules?.[0]).toContain('₹20,000');
    }
  });
});

describe('createAvailabilityOverrideSchema', () => {
  it('requires a reason category for a full-day closure', () => {
    expect(createAvailabilityOverrideSchema.safeParse({ date: '2026-08-20', isClosed: true, blockedSlots: [] }).success).toBe(false);
    expect(createAvailabilityOverrideSchema.safeParse({ date: '2026-08-20', isClosed: true, closureReason: 'holiday', blockedSlots: [] }).success).toBe(true);
  });

  it('accepts selected generated slots', () => {
    const result = createAvailabilityOverrideSchema.safeParse({
      date: '2026-08-20', isClosed: false,
      blockedSlots: [{ startTime: '08:00', endTime: '09:00' }, { startTime: '17:00', endTime: '18:00' }],
    });
    expect(result.success).toBe(true);
  });

  it('requires at least one selected slot for a partial override', () => {
    const result = createAvailabilityOverrideSchema.safeParse({
      date: '2026-08-20',
      isClosed: false,
      blockedSlots: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.blockedSlots?.[0]).toContain(
        'Select at least one slot',
      );
    }
  });

  it('rejects duplicate selected slots', () => {
    const result = createAvailabilityOverrideSchema.safeParse({
      date: '2026-08-20', isClosed: false,
      blockedSlots: [{ startTime: '08:00', endTime: '09:00' }, { startTime: '08:00', endTime: '09:00' }],
    });
    expect(result.success).toBe(false);
  });
});
