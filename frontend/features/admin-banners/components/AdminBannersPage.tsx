'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BannerDTO } from '@turfhood/shared';
import { Button, Heading, Input, Modal, Textarea, useToast } from '@/components/ui';
import { createBanner, deleteBanner, listAdminBanners } from '../actions/bannerApi';

export function AdminBannersPage() {
  const [items, setItems] = useState<BannerDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const load = useCallback(async () => setItems(await listAdminBanners()), []);
  useEffect(() => {
    void listAdminBanners().then(setItems);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const image = form.get('image');
    if (!(image instanceof File) || !image.size) {
      showToast('Choose a banner image.', 'error');
      return;
    }
    setSaving(true);
    try {
      await createBanner(String(form.get('title')), String(form.get('description')), image);
      showToast('Banner added successfully.');
      setOpen(false);
      await load();
    } catch {
      showToast('Failed to add banner.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: BannerDTO) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteBanner(item.id);
      showToast('Banner deleted.');
      await load();
    } catch {
      showToast('Failed to delete banner.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Heading variant="h1">Banners</Heading>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed Cloudinary image */}
            <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-4"
                onClick={() => void remove(item)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No banners added yet.
        </p>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Banner">
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <div>
            <label htmlFor="banner-title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <Input id="banner-title" name="title" required maxLength={100} />
          </div>
          <div>
            <label htmlFor="banner-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <Textarea id="banner-description" name="description" required maxLength={240} />
          </div>
          <div>
            <label htmlFor="banner-image" className="mb-1 block text-sm font-medium">
              Image
            </label>
            <Input
              id="banner-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
            />
          </div>
          <Button type="submit" loading={saving} className="w-full">
            Add Banner
          </Button>
        </form>
      </Modal>
    </div>
  );
}
