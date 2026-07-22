'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { validateDocumentFile } from '../lib/validateDocumentFile';

export interface DocumentEntry {
  file: File;
  type: string;
}

export interface DocumentUploadProps {
  documents: DocumentEntry[];
  onChange: (documents: DocumentEntry[]) => void;
  errorMessage?: string;
}

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'Electricity Bill', value: 'electricity_bill' },
  { label: 'Lease Agreement', value: 'lease_agreement' },
  { label: 'Ownership Deed', value: 'ownership_deed' },
  { label: 'Other', value: 'other' },
];

/** Multi-file document upload — each file is client-validated and paired with a document type before being added to the list. */
export function DocumentUpload({ documents, onChange, errorMessage }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState(DOCUMENT_TYPE_OPTIONS[0]?.value ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setLocalError(validation.error ?? 'Invalid file.');
      return;
    }
    setLocalError(null);
    onChange([...documents, { file, type: pendingType }]);
  };

  const removeAt = (index: number) => onChange(documents.filter((_, i) => i !== index));

  return (
    <div>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
        <Select
          value={pendingType}
          onChange={(event) => setPendingType(event.target.value)}
          options={DOCUMENT_TYPE_OPTIONS}
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Add document
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {documents.length > 0 && (
        <ul className="flex flex-col" style={{ gap: 8 }}>
          {documents.map((doc, index) => (
            <li
              key={`${doc.file.name}-${index}`}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="flex items-center" style={{ gap: 8 }}>
                <FileText className="h-4 w-4" />
                {doc.file.name} (
                {DOCUMENT_TYPE_OPTIONS.find((option) => option.value === doc.type)?.label})
              </span>
              <button type="button" onClick={() => removeAt(index)} aria-label="Remove document">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(localError ?? errorMessage) && (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {localError ?? errorMessage}
        </p>
      )}
    </div>
  );
}
