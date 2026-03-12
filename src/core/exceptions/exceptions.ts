export const handleError = (error: any, actions: string): never => {
  console.error(error);
  throw new Error(actions);
};
