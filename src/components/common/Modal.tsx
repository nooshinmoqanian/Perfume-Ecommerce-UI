import React from 'react';

type Props = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose?: () => void;
};

export default function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {title && <h3 className="mb-4 text-lg font-medium">{title}</h3>}
        <div>{children}</div>
        <button
          onClick={onClose}
          className="mt-4 inline-block rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300"
        >
          بستن
        </button>
      </div>
    </div>
  );
}
