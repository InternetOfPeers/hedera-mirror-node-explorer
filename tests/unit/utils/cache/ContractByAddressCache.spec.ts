// noinspection DuplicatedCode

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


import {describe, expect, test} from 'vitest'
import {SAMPLE_CONTRACT} from "../../Mocks";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";

describe("ContractByAddressCache", () => {

    test("ContractByAddressCache", async () => {

        expect(ContractByAddressCache.instance.isEmpty()).toBeTruthy()

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.evm_address
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        // 1) First lookup() triggers http requests
        const contractAddress = SAMPLE_CONTRACT.evm_address
        const contract = await ContractByAddressCache.instance.lookup(contractAddress)
        expect(contract).toStrictEqual(SAMPLE_CONTRACT)
        expect(mock.history.get.length).toBe(1)

        // 2) Second lookup() triggers no http requests
        mock.resetHistory()
        const contract2 = await ContractByAddressCache.instance.lookup(contractAddress)
        await flushPromises()
        expect(contract2).toStrictEqual(SAMPLE_CONTRACT)
        expect(mock.history.get.length).toBe(0)

        // Checks that ContractByAddressCache has been populated
        if (contract?.contract_id) {
            expect(ContractByIdCache.instance.contains(contract.contract_id))
        }

        mock.restore()
    })
})
