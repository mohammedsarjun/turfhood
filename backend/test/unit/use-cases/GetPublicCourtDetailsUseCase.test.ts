import { expect } from 'chai';
import type { AvailabilityOverrideDTO, CourtDTO } from '@turfhood/shared';
import { generateSlots } from '@application/court/use-cases/GetPublicCourtDetailsUseCase';

const court: CourtDTO = {
  id: 'court-id',
  turfId: 'turf-id',
  name: 'Centre Court',
  sportTypeIds: [],
  capacity: 10,
  status: 'active',
  allowOpenSessions: true,
  minPlayersForOpenSession: 2,
  slotDurationMinutes: 60,
  images: [],
  pricingRules: [
    { id: 'morning', dayType: 'weekday', startTime: '08:00', endTime: '12:00', pricePerSlot: 500 },
    { id: 'evening', dayType: 'weekday', startTime: '17:00', endTime: '21:00', pricePerSlot: 800 },
  ],
  createdAt: '',
  updatedAt: '',
};

function override(fields: Partial<AvailabilityOverrideDTO>): AvailabilityOverrideDTO {
  return {
    id: 'override-id',
    turfId: court.turfId,
    courtId: court.id,
    date: '2026-09-02',
    isClosed: false,
    blockedSlots: [],
    createdAt: '',
    updatedAt: '',
    ...fields,
  };
}

describe('generateSlots', () => {
  it('uses the matching price bands and groups slots by their start time', () => {
    const slots = generateSlots(court, '2026-09-02', 'weekday');

    expect(slots).to.have.length(8);
    expect(slots[0]).to.include({
      startTime: '08:00',
      endTime: '09:00',
      price: 500,
      period: 'morning',
    });
    expect(slots[4]).to.include({
      startTime: '17:00',
      endTime: '18:00',
      price: 800,
      period: 'evening',
    });
  });

  it('returns no slots when the date override closes the court', () => {
    expect(
      generateSlots(court, '2026-09-02', 'weekday', override({ isClosed: true })),
    ).to.deep.equal([]);
  });

  it('removes the exact slots selected by the owner', () => {
    const slots = generateSlots(
      court,
      '2026-09-02',
      'weekday',
      override({
        blockedSlots: [
          { startTime: '10:00', endTime: '11:00' },
          { startTime: '18:00', endTime: '19:00' },
        ],
      }),
    );

    expect(slots.map((slot) => slot.startTime)).to.deep.equal([
      '08:00',
      '09:00',
      '11:00',
      '17:00',
      '19:00',
      '20:00',
    ]);
  });

  it('does not use weekday price bands on a weekend', () => {
    expect(generateSlots(court, '2026-09-05', 'weekend')).to.deep.equal([]);
  });
});
