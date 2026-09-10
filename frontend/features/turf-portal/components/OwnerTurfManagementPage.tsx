'use client';
/* eslint-disable @next/next/no-img-element -- turf images use deployment-specific CDN URLs */

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import Link from 'next/link';
import {
  FiChevronRight,
  FiEdit2,
  FiImage,
  FiMapPin,
  FiPlus,
  FiSave,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Button, Input, Spinner, Textarea, useToast } from '@/components/ui';
import { validateImageFile } from '@/lib/validateImageFile';
import {
  CountryStateCityFields,
  type CountryStateCityValue,
} from '@/features/turf-onboarding/components/CountryStateCityFields';
import { LocationMapPicker } from '@/features/turf-onboarding/components/LocationMapPicker';
import { validateCoordinates } from '@/features/turf-onboarding/lib/validateCoordinates';
import { validateTurfDetails } from '@/features/turf-onboarding/lib/validateTurfDetails';
import {
  getOwnerTurf,
  updateOwnerTurf,
  updateOwnerTurfImages,
  type OwnerTurfDetails,
} from '../actions/ownerTurfApi';

type Section = 'photos' | 'basic' | 'location';
type GalleryPhoto = {
  key: string;
  previewUrl: string;
  existingUrl?: string;
  file?: File;
  isCover: boolean;
};
type Field =
  'name' | 'description' | 'line1' | 'city' | 'state' | 'country' | 'pincode' | 'coordinates';
type Errors = Partial<Record<Field, string>>;

