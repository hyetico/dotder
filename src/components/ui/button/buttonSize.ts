export type ButtonSize = "xs" | "sm" | "md" | "modal" | "title";

export const buttonLabelClassName = `
  text-[length:var(--button-font)]
  leading-[var(--button-line)]
`;

export const buttonSizeClassName: Record<ButtonSize, string> = {
  xs: `
    h-[var(--button-height-xs)]
    px-[var(--button-px-xs)]

    text-[length:var(--button-font-xs)]!
    leading-[var(--button-line-xs)]!
  `,
  sm: `
    h-[var(--button-height)]
    px-[var(--button-px)]
  `,
  md: `
    h-[var(--button-height-action)]
    px-[var(--button-px-action)]
  `,
  modal: `
    h-[var(--button-height-modal)]
    px-[var(--button-px-modal)]
  `,
  title: `
    h-[var(--button-height-title)]
    px-[var(--button-px-title)]
  `,
};

export const buttonIconOnlyClassName: Record<ButtonSize, string> = {
  xs: `
    size-[var(--button-height-xs)]
    justify-center
    px-0
  `,
  sm: `
    size-[var(--button-height)]
    justify-center
    px-0
  `,
  md: `
    size-[var(--button-height-action)]
    justify-center
    px-0
  `,
  modal: `
    size-[var(--button-height-modal)]
    justify-center
    px-0
  `,
  title: `
    size-[var(--button-height-title)]
    justify-center
    px-0
  `,
};

export const buttonIconHitClassName = `
  relative

  before:absolute
  before:top-1/2
  before:left-1/2
  before:size-[var(--button-icon-hit)]
  before:-translate-x-1/2
  before:-translate-y-1/2
  before:content-['']
`;
