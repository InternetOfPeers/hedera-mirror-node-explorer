/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
    AccountUpdateTransaction,
    NftId,
    Signer,
    TokenAssociateTransaction,
    TokenDissociateTransaction,
    TokenId,
    TransactionResponse
} from "@hashgraph/sdk";
import {TransactionID} from "@/utils/TransactionID";
import {Transaction} from "@/schemas/HederaSchemas";
import {waitFor} from "@/utils/TimerUtils";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache";
import {WalletDriverCancelError} from "@/utils/wallet/WalletDriverError";

export abstract class WalletDriver_Hedera extends WalletDriver {

    //
    // Public
    //

    public async changeStaking(accountId: string, stakedNodeId: number|null, stakedAccountId: string|null, declineReward: boolean|null): Promise<string> {

        const trans = new AccountUpdateTransaction()
        trans.setAccountId(accountId)
        if (stakedNodeId !== null) {
            trans.setStakedNodeId(stakedNodeId)
        } else if (stakedAccountId !== null) {
            trans.setStakedAccountId(stakedAccountId)
        } else {
            trans.setStakedNodeId(-1)
            trans.setStakedAccountId("0.0.0")
        }
        if (declineReward !== null) {
            trans.setDeclineStakingReward(declineReward)
        }

        const result = await this.executeTransaction(accountId, trans)

        return Promise.resolve(result)
    }

    public async approveHbarAllowance(accountId: string, spender: string, amount: number): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        trans.approveHbarAllowance(accountId, spender, amount)
        const result = await this.executeTransaction(accountId, trans)

        return Promise.resolve(result)
    }

    public async approveTokenAllowance(accountId: string, token: string, spender: string, amount: number): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        trans.approveTokenAllowance(token, accountId, spender, amount)
        const result = await this.executeTransaction(accountId, trans)

        return Promise.resolve(result)
    }

    public async approveNFTAllowance(accountId: string, token: string, spender: string, serialNumbers: number[]): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        if (1 <= serialNumbers.length && serialNumbers.length <= 20) {
            const tid = TokenId.fromString(token)
            for (const sn of serialNumbers) {
                trans.approveTokenNftAllowance(new NftId(tid, sn), accountId, spender)
            }
        } else if (serialNumbers.length == 0) {
            trans.approveTokenNftAllowanceAllSerials(token, accountId, spender)
        } else {
            throw this.callFailure("Invalid serial number count (" + serialNumbers.length + ")")
        }
        const result = await this.executeTransaction(accountId, trans)

        return Promise.resolve(result)
    }

    //
    // public async deleteNftAllowance(token: string, serialNumbers: number[]): Promise<string> {
    //
    //    const trans = new AccountAllowanceDeleteTransaction()
    //    if (1 <= serialNumbers.length && serialNumbers.length <= 20) {
    //         const tid = TokenId.fromString(token)
    //         for (const sn of serialNumbers) {
    //             trans.deleteAllTokenNftAllowances(new NftId(tid, sn), this.accountId.value)
    //         }
    //     } else {
    //         throw this.callFailure("Invalid serial number count (" + serialNumbers.length + ")")
    //     }
    //     const result = await this.executeTransaction(trans)
    //
    //     return Promise.resolve(result)
    // }

    //
    // Public (to be subclassed)
    //

    public abstract makeSigner(accountId: string): Signer|null

    public abstract isCancelError(reason: unknown): boolean

    //
    // WalletDriver
    //

    public async associateToken(accountId: string, tokenId: string): Promise<string> {
        let result: string

        // https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/associate-tokens-to-an-account
        const trans = new TokenAssociateTransaction()
        trans.setAccountId(accountId)
        trans.setTokenIds([tokenId])
        result = await this.executeTransaction(accountId, trans)
        await this.waitForTransactionSurfacing(result)

        return Promise.resolve(result)
    }

    public async dissociateToken(accountId: string, tokenId: string): Promise<string> {
        let result: string

        // https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/dissociate-tokens-from-an-account
        const trans = new TokenDissociateTransaction()
        trans.setAccountId(accountId)
        trans.setTokenIds([tokenId])
        result = await this.executeTransaction(accountId, trans)
        await this.waitForTransactionSurfacing(result)

        return Promise.resolve(result)
    }

    //
    // Protected
    //

    protected async executeTransaction(
        accountId: string,
        t: AccountAllowanceApproveTransaction
            |AccountUpdateTransaction
            |AccountAllowanceDeleteTransaction
            |TokenAssociateTransaction
            |TokenDissociateTransaction): Promise<string> {
        let result: Promise<string>

        const signer = this.makeSigner(accountId)
        if (signer !== null) {
            let response: TransactionResponse|undefined
            try {
                await t.freezeWithSigner(signer)
                response = await signer.call(t)
            } catch(reason) {
                if (this.isCancelError(reason)) {
                    throw new WalletDriverCancelError()
                } else {
                    throw this.callFailure(reason instanceof Error ? reason.message : JSON.stringify(reason))
                }
            }
            if (response) {
                const transactionId = TransactionID.normalize(response.transactionId.toString(), false);
                result = Promise.resolve(transactionId)
            } else { // When user clicks on "Reject" button HashConnectSigner.call() returns undefined :(
                throw new WalletDriverCancelError()
            }
        } else {
            throw this.callFailure("Signer not found (bug)")
        }
        return result
    }


    private async waitForTransactionSurfacing(transactionId: string): Promise<Transaction | string> {
        let result: Promise<Transaction | string>

        try {
            let counter = 10
            let transaction: Transaction|null = null
            while (counter > 0 && transaction === null) {
                await waitFor(3000)
                transaction = await TransactionByIdCache.instance.lookup(transactionId, true)
                counter -= 1
            }
            result = Promise.resolve(transaction ?? transactionId)
        } catch {
            result = Promise.resolve(transactionId)
        }

        return result
    }
}