export function OwnerTurfManagementPage({ turfId }: { turfId: string }) {
  const [turf, setTurf] = useState<OwnerTurfDetails | null>(null);
  const [draft, setDraft] = useState<OwnerTurfDetails | null>(null);
  const [editing, setEditing] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string>();
  const [errors, setErrors] = useState<Errors>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void getOwnerTurf(turfId)
      .then((value) => {
        setTurf(value);
        setDraft(value);
      })
      .catch((error: Error) => showToast(error.message, 'error'))
      .finally(() => setLoading(false));
  }, [showToast, turfId]);

  if (loading)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  if (!turf || !draft)
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p>We couldn&apos;t load this turf.</p>
        <Button className="mt-4" onClick={() => location.reload()}>
          Try again
        </Button>
      </div>
    );

  const clearError = (field: Field) =>
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  const edit = (section: Section) => {
    setDraft(structuredClone(turf));
    setErrors({});
    setPhotoError(undefined);
    if (section === 'photos')
      setPhotos(
        turf.images.map((url, index) => ({
          key: url,
          previewUrl: url,
          existingUrl: url,
          isCover: index === 0,
        })),
      );
    setEditing(section);
  };
  const cancel = () => {
    photos.filter((photo) => photo.file).forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setDraft(structuredClone(turf));
    setPhotos([]);
    setErrors({});
    setPhotoError(undefined);
    setEditing(null);
  };
  const changeAddress = (field: keyof OwnerTurfDetails['address'], value: string) => {
    setDraft({ ...draft, address: { ...draft.address, [field]: value } });
    clearError(field as Field);
  };

  async function save(section: Section) {
    const detailValidation = validateTurfDetails(draft!);
    const coordinateValidation = validateCoordinates({
      lat: draft!.location.latitude,
      lng: draft!.location.longitude,
    });
    const next: Errors =
      section === 'basic'
        ? {
            ...(detailValidation.errors.name ? { name: detailValidation.errors.name } : {}),
            ...(draft!.description.length > 1000
              ? { description: 'Description must be 1000 characters or fewer.' }
              : {}),
          }
        : {
            ...detailValidation.errors,
            ...(coordinateValidation.error ? { coordinates: coordinateValidation.error } : {}),
          };
    if (section === 'location') delete next.name;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await updateOwnerTurf(turfId, {
        name: draft!.name,
        description: draft!.description,
        address: draft!.address,
        location: draft!.location,
      });
      setTurf(structuredClone(draft!));
      setEditing(null);
      showToast(section === 'basic' ? 'Basic details updated.' : 'Location updated.');
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = [...(event.target.files ?? [])];
    event.target.value = '';
    const invalid = selected.find((file) => !validateImageFile(file).valid);
    if (invalid) {
      setPhotoError(validateImageFile(invalid).error);
      return;
    }
    if (photos.length + selected.length > 10) {
      setPhotoError('You can upload a maximum of 10 turf photos.');
      return;
    }
    setPhotoError(undefined);
    setPhotos((current) => [
      ...current,
      ...selected.map((file, index) => ({
        key: `new:${Date.now()}:${index}`,
        previewUrl: URL.createObjectURL(file),
        file,
        isCover: current.length === 0 && index === 0,
      })),
    ]);
  }

  function removePhoto(key: string) {
    setPhotoError(undefined);
    setPhotos((current) => {
      const removed = current.find((photo) => photo.key === key);
      if (removed?.file) URL.revokeObjectURL(removed.previewUrl);
      const next = current.filter((photo) => photo.key !== key);
      if (removed?.isCover && next[0]) next[0] = { ...next[0], isCover: true };
      return next;
    });
  }

  async function savePhotos() {
    if (photos.length < 1 || photos.length > 10) {
      setPhotoError('Keep between 1 and 10 turf photos.');
      return;
    }
    if (photos.filter((photo) => photo.isCover).length !== 1) {
      setPhotoError('Choose exactly one cover photo.');
      return;
    }
    setUploading(true);
    try {
      const retained = photos.flatMap((photo) => (photo.existingUrl ? [photo.existingUrl] : []));
      const newPhotos = photos.filter((photo): photo is GalleryPhoto & { file: File } =>
        Boolean(photo.file),
      );
      const cover = photos.find((photo) => photo.isCover)!;
      const coverKey =
        cover.existingUrl ?? `new:${newPhotos.findIndex((photo) => photo.key === cover.key)}`;
      const images = await updateOwnerTurfImages(
        turfId,
        retained,
        newPhotos.map((photo) => photo.file),
        coverKey,
      );
      photos
        .filter((photo) => photo.file)
        .forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setTurf({ ...turf!, images });
      setDraft({ ...draft!, images });
      setPhotos([]);
      setEditing(null);
      showToast('Turf photos updated.');
    } catch (error) {
      showToast((error as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  }

  const locationValue: CountryStateCityValue = {
    country: draft.address.country
      ? { code: draft.address.countryCode, name: draft.address.country }
      : null,
    state: draft.address.state
      ? { code: draft.address.stateCode, name: draft.address.state }
      : null,
    city: draft.address.city ? { code: draft.address.cityCode, name: draft.address.city } : null,
  };
  const actions = (section: Section): ReactNode =>
    editing === section ? (
      <div className="flex gap-2">
        <Button variant="ghost" onClick={cancel}>
          <FiX />
          Cancel
        </Button>
        <Button
          loading={section === 'photos' ? uploading : saving}
          onClick={() => (section === 'photos' ? void savePhotos() : void save(section))}
        >
          <FiSave />
          Save
        </Button>
      </div>
    ) : (
      <Button variant="outline" disabled={editing !== null} onClick={() => edit(section)}>
        <FiEdit2 />
        Edit
      </Button>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/my-turfs" className="hover:text-foreground">
          My Turfs
        </Link>
        <FiChevronRight />
        <span className="text-foreground">{turf.name}</span>
        <FiChevronRight />
        <span className="font-medium text-foreground">Manage Turf</span>
      </nav>
      <div>
        <p className="text-sm font-semibold text-primary">TURF PROFILE</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Manage your turf</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a section to edit. Details remain read-only until you click Edit.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative h-64 bg-slate-900 sm:h-80">
          {turf.images[0] ? (
            <img
              src={turf.images[0]}
              alt={`${turf.name} cover`}
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <FiImage size={44} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 text-white">
            <p className="text-2xl font-bold">{turf.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
              <FiMapPin />
              {turf.address.city}, {turf.address.state}
            </p>
          </div>
        </div>
      </section>

      <Card
        title="Turf photos"
        description="Show customers every angle of your venue. Keep 1 to 10 photos."
        actions={actions('photos')}
      >
        {editing === 'photos' ? (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.key}
                  className="group relative overflow-hidden rounded-xl border border-border"
                >
                  <img
                    src={photo.previewUrl}
                    alt="Turf"
                    className="aspect-video w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Set as cover"
                    onClick={() => {
                      setPhotos((current) =>
                        current.map((item) => ({ ...item, isCover: item.key === photo.key })),
                      );
                      setPhotoError(undefined);
                    }}
                    className="absolute left-2 top-2 rounded-full bg-black/60 p-2 text-white"
                  >
                    <FiStar className={photo.isCover ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => removePhoto(photo.key)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-destructive"
                  >
                    <FiTrash2 />
                  </button>
                  {photo.isCover && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-xs text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button
              className="mt-4"
              variant="outline"
              disabled={photos.length >= 10}
              onClick={() => fileRef.current?.click()}
            >
              <FiPlus />
              Add photos
            </Button>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={addPhotos}
            />
            {photoError && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {photoError}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {turf.images.map((url, index) => (
              <div key={url} className="relative overflow-hidden rounded-xl border border-border">
                <img
                  src={url}
                  alt={`Turf photo ${index + 1}`}
                  className="aspect-video w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-xs text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Basic details"
        description="Your venue name and customer-facing description."
        actions={actions('basic')}
      >
        {editing === 'basic' ? (
          <div className="space-y-5">
            <label className="block text-sm font-medium">
              Turf name
              <Input
                className="mt-2"
                maxLength={100}
                value={draft.name}
                errorMessage={errors.name}
                onChange={(event) => {
                  setDraft({ ...draft, name: event.target.value });
                  clearError('name');
                }}
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <Textarea
                className="mt-2 min-h-32"
                maxLength={1001}
                value={draft.description}
                errorMessage={errors.description}
                onChange={(event) => {
                  setDraft({ ...draft, description: event.target.value });
                  clearError('description');
                }}
              />
              <span className="mt-1 block text-right text-xs text-muted-foreground">
                {draft.description.length}/1000
              </span>
            </label>
          </div>
        ) : (
          <dl className="grid gap-5">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Turf name</dt>
              <dd className="mt-1 font-medium">{turf.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-6">
                {turf.description || 'No description added.'}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <Card
        title="Location"
        description="Your address and exact map position."
        actions={actions('location')}
      >
        {editing === 'location' ? (
          <div className="space-y-5">
            <label className="block text-sm font-medium">
              Street address
              <Input
                className="mt-2"
                value={draft.address.line1}
                errorMessage={errors.line1}
                onChange={(event) => changeAddress('line1', event.target.value)}
              />
            </label>
            <CountryStateCityFields
              value={locationValue}
              errors={{ country: errors.country, state: errors.state, city: errors.city }}
              onChange={(value) => {
                setDraft({
                  ...draft,
                  address: {
                    ...draft.address,
                    country: value.country?.name ?? '',
                    countryCode: value.country?.code ?? '',
                    state: value.state?.name ?? '',
                    stateCode: value.state?.code ?? '',
                    city: value.city?.name ?? '',
                    cityCode: value.city?.code ?? '',
                  },
                });
                setErrors((current) => ({
                  ...current,
                  country: undefined,
                  state: undefined,
                  city: undefined,
                }));
              }}
            />
            <label className="block text-sm font-medium">
              Pincode
              <Input
                className="mt-2"
                value={draft.address.pincode}
                errorMessage={errors.pincode}
                onChange={(event) => changeAddress('pincode', event.target.value)}
              />
            </label>
            <LocationMapPicker
              value={{ lat: draft.location.latitude, lng: draft.location.longitude }}
              onChange={(value) => {
                setDraft({ ...draft, location: { latitude: value.lat, longitude: value.lng } });
                clearError('coordinates');
              }}
            />
            {errors.coordinates && (
              <p role="alert" className="text-xs text-destructive">
                {errors.coordinates}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-muted p-5">
            <p className="font-medium">{turf.address.line1}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {turf.address.city}, {turf.address.state}, {turf.address.country} -{' '}
              {turf.address.pincode}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
