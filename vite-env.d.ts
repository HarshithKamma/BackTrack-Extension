// Handle CSS inline imports for Shadow DOM injection
declare module "*.css?inline" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: string;
  export default content;
}
