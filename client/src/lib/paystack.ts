export function openPaystackPopup(options: {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}): void {
  const handler = (window as any).PaystackPop.setup({
    key: options.publicKey,
    email: options.email,
    amount: options.amount,
    ref: options.reference,
    onClose: options.onClose,
    callback: (response: { reference: string }) => options.onSuccess(response.reference),
  });
  handler.openIframe();
}
