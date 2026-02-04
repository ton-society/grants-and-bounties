import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { FailureContract } from '../build/failure_contract/failure_contract_FailureContract';
import '@ton/test-utils';

describe('FailureContract', () => {
    let blockchain: Blockchain;
    let failureContract: SandboxContract<FailureContract>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        failureContract = blockchain.openContract(await FailureContract.fromInit());
        deployer = await blockchain.treasury('deployer');

        const deployResult = await failureContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: failureContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should fail with exit code 37 on "fail" message', async () => {
        // Contract balance starts at ~0.05 TON from deployment
        // Let's top up to exactly 0.1 TON balance
        await deployer.send({
            to: failureContract.address,
            value: toNano('0.05'),
        });

        const result = await failureContract.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            'fail'
        );

        // Based on the cookbook, this should trigger exit code 37
        // because the second message tries to send "RemainingValue" (64)
        // without accounting for the first message's consumption.
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: failureContract.address,
            success: false,
            actionResultCode: 37,
        });
    });

    it('should fail with exit code 37 on "fail_dies" message', async () => {
        const result = await failureContract.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            'fail_dies'
        );

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: failureContract.address,
            success: false,
            actionResultCode: 37,
        });
    });

    it('should succeed on "fixed_1" message', async () => {
        const result = await failureContract.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            'fixed_1'
        );

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: failureContract.address,
            success: true,
        });
    });

    it('should succeed on "fixed_2" message', async () => {
        const result = await failureContract.send(
            deployer.getSender(),
            {
                value: toNano('0.1'),
            },
            'fixed_2'
        );

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: failureContract.address,
            success: true,
        });
    });
});
