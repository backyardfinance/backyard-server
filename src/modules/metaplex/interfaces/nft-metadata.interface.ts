export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
  };
}
