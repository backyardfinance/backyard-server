export interface FluidToken {
  assetAddress?: string;
  address?: string;
  asset?: {
    decimals?: number;
    price?: number | string;
  };
  decimals?: number;
  price?: number | string;

  totalAssets?: number | string;
  totalSupply?: number | string;

  totalRate?: number | string;
  supplyRate?: number | string;
  rewardsRate?: number | string;
}

export interface VaultFluidToken extends FluidToken {
  vaultId: string;
}
