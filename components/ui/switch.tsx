"use client";

import { useState } from "react";

export function Switch({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  const [internal, setInternal] = useState(checked);
  const active = internal;

  const toggle = () => {
    const next = !active;
    setInternal(next);
    onChange(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        active ? "bg-sky-500" : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 transition ${
          active ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}