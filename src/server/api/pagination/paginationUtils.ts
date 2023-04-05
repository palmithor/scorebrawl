export const getCursor = ({ cursor }: { cursor?: string }) =>
  cursor ? { id: cursor } : undefined;
