export const formPaneClassName = `
  min-w-0

  px-[var(--page-padding-x)]
  py-3

  md:py-6
`;

export const formPaneScrollClassName = `
  min-w-0

  px-[var(--page-padding-x)]
  py-3

  md:h-full
  md:min-h-0
  md:overflow-y-auto
  md:py-6

  [scrollbar-width:none]
  [-ms-overflow-style:none]
  [&::-webkit-scrollbar]:hidden
`;

export const formTitleFrameClassName = `
  w-full
  shrink-0

  px-[var(--page-padding-x)]
  pt-3

  md:px-[calc(var(--page-padding)+24px)]

  md:pt-6
  md:pb-12
`;
