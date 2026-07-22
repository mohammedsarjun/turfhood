'use client';

import { Button, Card, Heading, Input, Spinner, Text, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TOTAL_STEPS, useTurfOnboardingWizard } from '../hooks/useTurfOnboardingWizard';
import { CountryStateCityFields } from './CountryStateCityFields';
import { DocumentUpload } from './DocumentUpload';
import { LocationMapPicker } from './LocationMapPicker';
import { TurfImageUpload } from './TurfImageUpload';

const STEP_TITLES = [
  'Turf Details',
  'Location',
  'Sports & Amenities',
  'Turf Photos',
  'Documents & Review',
];

export function TurfOnboardingWizard() {
  const {
    step,
    form,
    update,
    errors,
    formError,
    isSubmitting,
    goNext,
    goBack,
    submit,
    sportsOptions,
    amenityOptions,
    isLoadingOptions,
  } = useTurfOnboardingWizard();

  const toggleInArray = (list: string[], id: string): string[] =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl" style={{ padding: 24 }}>
        <Heading variant="display" style={{ marginBottom: 4 }}>
          List Your Turf
        </Heading>
        <Text style={{ marginBottom: 20 }}>{STEP_TITLES[step - 1]}</Text>

        <div className="flex items-center" style={{ gap: 6, marginBottom: 20 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((segment) => (
            <div
              key={segment}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                segment <= step ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>

        <Card style={{ padding: 24 }}>
          {step === 1 && (
            <div className="flex flex-col" style={{ gap: 16 }}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Turf Name
                </label>
                <Input
                  value={form.name}
                  errorMessage={errors.name}
                  onChange={(event) => update({ name: event.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <Textarea
                  value={form.description}
                  onChange={(event) => update({ description: event.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Address Line
                </label>
                <Input
                  value={form.line1}
                  errorMessage={errors.line1}
                  onChange={(event) => update({ line1: event.target.value })}
                />
              </div>
              <CountryStateCityFields
                value={form.location}
                onChange={(location) => update({ location })}
                errors={{ country: errors.country, state: errors.state, city: errors.city }}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Pincode</label>
                <Input
                  value={form.pincode}
                  errorMessage={errors.pincode}
                  onChange={(event) => update({ pincode: event.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <LocationMapPicker
              value={form.coordinates}
              onChange={(coordinates) => update({ coordinates })}
            />
          )}

          {step === 3 && (
            <div className="flex flex-col" style={{ gap: 24 }}>
              {isLoadingOptions ? (
                <Spinner />
              ) : (
                <>
                  <div>
                    <Heading variant="h2" style={{ marginBottom: 8 }}>
                      Sports Offered
                    </Heading>
                    <div className="flex flex-wrap" style={{ gap: 12 }}>
                      {sportsOptions.map((sport) => (
                        <label
                          key={sport.id}
                          className="flex items-center text-sm"
                          style={{ gap: 6 }}
                        >
                          <input
                            type="checkbox"
                            checked={form.sportsOffered.includes(sport.id)}
                            onChange={() =>
                              update({ sportsOffered: toggleInArray(form.sportsOffered, sport.id) })
                            }
                          />
                          {sport.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Heading variant="h2" style={{ marginBottom: 8 }}>
                      Amenities (optional)
                    </Heading>
                    <div className="flex flex-wrap" style={{ gap: 12 }}>
                      {amenityOptions.map((amenity) => (
                        <label
                          key={amenity.id}
                          className="flex items-center text-sm"
                          style={{ gap: 6 }}
                        >
                          <input
                            type="checkbox"
                            checked={form.amenities.includes(amenity.id)}
                            onChange={() =>
                              update({ amenities: toggleInArray(form.amenities, amenity.id) })
                            }
                          />
                          {amenity.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.sportsOffered && (
                    <p role="alert" className="text-xs text-destructive">
                      {errors.sportsOffered}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <Heading variant="h2" style={{ marginBottom: 8 }}>
                Turf Photos
              </Heading>
              <Text style={{ marginBottom: 16 }}>
                Upload 1–10 photos and mark one as the cover photo.
              </Text>
              <TurfImageUpload images={form.images} onChange={(images) => update({ images })} />
            </div>
          )}

          {step === 5 && (
            <div>
              <Heading variant="h2" style={{ marginBottom: 8 }}>
                Verification Documents
              </Heading>
              <DocumentUpload
                documents={form.documents}
                onChange={(documents) => update({ documents })}
              />
            </div>
          )}

          {formError && (
            <p role="alert" className="text-sm text-destructive" style={{ marginTop: 16 }}>
              {formError}
            </p>
          )}

          <div className="flex items-center justify-between" style={{ marginTop: 24 }}>
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 1}>
              Back
            </Button>
            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button type="button" loading={isSubmitting} onClick={() => void submit()}>
                Submit Application
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
