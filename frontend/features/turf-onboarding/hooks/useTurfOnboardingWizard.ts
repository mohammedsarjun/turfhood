'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import type { CatalogItem } from '@turfhood/shared';
import { submitApplication } from '../actions/turfOnboardingApi';
import { listPublicAmenities, listPublicSportsTypes } from '../actions/catalogApi';
import { validateCoordinates } from '../lib/validateCoordinates';
import { validateSportsSelection } from '../lib/validateSportsSelection';
import { validateTurfDetails } from '../lib/validateTurfDetails';
import { validateTurfImages } from '../lib/validateTurfImages';
import type { CountryStateCityValue } from '../components/CountryStateCityFields';
import type { DocumentEntry } from '../components/DocumentUpload';
import type { Coordinates } from '../components/LocationMapPicker';
import type { TurfImageEntry } from '../components/TurfImageUpload';

export interface TurfOnboardingFormState {
  name: string;
  description: string;
  line1: string;
  location: CountryStateCityValue;
  pincode: string;
  coordinates: Coordinates | null;
  sportsOffered: string[];
  amenities: string[];
  images: TurfImageEntry[];
  documents: DocumentEntry[];
}

const INITIAL_STATE: TurfOnboardingFormState = {
  name: '',
  description: '',
  line1: '',
  location: { country: '', state: '', city: '' },
  pincode: '',
  coordinates: null,
  sportsOffered: [],
  amenities: [],
  images: [],
  documents: [],
};

export const TOTAL_STEPS = 5;

/** Owns step index + accumulated form state across the multi-step onboarding wizard. */
export function useTurfOnboardingWizard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TurfOnboardingFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sportsOptions, setSportsOptions] = useState<CatalogItem[]>([]);
  const [amenityOptions, setAmenityOptions] = useState<CatalogItem[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      setIsLoadingOptions(true);
      try {
        const [sports, amenities] = await Promise.all([
          listPublicSportsTypes(),
          listPublicAmenities(),
        ]);
        setSportsOptions(sports.items);
        setAmenityOptions(amenities.items);
      } finally {
        setIsLoadingOptions(false);
      }
    }
    void loadOptions();
  }, []);

  const update = (patch: Partial<TurfOnboardingFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const goNext = () => {
    setFormError(null);
    if (step === 1) {
      const result = validateTurfDetails({
        name: form.name,
        ...(form.description ? { description: form.description } : {}),
        address: { line1: form.line1, ...form.location, pincode: form.pincode },
      });
      setErrors(result.errors);
      if (!result.valid) return;
    }
    if (step === 2) {
      const result = validateCoordinates(form.coordinates);
      if (!result.valid) {
        setFormError(result.error ?? 'Invalid coordinates.');
        return;
      }
    }
    if (step === 3) {
      const result = validateSportsSelection(form.sportsOffered);
      if (!result.valid) {
        setErrors({ sportsOffered: result.error ?? 'Select at least one sport.' });
        return;
      }
    }
    if (step === 4) {
      const result = validateTurfImages(form.images);
      if (!result.valid) {
        setFormError(result.error ?? 'Invalid turf photos.');
        return;
      }
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setFormError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const submit = async () => {
    setFormError(null);
    if (form.documents.length === 0) {
      setFormError('At least one verification document is required.');
      return;
    }
    if (!form.coordinates) {
      setFormError("Please pinpoint your turf's location on the map.");
      return;
    }
    const imagesResult = validateTurfImages(form.images);
    if (!imagesResult.valid) {
      setFormError(imagesResult.error ?? 'Invalid turf photos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication({
        name: form.name,
        ...(form.description ? { description: form.description } : {}),
        address: { line1: form.line1, ...form.location, pincode: form.pincode },
        coordinates: form.coordinates,
        sportsOffered: form.sportsOffered,
        amenities: form.amenities,
        images: form.images,
        documents: form.documents,
      });
      showToast('Application submitted — pending review.');
      router.push('/my-turfs');
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again later.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
