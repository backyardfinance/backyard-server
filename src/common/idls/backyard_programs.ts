/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/backyard_programs.json`.
 */
export type BackyardPrograms = {
  address: 'CUuCLr2DXer9TKTgW6bqJRxQEu4JEvfGV6DcTsoE2E96';
  metadata: {
    name: 'backyardPrograms';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'createVault';
      discriminator: [29, 237, 247, 208, 193, 82, 54, 135];
      accounts: [
        {
          name: 'master';
          writable: true;
          signer: true;
          address: '6RdP9KmhSwuUHRJ3T72TsVi3t4F2Luf7m3BRjh1w3Sor';
        },
        {
          name: 'vault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: 'arg';
                path: 'vaultId';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'vaultId';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'deposit';
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'inputToken';
        },
        {
          name: 'signerInputAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'inputToken';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'vaultInputAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'vault';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'inputToken';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'vaultLpAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'vault';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'fTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'lpToken';
          writable: true;
        },
        {
          name: 'signerLpAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
              {
                kind: 'account';
                path: 'tokenProgram2022';
              },
              {
                kind: 'account';
                path: 'lpToken';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'vault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: 'arg';
                path: 'vaultId';
              },
            ];
          };
        },
        {
          name: 'lendingAdmin';
        },
        {
          name: 'lending';
          writable: true;
        },
        {
          name: 'fTokenMint';
          writable: true;
        },
        {
          name: 'supplyTokenReservesLiquidity';
          writable: true;
        },
        {
          name: 'lendingSupplyPositionOnLiquidity';
          writable: true;
        },
        {
          name: 'rateModel';
        },
        {
          name: 'jupiterVault';
          writable: true;
        },
        {
          name: 'liquidity';
          writable: true;
        },
        {
          name: 'liquidityProgram';
          writable: true;
        },
        {
          name: 'rewardsRateModel';
        },
        {
          name: 'lendingProgram';
          address: '7tjE28izRUjzmxC1QNXnNwcc4N82CNYCexf3k8mw67s3';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'tokenProgram2022';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'vaultId';
          type: 'pubkey';
        },
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdraw';
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'outputToken';
        },
        {
          name: 'signerOutputAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'outputToken';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'vaultOutputAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'vault';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'outputToken';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'lpToken';
          writable: true;
        },
        {
          name: 'vaultLpAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'vault';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'fTokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'signerLpAta';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'signer';
              },
              {
                kind: 'account';
                path: 'tokenProgram2022';
              },
              {
                kind: 'account';
                path: 'lpToken';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'vault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: 'arg';
                path: 'vaultId';
              },
            ];
          };
        },
        {
          name: 'lendingAdmin';
        },
        {
          name: 'lending';
          writable: true;
        },
        {
          name: 'fTokenMint';
          writable: true;
        },
        {
          name: 'supplyTokenReservesLiquidity';
          writable: true;
        },
        {
          name: 'lendingSupplyPositionOnLiquidity';
          writable: true;
        },
        {
          name: 'rateModel';
        },
        {
          name: 'jupiterVault';
          writable: true;
        },
        {
          name: 'claimAccount';
          writable: true;
        },
        {
          name: 'liquidity';
          writable: true;
        },
        {
          name: 'liquidityProgram';
          writable: true;
        },
        {
          name: 'rewardsRateModel';
        },
        {
          name: 'lendingProgram';
          address: '7tjE28izRUjzmxC1QNXnNwcc4N82CNYCexf3k8mw67s3';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
        },
        {
          name: 'tokenProgram2022';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'vaultId';
          type: 'pubkey';
        },
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'lending';
      discriminator: [135, 199, 82, 16, 249, 131, 182, 241];
    },
    {
      name: 'lendingAdmin';
      discriminator: [42, 8, 33, 220, 163, 40, 210, 5];
    },
    {
      name: 'vault';
      discriminator: [211, 8, 232, 43, 2, 152, 117, 119];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'fTokenDepositInsignificant';
    },
    {
      code: 6001;
      name: 'fTokenMinAmountOut';
    },
    {
      code: 6002;
      name: 'fTokenMaxAmount';
    },
    {
      code: 6003;
      name: 'fTokenInvalidParams';
    },
    {
      code: 6004;
      name: 'fTokenRewardsRateModelAlreadySet';
    },
    {
      code: 6005;
      name: 'fTokenMaxAuthCountReached';
    },
    {
      code: 6006;
      name: 'fTokenLiquidityExchangePriceUnexpected';
    },
    {
      code: 6007;
      name: 'fTokenCpiToLiquidityFailed';
    },
    {
      code: 6008;
      name: 'fTokenOnlyAuth';
    },
    {
      code: 6009;
      name: 'fTokenOnlyAuthority';
    },
    {
      code: 6010;
      name: 'fTokenOnlyRebalancer';
    },
    {
      code: 6011;
      name: 'fTokenUserSupplyPositionRequired';
    },
    {
      code: 6012;
      name: 'fTokenLiquidityProgramMismatch';
    },
  ];
  types: [
    {
      name: 'lending';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mint';
            type: 'pubkey';
          },
          {
            name: 'fTokenMint';
            type: 'pubkey';
          },
          {
            name: 'lendingId';
            type: 'u16';
          },
          {
            name: 'decimals';
            type: 'u8';
          },
          {
            name: 'rewardsRateModel';
            type: 'pubkey';
          },
          {
            name: 'liquidityExchangePrice';
            type: 'u64';
          },
          {
            name: 'tokenExchangePrice';
            type: 'u64';
          },
          {
            name: 'lastUpdateTimestamp';
            type: 'u64';
          },
          {
            name: 'tokenReservesLiquidity';
            type: 'pubkey';
          },
          {
            name: 'supplyPositionOnLiquidity';
            type: 'pubkey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'lendingAdmin';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'pubkey';
          },
          {
            name: 'liquidityProgram';
            type: 'pubkey';
          },
          {
            name: 'rebalancer';
            type: 'pubkey';
          },
          {
            name: 'nextLendingId';
            type: 'u16';
          },
          {
            name: 'auths';
            type: {
              vec: 'pubkey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'vault';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'vaultId';
            type: 'pubkey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: 'seed';
      type: 'string';
      value: '"anchor"';
    },
  ];
};
