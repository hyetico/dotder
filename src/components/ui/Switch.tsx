type SwitchProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function Switch({ checked, label, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-[background-image,background-color] duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary-gradient" : "bg-gray-200"
      } `}
    >
      <span
        aria-hidden
        className={`block h-5 w-5 rounded-full bg-[var(--color-surface)] shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        } `}
      />
    </button>
  );
}
