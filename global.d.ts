export {};

declare global {
  interface Window {
    Jupiter?: {
      init: (config: {
        displayMode?: string;
        integratedTargetId?: string;
        strictTokenList?: boolean;
        endpoint?: string;
        formProps?: {
          initialInputMint?: string;
          initialOutputMint?: string;
          [key: string]: unknown;
        };
        theme?: string;
        [key: string]: unknown;
      }) => void;
      [key: string]: unknown;
    };
  }
}
