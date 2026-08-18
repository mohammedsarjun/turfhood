import { createCourtSchema, getOverlappingPricingBandIndexes } from '@turfhood/shared';

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
